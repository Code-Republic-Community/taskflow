import { describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.ts";
import jwt from "jsonwebtoken";
import { config } from "../src/config/env.ts";

describe("GET /api/v1/auth", () => {
  const app = createApp();
  //TODO: after finishing TF-2
  //   const generateTestToken = (payload: object) => {
  //     return jwt.sign(payload, config.jwtSecret, { expiresIn: "1h" });
  //   };

  it("returns 401 when there is no token", async () => {
    const res = await request(app).get("/api/v1/auth/me");

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
  });

  it("returns 401 when there is no Bearer", async () => {
    const res = await request(app).get("/api/v1/auth/me").set("Authorization", "Basic abc");

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
    expect(res.body.error.message).toBe("Invalid token type");
  });

  it("returns 401 when there is no token", async () => {
    const res = await request(app).get("/api/v1/auth/me").set("Authorization", "Bearer");

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
    expect(res.body.error.message).toBe("Invalid token type");
  });

  it("returns 401 when token is invalid", async () => {
    const res = await request(app).get("/api/v1/auth/me").set("Authorization", "Bearer abc");

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
    expect(res.body.error.message).toBe("Invalid token");
  });

  // Signs a token with the test secret; a negative expiresIn makes it already expired.
  const signToken = (expiresIn: number) =>
    jwt.sign({ sub: "507f1f77bcf86cd799439011" }, config.jwtSecret, { expiresIn });

  it("returns 401 when the token is expired", async () => {
    const token = signToken(-10);

    const res = await request(app).get("/api/v1/auth/me").set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
    expect(res.body.error.message).toBe("Token expired");
  });

  it.todo("returns the current user with a valid token", async () => {});

  it.todo("returns 401 when the user is deactivated");
});
