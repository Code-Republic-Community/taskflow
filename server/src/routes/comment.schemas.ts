// import { z } from "zod";
export {};

// shared: MongoDB id = 24-character string of 0-9 and a-f
// const objectId = ...

// --- Part M ---
// issueIdParamsSchema: object with issueId (objectId)
// listQuerySchema: page (number >= 1) and limit (number 1-100), both optional.
//                  They come from the URL as strings -> coerce to number (z.coerce)
// commentBodySchema: object with body - string, trim first, then length 1-5000

// --- Part A ---
// commentIdParamsSchema: object with commentId (objectId)
