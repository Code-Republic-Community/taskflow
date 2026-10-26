import type { ErrorRequestHandler } from "express";
import mongoose from "mongoose";
import { ZodError } from "zod";
import { config } from "../config/env.ts";
import { AppError, codeForStatus, type ErrorCode } from "../utils/AppError.ts";

interface NormalizedError {
  statusCode: number;
  code: ErrorCode;
  message: string;
  details?: unknown;
}

interface FieldError {
  field: string;
  message: string;
}

function zodDetails(err: ZodError): FieldError[] {
  return err.issues.map((issue) => ({
    field: issue.path.join(".") || "(root)",
    message: issue.message,
  }));
}

function mongooseDetails(err: mongoose.Error.ValidationError): FieldError[] {
  return Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
}

// Shape of errors thrown by the MongoDB driver and by express.json (body-parser).
interface ErrorLike {
  code?: unknown;
  keyValue?: Record<string, unknown>;
  keyPattern?: Record<string, unknown>;
  type?: unknown;
  expose?: unknown;
  status?: unknown;
  message?: unknown;
  stack?: unknown;
}

// Turns any thrown value into { statusCode, code, message, details? }, or null if unexpected.
function normalize(err: unknown): NormalizedError | null {
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

  if (typeof err !== "object" || err === null) return null;
  const e = err as ErrorLike;

  if (e.code === 11000) {
    const field = Object.keys(e.keyValue ?? e.keyPattern ?? {})[0];
    return {
      statusCode: 409,
      code: "CONFLICT",
      message: field ? `A record with this ${field} already exists` : "Duplicate value",
      details: field ? [{ field, message: "already exists" }] : undefined,
    };
  }

  // Malformed JSON body (thrown by express.json / body-parser).
  if (e.type === "entity.parse.failed") {
    return { statusCode: 400, code: "VALIDATION_ERROR", message: "Malformed JSON in request body" };
  }

  // Other body-parser errors (e.g. payload too large) carry a 4xx status.
  if (e.expose === true && typeof e.status === "number" && e.status >= 400 && e.status < 500) {
    return {
      statusCode: e.status,
      code: codeForStatus(e.status) ?? "VALIDATION_ERROR",
      message: String(e.message),
    };
  }

  return null;
}

// Express recognises an error handler by its 4 arguments, so _next must stay.
export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  let normalized: NormalizedError | null;
  try {
    normalized = normalize(err);
  } catch {
    normalized = null;
  }

  if (!normalized) {
    const e = (err ?? {}) as ErrorLike;
    console.error(`[error] ${req.method} ${req.originalUrl}\n`, e.stack ?? err);
    normalized = {
      statusCode: 500,
      code: "INTERNAL",
      message: config.isProduction
        ? "Something went wrong"
        : (typeof e.message === "string" && e.message) || "Internal server error",
    };
  }

  if (res.headersSent) {
    req.socket?.destroy();
    return;
  }

  const { statusCode, code, message, details } = normalized;
  const body: { error: { code: ErrorCode; message: string; details?: unknown } } = {
    error: { code, message },
  };
  if (details !== undefined) body.error.details = details;
  res.status(statusCode).json(body);
};
