export const NOTIFICATION_ERRORS = Object.freeze({
  NOT_AUTHENTICATED: {
    statusCode: 401,
    message: "Authentication required",
  },
  NOT_FOUND: {
    statusCode: 404,
    message: "Notification not found",
  },
  INVALID_ID: {
    statusCode: 400,
    message: "Must be a valid id",
  },
} as const);
