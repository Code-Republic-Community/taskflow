const mongoose = require("mongoose");
const { ZodError } = require("zod");
const config = require("../config/env");
const AppError = require("../utils/AppError");

function zodDetails(err) {
  return err.issues.map((issue) => ({
    field: issue.path.join(".") || "(root)",
    message: issue.message,
  }));
}

function mongooseDetails(err) {
  return Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
}

// Turns any thrown value into { statusCode, code, message, details? }.
function normalize(err) {
  if (err instanceof AppError) {
    return {
      statusCode: err.statusCode,
      code: err.code,
      message: err.message,
      details: err.details,
    };
  }

  if (err instanceof ZodError) {
    return {
      statusCode: 400,
      code: "VALIDATION_ERROR",
      message: "Invalid request data",
      details: zodDetails(err),
    };
  }

  if (err instanceof mongoose.Error.ValidationError) {
    return {
      statusCode: 400,
      code: "VALIDATION_ERROR",
      message: "Invalid data",
      details: mongooseDetails(err),
    };
  }

  if (err instanceof mongoose.Error.CastError) {
    return {
      statusCode: 400,
      code: "VALIDATION_ERROR",
      message: `Invalid value for ${err.path}`,
      details: [{ field: err.path, message: `Invalid ${err.kind}` }],
    };
  }

  if (err?.code === 11000) {
    const field = Object.keys(err.keyValue ?? err.keyPattern ?? {})[0];
    return {
      statusCode: 409,
      code: "CONFLICT",
      message: field ? `A record with this ${field} already exists` : "Duplicate value",
      details: field ? [{ field, message: "already exists" }] : undefined,
    };
  }

  // Malformed JSON body (thrown by express.json / body-parser).
  if (err?.type === "entity.parse.failed") {
    return { statusCode: 400, code: "VALIDATION_ERROR", message: "Malformed JSON in request body" };
  }

  // Other body-parser errors (e.g. payload too large) carry a 4xx status.
  if (err?.expose && err.status >= 400 && err.status < 500) {
    return {
      statusCode: err.status,
      code: AppError.STATUS_TO_CODE[err.status] ?? "VALIDATION_ERROR",
      message: err.message,
    };
  }

  return null;
}

// Express recognises an error handler by its 4 arguments, so _next must stay.
function errorHandler(err, req, res, _next) {
  let normalized;
  try {
    normalized = normalize(err);
  } catch {
    normalized = null;
  }

  if (!normalized) {
    console.error(`[error] ${req.method} ${req.originalUrl}\n`, err?.stack ?? err);
    normalized = {
      statusCode: 500,
      code: "INTERNAL",
      message: config.isProduction
        ? "Something went wrong"
        : err?.message || "Internal server error",
    };
  }

  if (res.headersSent) {
    req.socket?.destroy();
    return;
  }

  const { statusCode, code, message, details } = normalized;
  const body = { error: { code, message } };
  if (details !== undefined) body.error.details = details;
  res.status(statusCode).json(body);
}

module.exports = errorHandler;
