const express = require('express');
const router = express.Router();

// Importar rutas de API
const scanRoutes = require('./api/scan');
const systemRoutes = require('./api/system');
const healthRoutes = require('./api/health');

// Usar rutas
router.use('/scan', scanRoutes);
router.use('/system', systemRoutes);
router.use('/health', healthRoutes);

// Ruta raíz
router.get('/', (req, res) => {
  res.json({
    message: 'Network Scanner API v2.0',
    description: 'API para escaneo de red local y detección de dispositivos',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    documentation: {
      endpoints: [
        { path: '/api/scan', method: 'GET', description: 'Escanear red local' },
        { path: '/api/scan/history', method: 'GET', description: 'Historial de escaneos' },
        { path: '/api/system', method: 'GET', description: 'Información del sistema' },
        { path: '/api/health', method: 'GET', description: 'Salud de la API' }
      ]
    }
  });
});

// 404 handler
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint no encontrado',
    requestedUrl: req.originalUrl,
    availableEndpoints: [
      '/api/scan',
      '/api/system',
      '/api/health'
    ]
  });
});

module.exports = router;
