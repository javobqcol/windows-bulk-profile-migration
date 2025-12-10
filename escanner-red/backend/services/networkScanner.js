const DeviceDetector = require('./deviceDetector');
const NameResolver = require('./nameResolver');
const DomainChecker = require('./domainChecker');
const { getPrimaryInterface, calculateNetworkRange } = require('../utils/networkUtils');
const { formatLatency, formatTime } = require('../utils/formatters');
const { SCAN_CONFIG } = require('../config/constants');

/**
 * Servicio principal de escaneo de red
 */
class NetworkScanner {
  constructor() {
    this.scanHistory = [];
    this.maxHistorySize = 10;
  }

  /**
   * Ejecuta un escaneo completo de red
   */
  async performScan(options = {}) {
    const scanId = Date.now();
    const scanStartTime = Date.now();
    
    console.log(`🔍 [${scanId}] Iniciando escaneo de red...`);
    
    try {
      // 1. Obtener información de red
      const networkInfo = this.getNetworkInfo();
      
      // 2. Obtener dispositivos de ARP
      console.log(`📊 [${scanId}] Obteniendo dispositivos de ARP...`);
      const arpDevices = await DeviceDetector.getARPDevices();
      
      // 3. Filtrar solo dispositivos activos
      console.log(`🎯 [${scanId}] Verificando actividad (${arpDevices.length} dispositivos)...`);
      const activeDevices = await this.scanActiveDevices(arpDevices);
      
      // 4. Enriquecer información de dispositivos
      console.log(`✨ [${scanId}] Enriqueciendo información...`);
      const enrichedDevices = await this.enrichDevicesInfo(activeDevices);
      
      // 5. Ordenar resultados
      const sortedDevices = this.sortDevices(enrichedDevices);
      
      // 6. Calcular estadísticas
      const stats = this.calculateStats(sortedDevices);
      
      const scanDuration = Date.now() - scanStartTime;
      
      // 7. Guardar en historial
      this.addToHistory({
        scanId,
        timestamp: new Date().toISOString(),
        duration: scanDuration,
        deviceCount: sortedDevices.length,
        stats
      });
      
      console.log(`✅ [${scanId}] Escaneo completado en ${scanDuration}ms`);
      console.log(`   📈 ${sortedDevices.length} dispositivos activos`);
      console.log(`   🏢 ${stats.inDomainCount} en dominio`);
      
      return {
        success: true,
        network: networkInfo,
        devices: sortedDevices,
        stats,
        scanInfo: {
          id: scanId,
          duration: scanDuration,
          timestamp: new Date().toISOString()
        }
      };
      
    } catch (error) {
      console.error(`❌ [${scanId}] Error en escaneo:`, error);
      
      return {
        success: false,
        error: {
          message: error.message,
          code: error.code,
          scanId
        },
        devices: [],
        stats: {
          total: 0,
          inDomainCount: 0,
          byVendor: {},
          scanDuration: Date.now() - scanStartTime
        }
      };
    }
  }

  /**
   * Obtiene información de la red
   */
  getNetworkInfo() {
    const primaryInterface = getPrimaryInterface();
    
    if (!primaryInterface) {
      return {
        status: 'No se pudo detectar interfaz de red',
        interfaces: []
      };
    }
    
    const networkRange = calculateNetworkRange(
      primaryInterface.address,
      primaryInterface.netmask
    );
    
    return {
      interface: primaryInterface.name,
      ip: primaryInterface.address,
      netmask: primaryInterface.netmask,
      mac: primaryInterface.mac,
      range: networkRange,
      status: 'activa',
      detectedAt: new Date().toISOString()
    };
  }

  /**
   * Escanea y filtra dispositivos activos
   */
  async scanActiveDevices(devices) {
    // Limitar cantidad de dispositivos para escanear
    const devicesToScan = devices.slice(0, 100); // Máximo 100 dispositivos
    
    const scanResults = await DeviceDetector.scanDevices(devicesToScan);
    
    // Filtrar solo dispositivos activos
    return scanResults.filter(device => device.alive);
  }

