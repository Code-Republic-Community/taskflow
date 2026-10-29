export const AUTH_SCHEME = "Bearer";

export const AUTH_SALT = 10;

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
  INVALID_CREDENTIALS: {
    message: "Invalid email or password",
    statusCode: 401,
  },
  INVALID_PASSWORD: {
    statusCode: 400,
    message: "Password must be at least 8 characters long",
  },
  EMAIL_EXIST: {
    statusCode: 409,
    message: "Email already exist",
  },
} as const);

export const AUTH_SUCCESS = Object.freeze({
  LOGIN: {
    statusCode: 200,
  },
  CURRENT_USER: {
    statusCode: 200,
  },
  USER_CREATED: {
    statusCode: 201,
  },
} as const);
