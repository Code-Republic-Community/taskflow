export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 100;

export interface Pagination {
  page: number;
  limit: number;
  skip: number;
}

function toPositiveInt(value: unknown, fallback: number): number {
  const n = Number.parseInt(String(value), 10);
  return Number.isInteger(n) && n > 0 ? n : fallback;
}

/**
 * parsePagination(req.query) -> { page, limit, skip }
 * Invalid values fall back to the defaults; limit is capped at MAX_LIMIT.
 * Build the list response as: { data: items, meta: { page, limit, total } }
 */
export function parsePagination(query: Record<string, unknown> = {}): Pagination {
  const page = toPositiveInt(query.page, 1);
  const limit = Math.min(toPositiveInt(query.limit, DEFAULT_LIMIT), MAX_LIMIT);
  return { page, limit, skip: (page - 1) * limit };
}
