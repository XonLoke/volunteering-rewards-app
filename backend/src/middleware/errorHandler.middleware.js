/**
 * Global Error Handler Middleware (INF-06)
 *
 * Catches all errors thrown or passed via next(err) and returns
 * a consistent JSON error response. In production, internal details
 * are hidden behind a generic message.
 */

function errorHandler(err, _req, res, _next) {
  // Determine status code
  const statusCode = err.statusCode || err.status || 500;

  // Build response payload
  const body = {
    error: true,
    message: statusCode >= 500 && process.env.NODE_ENV === "production"
      ? "Internal server error"
      : err.message || "An unexpected error occurred",
  };

  // Attach validation details if present (Joi / express-validation)
  if (err.details) {
    body.details = err.details;
  }

  // Log server errors for debugging
  if (statusCode >= 500) {
    console.error(`[ERROR] ${err.stack || err.message}`);
  }

  res.status(statusCode).json(body);
}

/**
 * Factory for creating operational (expected) errors.
 * Use this in services/controllers instead of throw new Error().
 *
 * Example:
 *   throw createError(400, "Email already registered");
 */
function createError(statusCode, message, details) {
  const err = new Error(message);
  err.statusCode = statusCode;
  err.details = details;
  return err;
}

module.exports = errorHandler;
module.exports.createError = createError;
