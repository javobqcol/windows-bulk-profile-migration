const express = require('express');
const router = express.Router();
const NetworkScanner = require('../../services/networkScanner');
const { formatBytes, formatTime } = require('../../utils/formatters');

/**
 * @route   GET /api/system
 * @desc    Obtener información del sistema
 * @access  Public
 */
router.get('/', (req, res) => {
  try {
    const systemInfo = NetworkScanner.getSystemInfo();
    
    // Formatear información para mejor legibilidad
    const formattedInfo = {
      ...systemInfo,
      totalMemory: formatBytes(systemInfo.totalMemory),
      freeMemory: formatBytes(systemInfo.freeMemory),
      uptime: `${Math.floor(systemInfo.uptime / 3600)}h ${Math.floor((systemInfo.uptime % 3600) / 60)}m`,
      loadavg: systemInfo.loadavg.map(load => load.toFixed(2)),
      networkStats: {
        totalInterfaces: Object.keys(systemInfo.networkInterfaces).length,
        interfaces: Object.keys(systemInfo.networkInterfaces)
      },
      backend: {
        scanHistorySize: systemInfo.scanHistorySize,
        nodeVersion: systemInfo.nodeVersion,
        pid: systemInfo.pid,
        timestamp: new Date().toISOString()
      }
    };
    
    res.json({
      success: true,
      system: formattedInfo,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error en endpoint /api/system:', error);
    
    res.status(500).json({
      success: false,
      error: 'Error al obtener información del sistema',
      message: error.message
    });
  }
});

/**
 * @route   GET /api/system/health
 * @desc    Verificar salud del sistema
 * @access  Public
 */
router.get('/health', (req, res) => {
  try {
    const systemInfo = NetworkScanner.getSystemInfo();
    
    // Verificar recursos críticos
    const memoryUsage = 1 - (systemInfo.freeMemory / systemInfo.totalMemory);
    const loadPerCore = systemInfo.loadavg[0] / systemInfo.cpus;
    
    const healthStatus = {
      status: 'healthy',
      checks: {
        memory: memoryUsage < 0.9 ? 'healthy' : 'warning',
        cpu: loadPerCore < 2 ? 'healthy' : 'warning',
        uptime: systemInfo.uptime > 3600 ? 'healthy' : 'warning', // Más de 1 hora
        network: Object.keys(systemInfo.networkInterfaces).length > 0 ? 'healthy' : 'warning'
      },
      metrics: {
        memoryUsage: Math.round(memoryUsage * 100),
        loadPerCore: loadPerCore.toFixed(2),
        uptimeHours: Math.floor(systemInfo.uptime / 3600),
        networkInterfaces: Object.keys(systemInfo.networkInterfaces).length
      },
      timestamp: new Date().toISOString()
    };
    
    // Determinar estado general
    const hasWarning = Object.values(healthStatus.checks).some(status => status === 'warning');
    const hasCritical = Object.values(healthStatus.checks).some(status => status === 'critical');
    
    if (hasCritical) {
      healthStatus.status = 'critical';
    } else if (hasWarning) {
      healthStatus.status = 'warning';
    }
    
    res.json({
      success: true,
      health: healthStatus,
      system: {
        hostname: systemInfo.hostname,
        platform: systemInfo.platform,
        uptime: formatTime(new Date(Date.now() - systemInfo.uptime * 1000))
      }
    });
    
  } catch (error) {
    console.error('Error en endpoint /api/system/health:', error);
    
    res.status(500).json({
      success: false,
      status: 'unhealthy',
      error: 'Error al verificar salud del sistema',
      message: error.message
    });
  }
});

module.exports = router;
