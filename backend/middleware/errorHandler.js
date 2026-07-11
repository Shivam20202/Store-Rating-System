/**
 * Global error-handling middleware.
 * Must be registered last (after all routes) via app.use(errorHandler).
 */
export const errorHandler = (err, req, res, _next) => {
  console.error('--- Error ---');
  console.error(err.stack || err.message || err);

  // Custom application errors can carry a status code
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal server error.';

  // Avoid leaking internal error details in production for 500s
  if (status >= 500 && process.env.NODE_ENV === 'production') {
    return res.status(status).json({ message: 'Internal server error.' });
  }

  return res.status(status).json({ message });
};

/**
 * Helper to throw an error with a status code from controllers/services.
 */
export const createError = (status, message) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

/**
 * Wrap async route handlers so rejected promises flow to the error handler
 * instead of crashing the process.
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
