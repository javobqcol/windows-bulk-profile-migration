const express = require('express');
const router = express.Router();
const NetworkScanner = require('../../services/networkScanner');
const { validateScanParams } = require('../../utils/validators');

/**
 * @route   GET /api/scan
 * @desc    Escanear red local
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const { timeout, range, detailed } = req.query;
    
    // Validar parámetros
    const validation = validateScanParams({ timeout, range });
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Parámetros inválidos',
        details: validation.errors
      });
    }
    
    // Opciones de escaneo
    const scanOptions = {
      timeout: timeout ? parseInt(timeout) : undefined,
      range: range || undefined,
      detailed: detailed === 'true'
    };
    
    // Ejecutar escaneo
    const scanResult = await NetworkScanner.performScan(scanOptions);
    
    if (!scanResult.success) {
      return res.status(500).json(scanResult);
    }
    
    // Preparar respuesta
    const response = {
      success: true,
      message: 'Escaneo completado exitosamente',
      network: scanResult.network,
      devices: scanResult.devices,
      stats: scanResult.stats,
      scanInfo: scanResult.scanInfo,
      timestamp: new Date().toISOString()
    };
    
    res.json(response);
    
  } catch (error) {
    console.error('Error en endpoint /api/scan:', error);
    
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @route   GET /api/scan/history
 * @desc    Obtener historial de escaneos
 * @access  Public
 */
router.get('/history', (req, res) => {
  try {
    const history = NetworkScanner.getScanHistory();
    
    res.json({
      success: true,
      history,
      count: history.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error obteniendo historial:', error);
    
    res.status(500).json({
      success: false,
      error: 'Error al obtener historial'
    });
  }
});

/**
 * @route   GET /api/scan/device/:ip
 * @desc    Obtener información específica de un dispositivo
 * @access  Public
 */
router.get('/device/:ip', async (req, res) => {
  try {
    const { ip } = req.params;
    
    if (!ip) {
      return res.status(400).json({
        success: false,
        error: 'Se requiere dirección IP'
      });
    }
    
    // Aquí podrías implementar un escaneo específico para un dispositivo
    // Por ahora retornamos un mensaje informativo
    res.json({
      success: true,
      message: `Información detallada para ${ip}`,
      ip,
      timestamp: new Date().toISOString(),
      note: 'Esta funcionalidad está en desarrollo'
    });
  } catch (error) {
    console.error(`Error obteniendo dispositivo ${req.params.ip}:`, error);
    
    res.status(500).json({
      success: false,
      error: 'Error al obtener información del dispositivo'
    });
  }
});

module.exports = router;
