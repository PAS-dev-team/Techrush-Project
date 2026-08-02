const { ZodError } = require("zod");
const { failure, AppError } = require("../utils/response");

function notFound(req, res, next) {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
}

function errorHandler(err, req, res, next) {
  if (err instanceof ZodError) {
    const errors = err.errors.map((e) => ({ field: e.path.join("."), message: e.message }));
    return failure(res, "Validation failed", errors, 400);
  }

  if (err instanceof AppError) {
    return failure(res, err.message, { status: err.status }, err.status);
  }

  console.error(err);
  return failure(res, "Internal server error", err.message, 500);
}

module.exports = { notFound, errorHandler };