const express = require("express");
const mongoose = require("mongoose");
const request = require("supertest");
const { z } = require("zod");
const createApp = require("../src/app");
const AppError = require("../src/utils/AppError");
const validate = require("../src/middlewares/validate");
const errorHandler = require("../src/middlewares/errorHandler");

// A test-only app: the routes below throw on purpose and are never part of src/app.js.
function buildTestApp() {
  const app = express();
  app.use(express.json());

  app.get("/zod", () => {
    z.object({ title: z.string() }).parse({ title: 42 });
  });
  app.post("/validated", validate({ body: z.object({ title: z.string().min(3) }) }), (req, res) =>
    res.json({ data: req.body }),
  );
  app.get("/app-error", () => {
    throw new AppError("Project not found", 404, "NOT_FOUND");
  });
  app.get("/app-error-details", () => {
    throw new AppError("Not allowed", 403, "FORBIDDEN", { requiredRole: "owner" });
  });
  app.get("/plain", () => {
    throw new Error("boom");
  });
  app.get("/async", async () => {
    await Promise.resolve();
    throw new Error("async boom");
  });
  app.get("/mongoose-validation", async () => {
    const schema = new mongoose.Schema({ name: { type: String, required: true } });
    const Model = mongoose.models.Thing || mongoose.model("Thing", schema);
    await new Model({}).validate();
  });
  app.get("/cast", () => {
    throw new mongoose.Error.CastError("ObjectId", "abc", "_id");
  });
  app.get("/duplicate", () => {
    const err = new Error("E11000 duplicate key error");
    err.code = 11000;
    err.keyValue = { email: "a@b.c" };
    throw err;
  });

  app.use(errorHandler);
  return app;
}

describe("errorHandler", () => {
  const app = buildTestApp();
  let consoleError;

  beforeEach(() => {
    consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => consoleError.mockRestore());

  it("maps a ZodError to 400 VALIDATION_ERROR with field details", async () => {
    const res = await request(app).get("/zod");

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.error.details).toEqual([{ field: "title", message: expect.any(String) }]);
  });

  it("maps validate() failures to 400 and passes valid bodies through", async () => {
    const bad = await request(app).post("/validated").send({ title: "x" });
    expect(bad.status).toBe(400);
    expect(bad.body.error.details[0].field).toBe("title");

    const good = await request(app).post("/validated").send({ title: "valid", extra: true });
    expect(good.status).toBe(200);
    expect(good.body).toEqual({ data: { title: "valid" } });
  });

  it("maps an AppError to its status and code", async () => {
    const res = await request(app).get("/app-error");

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: { code: "NOT_FOUND", message: "Project not found" } });
  });

  it("includes AppError details when given", async () => {
    const res = await request(app).get("/app-error-details");

    expect(res.status).toBe(403);
    expect(res.body.error).toEqual({
      code: "FORBIDDEN",
      message: "Not allowed",
      details: { requiredRole: "owner" },
    });
  });

  it("maps a plain Error to 500 INTERNAL and logs the stack", async () => {
    const res = await request(app).get("/plain");

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: { code: "INTERNAL", message: "boom" } });
    expect(consoleError).toHaveBeenCalled();
  });

  it("catches errors thrown by async handlers (Express 5)", async () => {
    const res = await request(app).get("/async");

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe("INTERNAL");
  });

  it("maps a mongoose ValidationError to 400 with field details", async () => {
    const res = await request(app).get("/mongoose-validation");

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.error.details).toEqual([{ field: "name", message: expect.any(String) }]);
  });

  it("maps a CastError to 400 VALIDATION_ERROR", async () => {
    const res = await request(app).get("/cast");

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.error.details).toEqual([{ field: "_id", message: "Invalid ObjectId" }]);
  });

  it("maps a duplicate key error to 409 CONFLICT naming the field", async () => {
    const res = await request(app).get("/duplicate");

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("CONFLICT");
    expect(res.body.error.message).toMatch(/email/);
  });

  it("maps a malformed JSON body to 400 VALIDATION_ERROR", async () => {
    const res = await request(createApp())
      .post("/api/v1/health")
      .set("Content-Type", "application/json")
      .send('{"broken":');

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("hides the message of unexpected errors in production", async () => {
    jest.resetModules();
    jest.doMock("../src/config/env", () => ({ isProduction: true }));
    const prodHandler = require("../src/middlewares/errorHandler");
    const prodApp = express();
    prodApp.get("/plain", () => {
      throw new Error("secret internals");
    });
    prodApp.use(prodHandler);

    const res = await request(prodApp).get("/plain");

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: { code: "INTERNAL", message: "Something went wrong" } });
    jest.dontMock("../src/config/env");
  });
});
