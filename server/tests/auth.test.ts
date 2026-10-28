import { describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.ts";
import jwt from "jsonwebtoken";
import { config } from "../src/config/env.ts";
import { AUTH_ERRORS, AUTH_SCHEME } from "../src/constants/auth.constants.ts";

describe("GET /api/v1/auth", () => {
  const app = createApp();
  //TODO: after finishing TF-2
  //   const generateTestToken = (payload: object) => {
  //     return jwt.sign(payload, config.jwtSecret, { expiresIn: "1h" });
  //   };

  it("returns 401 when there is no token", async () => {
    const res = await request(app).get("/api/v1/auth/me");

    expect(res.status).toBe(AUTH_ERRORS.MISSING_TOKEN.statusCode);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
  });

  it(`returns 401 when there is no ${AUTH_SCHEME}`, async () => {
    const res = await request(app).get("/api/v1/auth/me").set("Authorization", "Basic abc");

    expect(res.status).toBe(AUTH_ERRORS.INVALID_TOKEN_TYPE.statusCode);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
    expect(res.body.error.message).toBe(AUTH_ERRORS.INVALID_TOKEN_TYPE.message);
  });

  it("returns 401 when there is no token", async () => {
    const res = await request(app).get("/api/v1/auth/me").set("Authorization", AUTH_SCHEME);

    expect(res.status).toBe(AUTH_ERRORS.INVALID_TOKEN_TYPE.statusCode);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
    expect(res.body.error.message).toBe(AUTH_ERRORS.INVALID_TOKEN_TYPE.message);
  });

  it("returns 401 when token is invalid", async () => {
    const res = await request(app)
      .get("/api/v1/auth/me")
      .set("Authorization", `${AUTH_SCHEME} abc`);

    expect(res.status).toBe(AUTH_ERRORS.INVALID_TOKEN.statusCode);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
    expect(res.body.error.message).toBe(AUTH_ERRORS.INVALID_TOKEN.message);
  });

  // Signs a token with the test secret; a negative expiresIn makes it already expired.
  const signToken = (expiresIn: number) =>
    jwt.sign({ sub: "507f1f77bcf86cd799439011" }, config.jwtSecret, { expiresIn });

  it("returns 401 when the token is expired", async () => {
    const token = signToken(-10);

    const res = await request(app)
      .get("/api/v1/auth/me")
      .set("Authorization", `${AUTH_SCHEME} ${token}`);

    expect(res.status).toBe(AUTH_ERRORS.TOKEN_EXPIRED.statusCode);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
    expect(res.body.error.message).toBe(AUTH_ERRORS.TOKEN_EXPIRED.message);
  });

  it.todo("returns the current user with a valid token", async () => {});

  it.todo("returns 401 when the user is deactivated");
});
