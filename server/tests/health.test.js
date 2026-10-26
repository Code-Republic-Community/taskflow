const request = require("supertest");
const createApp = require("../src/app");
const { connectDB, disconnectDB } = require("../src/data/db");

describe("GET /api/v1/health", () => {
  const app = createApp();

  it("reports db disconnected when MongoDB is not connected", async () => {
    const res = await request(app).get("/api/v1/health");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ data: { status: "ok", db: "disconnected" } });
  });

  describe("with a database connection", () => {
    beforeAll(() => connectDB(process.env.MONGODB_URI));
    afterAll(() => disconnectDB());

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
