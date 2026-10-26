const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

function toPositiveInt(value, fallback) {
  const n = Number.parseInt(value, 10);
  return Number.isInteger(n) && n > 0 ? n : fallback;
}

/**
 * parsePagination(req.query) -> { page, limit, skip }
 * Invalid values fall back to the defaults; limit is capped at MAX_LIMIT.
 * Build the list response as: { data: items, meta: { page, limit, total } }
 */
function parsePagination(query = {}) {
  const page = toPositiveInt(query.page, 1);
  const limit = Math.min(toPositiveInt(query.limit, DEFAULT_LIMIT), MAX_LIMIT);
  return { page, limit, skip: (page - 1) * limit };
}

module.exports = { parsePagination, DEFAULT_LIMIT, MAX_LIMIT };
