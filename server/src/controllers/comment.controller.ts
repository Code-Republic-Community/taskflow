import type { Request, Response } from "express";

// --- Part M ---
export async function list(_req: Request, _res: Response) {
  // 1. get issueId from params, page and limit from query, user id from req (set by requireAuth)
  // 2. call listComments(issueId, userId, { page, limit })
  // 3. respond: COMMENT_SUCCESS.LIST.statusCode, { data: items, meta: { page, limit, total } }
}

export async function create(_req: Request, _res: Response) {
  // 1. get issueId from params, body from request body, user id
  // 2. call createComment(issueId, userId, body)
  // 3. respond: COMMENT_SUCCESS.CREATED.statusCode, { data: comment }
}

// --- Part A ---
export async function update(_req: Request, _res: Response) {
  // 1. get commentId from params, body from request body, user id
  // 2. call updateComment(commentId, userId, body)
  // 3. respond: COMMENT_SUCCESS.UPDATED.statusCode, { data: comment }
}

export async function remove(_req: Request, _res: Response) {
  // 1. get commentId from params, user id
  // 2. call deleteComment(commentId, userId)
  // 3. respond: COMMENT_SUCCESS.DELETED.statusCode, no body
}
