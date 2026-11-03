import { z } from "zod";

const objectId = z
  .string()
  .length(24)
  .regex(/^[0-9a-f]+$/);

// --- Part M ---
export const issueIdParamsSchema = z.object({
  issueId: objectId,
});

export const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export const commentBodySchema = z.object({
  body: z.string().trim().min(1).max(5000),
});

// --- Part A ---
// commentIdParamsSchema: object with commentId (objectId)
