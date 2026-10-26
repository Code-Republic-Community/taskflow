const AppError = require("../utils/AppError");

function notFound(req, _res, next) {
  next(new AppError(`Route ${req.method} ${req.originalUrl} not found`, 404, "NOT_FOUND"));
}

module.exports = notFound;
