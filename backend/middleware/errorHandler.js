/**
 * Centralized Express error-handling middleware.
 * Logs errors server-side and returns a safe JSON error response to clients.
 */
const errorHandler = (err, req, res, next) => {
  // Log error details server-side
  console.error(`[Error] ${err.name || 'Error'}: ${err.message}`);
  if (err.stack) {
    console.error(err.stack);
  }

  // Determine HTTP status code (default to 500)
  const statusCode = (typeof err.statusCode === 'number' && err.statusCode >= 400 && err.statusCode < 600)
    ? err.statusCode
    : (typeof err.status === 'number' && err.status >= 400 && err.status < 600)
      ? err.status
      : 500;

  // Use err.message for 4xx errors if available, otherwise generic "Internal server error"
  const responseMessage = (statusCode >= 400 && statusCode < 500 && err.message)
    ? err.message
    : 'Internal server error';

  res.status(statusCode).json({
    success: false,
    message: responseMessage
  });
};

module.exports = errorHandler;
