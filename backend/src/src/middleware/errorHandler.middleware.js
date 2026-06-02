function createError(status, code, message) {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  return error;
}

function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const code = err.code || "internal_error";
  const message = err.message || "Something went wrong";

  console.error(`[ERROR] ${status} - ${code}: ${message}`);

  res.status(status).json({
    error: {
      code,
      message,
    },
  });
}

module.exports = { createError, errorHandler };