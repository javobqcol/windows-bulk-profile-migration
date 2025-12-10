const ping = require('ping');
const { executeCommand, formatMAC, isPrivateIP } = require('../utils/networkUtils');
const { COMMAND_PATHS, SCAN_CONFIG } = require('../config/constants');
const ouiDatabase = require('../config/ouiDatabase');

/**
 * Servicio para detectar dispositivos en la red
 */
class DeviceDetector {
  /**
   * Obtiene dispositivos de la tabla ARP
   */
  async getARPDevices() {
    try {
      const result = await executeCommand(COMMAND_PATHS.IP_NEIGH, 3000);
      
      if (!result.success) {
        console.warn('Error al obtener tabla ARP:', result.error);
        return [];
      }
      
      const devices = [];
      const seenIPs = new Set();
      const lines = result.stdout.split('\n').filter(line => line.trim());
      
      for (const line of lines) {
        try {
          const parts = line.split(/\s+/).filter(p => p);
          
          if (parts.length >= 5) {
            const ip = parts[0];
            const mac = formatMAC(parts[4]);
            const iface = parts[2];  // CAMBIADO: interface -> iface
            const state = parts[5] || 'unknown';
            
            // Validar IP y MAC
            if (ip && mac && mac !== '00:00:00:00:00:00' && !seenIPs.has(ip) && isPrivateIP(ip)) {
              seenIPs.add(ip);
              
              devices.push({
                ip,
                mac,
                interface: iface,  // CAMBIADO: mantiene el nombre de propiedad
                state,
                timestamp: new Date().toISOString()
              });
            }
          }
        } catch (error) {
          // Continuar con siguiente dispositivo
          continue;
        }
      }
      
      console.log(`📊 Encontrados ${devices.length} dispositivos en tabla ARP`);
      return devices;
      
    } catch (error) {
      console.error('Error crítico en getARPDevices:', error);
      return [];
    }
  }
  /**
   * Verifica si un dispositivo está activo con ping
   */
  async checkDeviceActivity(ip, timeout = SCAN_CONFIG.PING_TIMEOUT) {
    try {
      const result = await ping.promise.probe(ip, {
        timeout: Math.floor(timeout / 1000),
        extra: ['-c', SCAN_CONFIG.PING_RETRIES.toString(), '-W', '1']
      });
      
      return {
        alive: result.alive,
        latency: result.time || 0,
        host: result.host || ip,
        packetLoss: result.packetLoss || 0
      };
    } catch (error) {
      return {
        alive: false,
        latency: 0,
        host: ip,
        packetLoss: 100,
        error: error.message
      };
    }
  }

  /**
   * Detecta el fabricante por dirección MAC
   */
  detectVendor(mac) {
    if (!mac) return 'Desconocido';
    
    try {
      const cleanMac = mac.replace(/:/g, '').replace(/-/g, '').toUpperCase();
      const oui = cleanMac.substring(0, 6);
      
      return ouiDatabase[oui] || 'Desconocido';
    } catch (error) {
      return 'Desconocido';
    }
  }

  /**
   * Determina el tipo de dispositivo
   */
  determineDeviceType(vendor, hostname, ip) {
    const hostnameLower = (hostname || '').toLowerCase();
    const vendorLower = (vendor || '').toLowerCase();
    
    // Router/Gateway (generalmente .1 o .254)
    if (ip.endsWith('.1') || ip.endsWith('.254')) {
      return 'Router/Gateway';
    }
    
    // Por vendor
    if (vendorLower.includes('raspberry')) return 'Raspberry Pi';
    if (vendorLower.includes('qemu') || vendorLower.includes('virtual')) return 'Virtual';
    if (vendorLower.includes('vmware') || vendorLower.includes('virtualbox')) return 'Virtual';
    
    // Por nombre de host
    if (hostnameLower.includes('router') || hostnameLower.includes('gateway')) return 'Router/Gateway';
    if (hostnameLower.includes('server') || hostnameLower.includes('srv')) return 'Servidor';
    if (hostnameLower.includes('nas') || hostnameLower.includes('storage')) return 'NAS';
    if (hostnameLower.includes('printer') || hostnameLower.includes('print')) return 'Impresora';
    if (hostnameLower.includes('switch') || hostnameLower.includes('sw')) return 'Switch';
    if (hostnameLower.includes('ap') || hostnameLower.includes('accesspoint')) return 'Access Point';
    if (hostnameLower.includes('camera') || hostnameLower.includes('cam')) return 'Cámara';
    if (hostnameLower.includes('phone') || hostnameLower.includes('android') || hostnameLower.includes('iphone')) return 'Teléfono';
    if (hostnameLower.includes('tv') || hostnameLower.includes('smarttv')) return 'Smart TV';
    
    // Por vendor específico
    if (vendorLower.includes('apple')) return 'Apple Device';
    if (vendorLower.includes('dell') || vendorLower.includes('hp') || vendorLower.includes('lenovo')) {
      return hostnameLower.includes('laptop') ? 'Portátil' : 'Computadora';
    }
    
    return 'Dispositivo Genérico';
  }

  /**
   * Escanea múltiples dispositivos en paralelo
   */
  async scanDevices(devices, concurrency = 10) {
    const results = [];
    const chunks = [];
    
    // Dividir en chunks para controlar concurrencia
    for (let i = 0; i < devices.length; i += concurrency) {
      chunks.push(devices.slice(i, i + concurrency));
    }
    
    for (const chunk of chunks) {
      const chunkPromises = chunk.map(async (device) => {
        try {
          const pingResult = await this.checkDeviceActivity(device.ip);
          
          if (pingResult.alive) {
            return {
              ...device,
              alive: true,
              latency: pingResult.latency,
              packetLoss: pingResult.packetLoss,
              scannedAt: new Date().toISOString()
            };
          }
          
          return {
            ...device,
            alive: false,
            scannedAt: new Date().toISOString()
          };
        } catch (error) {
          return {
            ...device,
            alive: false,
            error: error.message,
            scannedAt: new Date().toISOString()
          };
        }
      });
      
      const chunkResults = await Promise.allSettled(chunkPromises);
      
      chunkResults.forEach(result => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        }
      });
      
      // Pequeña pausa entre chunks para no saturar la red
      if (chunks.length > 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    return results;
  }
}

module.exports = new DeviceDetector();
