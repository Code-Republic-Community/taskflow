import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import type { NextFunction, Request, Response } from "express";

import { createApp } from "../src/app.ts";
import { AUTH_ERRORS, AUTH_SCHEME } from "../src/constants/auth.constants.ts";
import { NOTIFICATION_ERRORS } from "../src/constants/notification.constants.ts";
import { Notification } from "../src/models/Notification.ts";
import { connectDB, disconnectDB } from "../src/data/db.ts";

import type { User } from "../src/types/auth.types.ts";

import * as db from "./helpers/db.ts";

const TEST_USERS = vi.hoisted(() => ({
  alice: {
    id: "64b000000000000000000001",
    name: "Alice",
    email: "alice@example.com",
    avatarColor: "#FF0000",
    role: "user" as const,
    active: true,
  },
  bob: {
    id: "64b000000000000000000002",
    name: "Bob",
    email: "bob@example.com",
    avatarColor: "#0000FF",
    role: "user" as const,
    active: true,
  },
}));

// Use fake auth until TF-2 sets req.user.
vi.mock("../src/middlewares/requireAuth.ts", async () => {
  const { AUTH_ERRORS, AUTH_SCHEME } = await import("../src/constants/auth.constants.ts");
  const { AppError } = await import("../src/utils/AppError.ts");
  const { Types } = await import("mongoose");

  const fakeRequireAuth = async (req: Request, _res: Response, next: NextFunction) => {
    const authorization = req.headers.authorization;
    const [scheme, userId] = typeof authorization === "string" ? authorization.split(" ") : [];

    if (scheme !== AUTH_SCHEME || !userId) {
      throw new AppError(AUTH_ERRORS.MISSING_TOKEN.message, AUTH_ERRORS.MISSING_TOKEN.statusCode);
    }

    const user = Object.values(TEST_USERS).find((candidate) => candidate.id === userId);
    if (!user) {
      throw new AppError(AUTH_ERRORS.USER_NOT_FOUND.message, AUTH_ERRORS.USER_NOT_FOUND.statusCode);
    }

    const { id, ...userFields } = user;
    req.user = { ...userFields, _id: new Types.ObjectId(id) };
    next();
  };

  return { requireAuth: fakeRequireAuth };
});

const BASE = "/api/v1/notifications";
const app = createApp();

function makeUser(testUser: typeof TEST_USERS.alice): User {
  const { id, ...user } = testUser;
  return { ...user, _id: new mongoose.Types.ObjectId(id) };
}

const user1 = makeUser(TEST_USERS.alice);
const user2 = makeUser(TEST_USERS.bob);

const issueId = new mongoose.Types.ObjectId();

// Add these small models only when the real models are not loaded.
const TempUser =
  mongoose.models.User ??
  mongoose.model(
    "User",
    new mongoose.Schema({
      name: String,
      email: String,
      avatarColor: String,
    }),
  );

const TempIssue =
  mongoose.models.Issue ?? mongoose.model("Issue", new mongoose.Schema({ key: String }));

async function connectTestDatabase(): Promise<mongoose.Connection> {
  const uri = new URL(process.env.MONGODB_URI ?? "");
  // Keep this suite in its own database so parallel tests cannot clear its data.
  uri.pathname = "/taskflow-test-notifications";
  return connectDB(uri.toString());
}

function authHeader(user: User): string {
  return `${AUTH_SCHEME} ${user._id.toString()}`;
}

function getAsUser(path: string, user: User) {
  return request(app).get(path).set("Authorization", authHeader(user));
}

function patchAsUser(path: string, user: User) {
  return request(app).patch(path).set("Authorization", authHeader(user));
}

function requestWithoutAuth(method: "GET" | "PATCH", path: string) {
  return method === "GET" ? request(app).get(path) : request(app).patch(path);
}

function requestAsUser(method: "GET" | "PATCH", path: string, user: User) {
  return method === "GET" ? getAsUser(path, user) : patchAsUser(path, user);
}

async function seedUsersAndIssue(): Promise<void> {
  await TempUser.collection.insertMany([
    { ...user1, passwordHash: "secret" },
    { ...user2, passwordHash: "secret" },
  ]);
  await TempIssue.collection.insertOne({ _id: issueId, key: "TF-42", title: "Fix the board" });
}

function createNotification(recipient: User, minutesAgo: number, read = false) {
  return Notification.create({
    userId: recipient._id,
    actorId: recipient === user1 ? user2._id : user1._id,
    type: "assigned",
    issue: issueId,
    message: "You were assigned to TF-42",
    read,
    createdAt: new Date(Date.now() - minutesAgo * 60_000),
  });
}

beforeAll(() => connectTestDatabase());
beforeEach(seedUsersAndIssue);
afterEach(() => db.clearDatabase());
afterAll(() => disconnectDB());

