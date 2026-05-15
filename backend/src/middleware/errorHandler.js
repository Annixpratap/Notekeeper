/**
 * Global error handler middleware
 * Catches all errors and formats them consistently
 */
export const errorHandler = (err, req, res, next) => {
  const timestamp = new Date().toISOString();
  const path = req.path;

  // Log error for debugging
  console.error({
    timestamp,
    path,
    method: req.method,
    status: err.status || 500,
    message: err.message,
    stack: err.stack,
  });

  // Zod validation errors
  if (err.name === 'ZodError') {
    return res.status(400).json({
      message: 'Validation error',
      errors: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
      timestamp,
      path,
    });
  }

  // Custom application errors
  if (err.status) {
    return res.status(err.status).json({
      message: err.message,
      timestamp,
      path,
    });
  }

  // Prisma errors
  if (err.code === 'P2002') {
    return res.status(409).json({
      message: 'Unique constraint violation',
      timestamp,
      path,
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      message: 'Record not found',
      timestamp,
      path,
    });
  }

  // Default server error
  res.status(500).json({
    message: 'Internal server error',
    timestamp,
    path,
  });
};
