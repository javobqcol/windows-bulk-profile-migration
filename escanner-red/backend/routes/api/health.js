const express = require('express');
const router = express.Router();

/**
 * @route   GET /api/health
 * @desc    Verificar salud de la API
 * @access  Public
 */
router.get('/', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Network Scanner API funcionando correctamente',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    endpoints: [
      '/api/scan - Escanear red local',
      '/api/scan/history - Historial de escaneos',
      '/api/system - Información del sistema',
      '/api/system/health - Salud del sistema',
      '/api/health - Salud de la API (este endpoint)'
    ],
    uptime: process.uptime(),
    nodeVersion: process.version,
    memoryUsage: process.memoryUsage()
  });
});

/**
 * @route   GET /api/health/detailed
 * @desc    Verificar salud detallada de la API
 * @access  Public
 */
router.get('/detailed', (req, res) => {
  const memoryUsage = process.memoryUsage();
  
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    process: {
      pid: process.pid,
      uptime: process.uptime(),
      version: process.version,
      platform: process.platform,
      arch: process.arch
    },
    memory: {
      rss: Math.round(memoryUsage.rss / 1024 / 1024) + ' MB',
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + ' MB',
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + ' MB',
      external: Math.round(memoryUsage.external / 1024 / 1024) + ' MB'
    },
    environment: {
      nodeEnv: process.env.NODE_ENV || 'development',
      hostname: require('os').hostname()
    },
    dependencies: {
      express: require('express/package.json').version,
      ping: require('ping/package.json').version
    }
  });
});

module.exports = router;