  /**
   * Enriquece la información de los dispositivos
   */
  async enrichDevicesInfo(devices) {
    const enrichedDevices = [];
    
    for (const device of devices) {
      try {
        // Resolver nombre de host
        const hostname = await NameResolver.resolve(device.ip);
        const displayName = hostname ? NameResolver.extractShortName(hostname) : `host-${device.ip.replace(/\./g, '-')}`;
        
        // Detectar fabricante
        const vendor = DeviceDetector.detectVendor(device.mac);
        
        // Determinar tipo
        const type = DeviceDetector.determineDeviceType(vendor, hostname, device.ip);
        
        // Verificar dominio
        const inDomain = await DomainChecker.checkDomainMembership(device.ip, hostname);
        
        // Información adicional de dominio
        const domainInfo = inDomain ? 
          await DomainChecker.getDomainInfo(device.ip) : 
          null;
        
        enrichedDevices.push({
          ip: device.ip,
          mac: device.mac,
          hostname: hostname || device.ip,
          displayName: displayName,
          vendor: vendor,
          type: type,
          inDomain: inDomain,
          domainInfo: domainInfo,
          interface: device.interface,
          latency: formatLatency(device.latency),
          rtt: device.latency,
          status: 'activo',
          lastSeen: formatTime(),
          scannedAt: device.scannedAt,
          metadata: {
            packetLoss: device.packetLoss || 0,
            state: device.state || 'unknown'
          }
        });
        
      } catch (error) {
        console.warn(`Error enriqueciendo dispositivo ${device.ip}:`, error.message);
        
        // Dispositivo con información mínima
        enrichedDevices.push({
          ip: device.ip,
          mac: device.mac,
          hostname: device.ip,
          displayName: `host-${device.ip.replace(/\./g, '-')}`,
          vendor: DeviceDetector.detectVendor(device.mac),
          type: 'Desconocido',
          inDomain: false,
          interface: device.interface,
          latency: formatLatency(device.latency),
          rtt: device.latency,
          status: 'activo',
          lastSeen: formatTime(),
          scannedAt: device.scannedAt,
          metadata: {
            error: 'Información incompleta'
          }
        });
      }
    }
    
    return enrichedDevices;
  }

  /**
   * Ordena los dispositivos
   */
  sortDevices(devices) {
    return [...devices].sort((a, b) => {
      // Primero los que están en dominio
      if (a.inDomain && !b.inDomain) return -1;
      if (!a.inDomain && b.inDomain) return 1;
      
      // Luego por IP (orden natural)
      const ipA = a.ip.split('.').map(Number);
      const ipB = b.ip.split('.').map(Number);
      
      for (let i = 0; i < 4; i++) {
        if (ipA[i] !== ipB[i]) return ipA[i] - ipB[i];
      }
      
      return 0;
    });
  }

  /**
   * Calcula estadísticas del escaneo
   */
  calculateStats(devices) {
    const vendorCount = {};
    const typeCount = {};
    let totalLatency = 0;
    let lowLatencyCount = 0;
    
    devices.forEach(device => {
      // Contar por fabricante
      vendorCount[device.vendor] = (vendorCount[device.vendor] || 0) + 1;
      
      // Contar por tipo
      typeCount[device.type] = (typeCount[device.type] || 0) + 1;
      
      // Estadísticas de latencia
      if (device.rtt) {
        totalLatency += device.rtt;
        if (device.rtt < 10) lowLatencyCount++;
      }
    });
    
    const avgLatency = devices.length > 0 ? totalLatency / devices.length : 0;
    
    return {
      total: devices.length,
      inDomainCount: devices.filter(d => d.inDomain).length,
      vendorDistribution: vendorCount,
      typeDistribution: typeCount,
      latencyStats: {
        average: formatLatency(avgLatency),
        lowLatencyCount,
        lowLatencyPercentage: devices.length > 0 ? 
          Math.round((lowLatencyCount / devices.length) * 100) : 0
      }
    };
  }

  /**
   * Agrega escaneo al historial
   */
  addToHistory(scanData) {
    this.scanHistory.unshift(scanData);
    
    // Mantener solo los últimos N escaneos
    if (this.scanHistory.length > this.maxHistorySize) {
      this.scanHistory = this.scanHistory.slice(0, this.maxHistorySize);
    }
  }

  /**
   * Obtiene el historial de escaneos
   */
  getScanHistory() {
    return this.scanHistory;
  }

  /**
   * Obtiene información del sistema
   */
  getSystemInfo() {
    const os = require('os');
    
    return {
      hostname: os.hostname(),
      platform: os.platform(),
      arch: os.arch(),
      cpus: os.cpus().length,
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
      uptime: os.uptime(),
      loadavg: os.loadavg(),
      networkInterfaces: os.networkInterfaces(),
      nodeVersion: process.version,
      pid: process.pid,
      scanHistorySize: this.scanHistory.length
    };
  }
}

module.exports = new NetworkScanner();
