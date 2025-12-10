const dns = require('dns');
const util = require('util');
const reverse = util.promisify(dns.reverse);
const { executeCommand } = require('../utils/networkUtils');
const { COMMAND_PATHS } = require('../config/constants');

/**
 * Resuelve el nombre de host usando múltiples métodos
 */
class NameResolver {
  constructor() {
    this.methods = [
      this.reverseDNS.bind(this),
      this.netbiosLookup.bind(this),
      this.mdnsLookup.bind(this)
    ];
  }

  /**
   * Intenta resolver el nombre de host de una IP
   */
  async resolve(ip, timeout = 1000) {
    if (!ip) return null;
    
    // Intentar cada método hasta que uno funcione
    for (const method of this.methods) {
      try {
        const result = await Promise.race([
          method(ip),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), timeout)
          )
        ]);
        
        if (result && result !== ip) {
          return result;
        }
      } catch (error) {
        // Silenciar errores, intentar siguiente método
        continue;
      }
    }
    
    return null;
  }

  /**
   * Reverse DNS lookup (PTR records)
   */
  async reverseDNS(ip) {
    try {
      const hostnames = await reverse(ip);
      return hostnames && hostnames[0] ? hostnames[0] : null;
    } catch (error) {
      return null;
    }
  }

  /**
   * NetBIOS/LLMNR lookup
   */
  async netbiosLookup(ip) {
    try {
      const command = `${COMMAND_PATHS.NMBLOOKUP} ${ip}`;
      const result = await executeCommand(command, 2000);
      
      if (result.success && result.stdout) {
        // Extraer nombre NetBIOS de la salida
        const lines = result.stdout.split('\n');
        for (const line of lines) {
          if (line.includes('<ACTIVE>') && line.includes('00')) {
            const nameMatch = line.match(/^\s*([^\s<]+)/);
            if (nameMatch && nameMatch[1]) {
              return nameMatch[1].toLowerCase();
            }
          }
        }
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * mDNS/Avahi lookup (para sistemas Apple/Linux)
   */
  async mdnsLookup(ip) {
    try {
      const command = `${COMMAND_PATHS.AVAHI_RESOLVE} ${ip}`;
      const result = await executeCommand(command, 2000);
      
      if (result.success && result.stdout) {
        const parts = result.stdout.trim().split('\t');
        if (parts.length >= 2 && parts[1]) {
          return parts[1].toLowerCase();
        }
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Extrae el nombre corto del FQDN
   */
  extractShortName(fqdn) {
    if (!fqdn) return null;
    return fqdn.split('.')[0];
  }
}

module.exports = new NameResolver();