describe("notification route authentication", () => {
  it.each([
    ["GET", BASE],
    ["GET", `${BASE}/unread-count`],
    ["PATCH", `${BASE}/64b000000000000000000001/read`],
    ["PATCH", `${BASE}/read-all`],
  ] as const)("requires authentication for %s %s", async (method, path) => {
    const res = await requestWithoutAuth(method, path);

    expect(res.status).toBe(AUTH_ERRORS.MISSING_TOKEN.statusCode);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
    expect(res.body.error.message).toBe(AUTH_ERRORS.MISSING_TOKEN.message);
  });
});

describe("empty notification results", () => {
  it.each([
    ["GET", BASE, { data: [], meta: { page: 1, limit: 20, total: 0 } }],
    ["GET", `${BASE}/unread-count`, { data: { count: 0 } }],
    ["PATCH", `${BASE}/read-all`, { data: { updated: 0 } }],
  ] as const)("returns an empty result for %s %s", async (method, path, expected) => {
    const res = await requestAsUser(method, path, user1);

    expect(res.status).toBe(200);
    expect(res.body).toEqual(expected);
  });
});

describe("GET /api/v1/notifications", () => {
  it("returns the user's notifications newest first with actor and issue details", async () => {
    const older = await createNotification(user1, 10);
    const newer = await createNotification(user1, 1);
    await createNotification(user2, 5);

    const res = await getAsUser(BASE, user1);

    expect(res.status).toBe(200);
    expect(res.body.meta).toEqual({ page: 1, limit: 20, total: 2 });
    expect(res.body.data.map((n: { _id: string }) => n._id)).toEqual([
      newer._id.toString(),
      older._id.toString(),
    ]);

    const [first] = res.body.data;
    expect(first.actorId).toEqual({
      _id: user2._id.toString(),
      name: user2.name,
      email: user2.email,
      avatarColor: user2.avatarColor,
    });
    expect(first.issue).toEqual({ _id: issueId.toString(), key: "TF-42" });
    expect(first).toMatchObject({
      type: "assigned",
      message: "You were assigned to TF-42",
      read: false,
    });
  });

  it("paginates results", async () => {
    for (let index = 0; index < 5; index++) await createNotification(user1, index);

    const res = await getAsUser(`${BASE}?page=2&limit=2`, user1);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.meta).toEqual({ page: 2, limit: 2, total: 5 });
  });

  it("returns 400 when page is invalid", async () => {
    const res = await getAsUser(`${BASE}?page=abc`, user1);

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });
});

describe("GET /api/v1/notifications/unread-count", () => {
  it("counts only the user's unread notifications", async () => {
    await createNotification(user1, 3);
    await createNotification(user1, 2);
    await createNotification(user1, 1, true);
    await createNotification(user2, 1);

    const res = await getAsUser(`${BASE}/unread-count`, user1);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ data: { count: 2 } });
  });
});

describe("PATCH /api/v1/notifications/:id/read", () => {
  it("marks the user's notification as read", async () => {
    const notification = await createNotification(user1, 1);

    const res = await patchAsUser(`${BASE}/${notification._id}/read`, user1);

    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ _id: notification._id.toString(), read: true });
    expect((await Notification.findById(notification._id))?.read).toBe(true);

    const repeated = await patchAsUser(`${BASE}/${notification._id}/read`, user1);
    expect(repeated.status).toBe(200);
    expect(repeated.body.data.read).toBe(true);
  });

  it("returns 404 for another user's notification without changing it", async () => {
    const notification = await createNotification(user2, 1);

    const res = await patchAsUser(`${BASE}/${notification._id}/read`, user1);

    expect(res.status).toBe(NOTIFICATION_ERRORS.NOT_FOUND.statusCode);
    expect(res.body.error.code).toBe("NOT_FOUND");
    expect(res.body.error.message).toBe(NOTIFICATION_ERRORS.NOT_FOUND.message);
    expect((await Notification.findById(notification._id))?.read).toBe(false);
  });

  it("returns 404 when the notification does not exist", async () => {
    const res = await patchAsUser(`${BASE}/${new mongoose.Types.ObjectId()}/read`, user1);

    expect(res.status).toBe(NOTIFICATION_ERRORS.NOT_FOUND.statusCode);
    expect(res.body.error.message).toBe(NOTIFICATION_ERRORS.NOT_FOUND.message);
  });

  it("returns 400 when the id is invalid", async () => {
    const res = await patchAsUser(`${BASE}/not-an-id/read`, user1);

    expect(res.status).toBe(NOTIFICATION_ERRORS.INVALID_ID.statusCode);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.error.details).toEqual([
      { field: "id", message: NOTIFICATION_ERRORS.INVALID_ID.message },
    ]);
  });
});

describe("PATCH /api/v1/notifications/read-all", () => {
  it("marks only the user's unread notifications as read and returns how many", async () => {
    await createNotification(user1, 3);
    await createNotification(user1, 2);
    await createNotification(user1, 1, true);
    const otherUsersNotification = await createNotification(user2, 1);

    const res = await patchAsUser(`${BASE}/read-all`, user1);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ data: { updated: 2 } });
    expect(await Notification.countDocuments({ userId: user1._id, read: false })).toBe(0);
    expect((await Notification.findById(otherUsersNotification._id))?.read).toBe(false);
  });
});
