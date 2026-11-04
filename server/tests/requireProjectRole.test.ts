import { describe, expect, it, vi } from "vitest";
import express, { type Express, type RequestHandler } from "express";
import request from "supertest";
import { errorHandler } from "../src/middlewares/errorHandler.ts";
import { requireProjectRole } from "../src/middlewares/requireProjectRole.ts";
import { Types } from "mongoose";
import type { Role } from "../src/models/constants.ts";
import type { ProjectRef } from "../src/services/project.service.ts";

// ----- Mock data -----

function mockUser(role: Role) {
  return {
    _id: new Types.ObjectId(),
    name: "Test",
    email: "t@example.com",
    avatarColor: "#000",
    role,
    active: true,
  };
}

const users = {
  admin: mockUser("admin"),
  owner: mockUser("user"),
  member: mockUser("user"),
  viewer: mockUser("user"),
  outsider: mockUser("user"),
};

const projects: ProjectRef[] = [
  {
    _id: new Types.ObjectId(),
    key: "TF",
    issueCounter: 0,
    members: [
      { user: users.owner._id, role: "owner" },
      { user: users.member._id, role: "member" },
      { user: users.viewer._id, role: "viewer" },
    ],
  },
];

// Replaces the database lookup (TF-4) with the mock projects.
// The function reads `projects` only when a test calls it, after the data above exists.
vi.mock("../src/services/project.service.ts", () => ({
  findProjectByKey: async (key: string) => projects.find((p) => p.key === key) ?? null,
}));

type UserName = keyof typeof users;

// Stands in for requireAuth: the x-test-user header picks the mock user.
const fakeAuth: RequestHandler = (req, _res, next) => {
  const name = req.header("x-test-user") as UserName | undefined;
  if (name) req.user = users[name];
  next();
};

const show: RequestHandler = (req, res) => {
  res.json({ data: { key: req.project?.key } });
};

function buildApp(): Express {
  const app = express();
  app.use(fakeAuth);
  app.get("/projects/:key/viewer-area", requireProjectRole("viewer"), show);
  app.get("/projects/:key/member-area", requireProjectRole("member"), show);
  app.get("/projects/:key/owner-area", requireProjectRole("owner"), show);
  app.get("/issues/:issueKey/area", requireProjectRole("member"), show);
  app.use(errorHandler);
  return app;
}

const app = buildApp();
const get = (path: string, as?: UserName) => {
  const req = request(app).get(path);
  return as ? req.set("x-test-user", as) : req;
};

describe("requireProjectRole", () => {
  const areas = ["viewer-area", "member-area", "owner-area"] as const;
  const expected: Record<UserName, number[]> = {
    viewer: [200, 403, 403],
    member: [200, 200, 403],
    owner: [200, 200, 200],
    admin: [200, 200, 200],
    outsider: [404, 404, 404],
  };

  for (const [name, statuses] of Object.entries(expected) as [UserName, number[]][]) {
    it(`${name}: ${statuses.join(" / ")} on viewer / member / owner areas`, async () => {
      for (const [i, area] of areas.entries()) {
        const res = await get(`/projects/TF/${area}`, name);
        expect(res.status, `${name} on ${area}`).toBe(statuses[i]);
      }
    });
  }

  it("puts the project on req.project", async () => {
    const res = await get("/projects/TF/viewer-area", "viewer");

    expect(res.body).toEqual({ data: { key: "TF" } });
  });

  it("answers 403 FORBIDDEN when the role is too low", async () => {
    const res = await get("/projects/TF/owner-area", "member");

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe("FORBIDDEN");
  });

  it("answers the same 404 for a non-member and for a missing project", async () => {
    const outsider = await get("/projects/TF/viewer-area", "outsider");
    const missing = await get("/projects/XX/viewer-area", "owner");

    expect(outsider.status).toBe(404);
    expect(missing.status).toBe(404);
    expect(outsider.body).toEqual(missing.body);
    expect(outsider.body.error.code).toBe("NOT_FOUND");
  });

  it("works on /issues/:issueKey routes", async () => {
    expect((await get("/issues/TF-1/area", "member")).status).toBe(200);
    expect((await get("/issues/TF-1/area", "viewer")).status).toBe(403);
    expect((await get("/issues/TF-1/area", "outsider")).status).toBe(404);
    expect((await get("/issues/TF-1/area", "admin")).status).toBe(200);
    expect((await get("/issues/abc/area", "owner")).status).toBe(404);
  });

  it("answers 401 when there is no authenticated user", async () => {
    const res = await get("/projects/TF/viewer-area");

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
  });
});
