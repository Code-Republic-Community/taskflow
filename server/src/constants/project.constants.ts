export const PROJECT_ERRORS = Object.freeze({
  // Same message for "does not exist" and "not a member": never reveal that a project exists
  NOT_FOUND: {
    statusCode: 404,
    message: "Project not found",
  },
  FORBIDDEN: {
    statusCode: 403,
    message: "Forbidden",
  },
} as const);
