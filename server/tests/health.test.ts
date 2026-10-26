import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.ts";
import * as db from "./helpers/db.ts";

describe("GET /api/v1/health", () => {
  const app = createApp();

  it("reports db disconnected when MongoDB is not connected", async () => {
    const res = await request(app).get("/api/v1/health");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ data: { status: "ok", db: "disconnected" } });
  });

  describe("with a database connection", () => {
    beforeAll(() => db.connect());
    afterEach(() => db.clearDatabase());
    afterAll(() => db.disconnect());

    it("returns 200 with status ok and db connected", async () => {
      const res = await request(app).get("/api/v1/health");

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ data: { status: "ok", db: "connected" } });
    });
  });
});

describe("unknown routes", () => {
  it("returns 404 in the error format", async () => {
    const res = await request(createApp()).get("/api/v1/does-not-exist");

    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      error: { code: "NOT_FOUND", message: "Route GET /api/v1/does-not-exist not found" },
    });
  });
});
