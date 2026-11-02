export const COMMENT_ERRORS = Object.freeze({
  // --- M ---
  // 404: issue with this id does not exist
  // 403: user is not a member of the issue's project
  // --- A ---
  // 404: comment with this id does not exist
  // 403: trying to edit someone else's comment
  // 403: deleting user is neither the author nor the project owner
} as const);

export const COMMENT_SUCCESS = Object.freeze({
  // M LIST
  // M CREATED
  // A UPDATED
  // A DELETED
} as const);
