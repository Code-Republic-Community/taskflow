export const STATUS_TO_CODE = Object.freeze({
  400: "VALIDATION_ERROR",
  401: "UNAUTHORIZED",
  403: "FORBIDDEN",
  404: "NOT_FOUND",
  409: "CONFLICT",
  429: "RATE_LIMITED",
  500: "INTERNAL",
} as const);

export type ErrorCode = (typeof STATUS_TO_CODE)[keyof typeof STATUS_TO_CODE];

export function codeForStatus(statusCode: number): ErrorCode | undefined {
  return STATUS_TO_CODE[statusCode as keyof typeof STATUS_TO_CODE];
}

export class AppError extends Error {
  readonly statusCode: number;
  readonly code: ErrorCode;
  readonly details?: unknown;

  /**
   * @param message  human-readable message sent to the client
   * @param statusCode  HTTP status
   * @param code  derived from statusCode when omitted
   * @param details  extra data, e.g. [{ field, message }]
   */
  constructor(message: string, statusCode = 500, code?: ErrorCode, details?: unknown) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code ?? codeForStatus(statusCode) ?? "INTERNAL";
    if (details !== undefined) this.details = details;
  }
}
