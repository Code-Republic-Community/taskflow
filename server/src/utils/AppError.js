const STATUS_TO_CODE = Object.freeze({
  400: "VALIDATION_ERROR",
  401: "UNAUTHORIZED",
  403: "FORBIDDEN",
  404: "NOT_FOUND",
  409: "CONFLICT",
  429: "RATE_LIMITED",
  500: "INTERNAL",
});

class AppError extends Error {
  /**
   * @param {string} message  human-readable message sent to the client
   * @param {number} statusCode  HTTP status
   * @param {string} [code]  one of STATUS_TO_CODE values; derived from statusCode when omitted
   * @param {unknown} [details]  extra data, e.g. [{ field, message }]
   */
  constructor(message, statusCode = 500, code = STATUS_TO_CODE[statusCode] ?? "INTERNAL", details) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    if (details !== undefined) this.details = details;
  }
}

module.exports = AppError;
module.exports.STATUS_TO_CODE = STATUS_TO_CODE;
