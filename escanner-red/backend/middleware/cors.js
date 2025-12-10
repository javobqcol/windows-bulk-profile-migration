/**
 * Middleware CORS configurable
 */
const corsMiddleware = (options = {}) => {
  const defaults = {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400 // 24 horas
  };

  const config = { ...defaults, ...options };

  return (req, res, next) => {
    // Headers CORS
    res.header('Access-Control-Allow-Origin', config.origin);
    res.header('Access-Control-Allow-Methods', config.methods.join(', '));
    res.header('Access-Control-Allow-Headers', config.allowedHeaders.join(', '));
    res.header('Access-Control-Allow-Credentials', config.credentials);
    res.header('Access-Control-Max-Age', config.maxAge);

    // Manejar preflight requests
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    next();
  };
};

module.exports = corsMiddleware;
