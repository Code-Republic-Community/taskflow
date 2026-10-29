export const AUTH_SCHEME = "Bearer";

export const AUTH_ERRORS = Object.freeze({
  MISSING_TOKEN: {
    statusCode: 401,
    message: "Authentication token is missing",
  },
  INVALID_TOKEN_TYPE: {
    statusCode: 401,
    message: `Authorization header must be in the format: ${AUTH_SCHEME} <token>`,
  },
  INVALID_TOKEN: {
    statusCode: 401,
    message: "Invalid authentication token",
  },
  TOKEN_EXPIRED: {
    statusCode: 401,
    message: "Authentication token has expired",
  },
  INVALID_PAYLOAD: {
    statusCode: 401,
    message: "Authentication token payload is invalid",
  },
  USER_NOT_FOUND: {
    statusCode: 401,
    message: "User for this token no longer exists",
  },
  USER_DEACTIVATED: {
    statusCode: 401,
    message: "User account is deactivated",
  },
  NOT_AUTHENTICATED: {
    statusCode: 401,
    message: "Authentication required",
  },
} as const);

export const AUTH_SUCCESS = Object.freeze({
  CURRENT_USER: {
    statusCode: 200,
  },
} as const);
