// --- shared helper (written in Part A, used by both) ---
// async function getProjectAccess(projectId, userId)
//   find the project -> return whether the user is a member and whether they are the owner

// --- Part M ---
export async function listComments(
  _issueId: string,
  _userId: string,
  _opts: { page?: number; limit?: number },
) {
  // 1. find the issue; not found -> AppError(ISSUE_NOT_FOUND)
  // 2. check that userId is a member of the issue's project; if not -> AppError(NOT_PROJECT_MEMBER)
  // 3. compute page/limit with the pagination helper from utils
  // 4. find comments of this issue, sort by createdAt ascending, skip/limit, populate("author")
  // 5. count all comments of this issue
  // 6. return { items, total }
}

export async function createComment(_issueId: string, _userId: string, _body: string) {
  // 1. find the issue; not found -> ISSUE_NOT_FOUND
  // 2. is the user a member? if not -> NOT_PROJECT_MEMBER
  // 3. create the comment: issue, author = userId, body
  // 4. populate("author") and return it
}

// --- Part M ---
export async function updateComment(_commentId: string, _userId: string, _body: string) {
  // 1. find the comment; not found -> COMMENT_NOT_FOUND
  // 2. author is not userId -> NOT_COMMENT_AUTHOR
  // 3. set the new body and editedAt = current time, save
  // 4. populate("author") and return it
}

export async function deleteComment(_commentId: string, _userId: string) {
  // 1. find the comment; not found -> COMMENT_NOT_FOUND
  // 2. allowed if userId is the author OR the project owner (via getProjectAccess)
  // 3. not allowed -> DELETE_FORBIDDEN
  // 4. delete the comment, return nothing
}
