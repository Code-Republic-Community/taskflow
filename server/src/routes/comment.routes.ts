import { Router } from "express";
// import requireAuth from middlewares/requireAuth
// import validate from middlewares/validate
// import controller functions
// import schemas from ./comment.schemas

const router = Router();

// --- Part M ---
// GET  /issues/:issueId/comments
//   -> requireAuth -> validate(params: issueIdParamsSchema, query: listQuerySchema) -> list
// POST /issues/:issueId/comments
//   -> requireAuth -> validate(params: issueIdParamsSchema, body: commentBodySchema) -> create

// --- Part A ---
// PATCH  /comments/:commentId
//   -> requireAuth -> validate(params: commentIdParamsSchema, body: commentBodySchema) -> update
// DELETE /comments/:commentId
//   -> requireAuth -> validate(params: commentIdParamsSchema) -> remove

export default router;
