/**
 * Middleware de logging para requests
 */
const loggerMiddleware = (options = {}) => {
  const defaults = {
    logLevel: 'info',
    logRequests: true,
    logErrors: true,
    logResponseTime: true
  };

  const config = { ...defaults, ...options };

  return (req, res, next) => {
    const startTime = Date.now();
    
    // Log de request
    if (config.logRequests) {
      console.log(`📨 ${req.method} ${req.originalUrl}`, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
      });
    }

    // Capturar respuesta original
    const originalSend = res.send;
    res.send = function(data) {
      // Log de response time
      if (config.logResponseTime) {
        const responseTime = Date.now() - startTime;
        console.log(`📤 ${req.method} ${req.originalUrl} - ${res.statusCode} (${responseTime}ms)`);
      }

      // Log de errores
      if (config.logErrors && res.statusCode >= 400) {
        console.error(`❌ Error ${res.statusCode} en ${req.method} ${req.originalUrl}`, {
          statusCode: res.statusCode,
          responseTime: Date.now() - startTime,
          error: data
        });
      }

      originalSend.call(this, data);
    };

    next();
  };
};

module.exports = loggerMiddleware;
