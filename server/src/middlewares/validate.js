/**
 * validate({ body, query, params }) with zod schemas.
 * Parsed (coerced, stripped) values replace the originals; on failure the ZodError
 * goes to errorHandler, which answers 400 VALIDATION_ERROR.
 *
 * Express 5 makes req.query a getter, so the parsed query is stored on req.validatedQuery
 * and also redefined on req.query for convenience.
 */
function validate(schemas = {}) {
  return (req, _res, next) => {
    if (schemas.params) req.params = schemas.params.parse(req.params);
    if (schemas.body) req.body = schemas.body.parse(req.body ?? {});
    if (schemas.query) {
      const query = schemas.query.parse(req.query);
      req.validatedQuery = query;
      Object.defineProperty(req, "query", { value: query, writable: true, configurable: true });
    }
    next();
  };
}

module.exports = validate;
