/**
 * Middleware para manejo de errores centralizado
 */
const errorHandler = (err, req, res, next) => {
  console.error('🔥 Error no manejado:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    timestamp: new Date().toISOString()
  });

  // Determinar código de estado
  const statusCode = err.statusCode || err.status || 500;
  
  // Respuesta de error
  const errorResponse = {
    success: false,
    error: {
      message: err.message || 'Error interno del servidor',
      code: err.code || 'INTERNAL_ERROR',
      timestamp: new Date().toISOString()
    }
  };

  // En desarrollo, incluir stack trace
  if (process.env.NODE_ENV === 'development') {
    errorResponse.error.stack = err.stack;
    errorResponse.error.details = err.details;
  }

  res.status(statusCode).json(errorResponse);
};

module.exports = errorHandler;
