const net = require('net');
const { DOMAIN_CONFIG } = require('../config/constants');

/**
 * Servicio para verificar membresía de dominio
 */
class DomainChecker {
  constructor() {
    this.domainPorts = DOMAIN_CONFIG.DOMAIN_PORTS;
    this.domainSuffix = DOMAIN_CONFIG.DEFAULT_SUFFIX;
  }

  /**
   * Verifica si un dispositivo está en dominio
   */
  async checkDomainMembership(ip, hostname) {
    if (!DOMAIN_CONFIG.DOMAIN_CHECK_ENABLED) {
      return false;
    }

    const checks = [
      this.checkByHostnameSuffix.bind(this, hostname),
      this.checkDomainPorts.bind(this, ip),
      this.checkLDAP.bind(this, ip),
      this.checkNetBIOS.bind(this, ip)
    ];

    // Ejecutar checks en paralelo
    const results = await Promise.allSettled(
      checks.map(check => check().catch(() => false))
    );

    // Si alguno devuelve true, está en dominio
    return results.some(result => 
      result.status === 'fulfilled' && result.value === true
    );
  }

  /**
   * Verifica por sufijo de hostname
   */
  async checkByHostnameSuffix(hostname) {
    if (!hostname || !this.domainSuffix) return false;
    
    const hostnameLower = hostname.toLowerCase();
    const suffixLower = this.domainSuffix.toLowerCase();
    
    return hostnameLower.includes(suffixLower) && 
           !hostnameLower.endsWith('.local'); // Excluir .local (mDNS)
  }

  /**
   * Verifica puertos de dominio comunes
   */
  async checkDomainPorts(ip) {
    const portChecks = this.domainPorts.map(port => 
      this.checkPort(ip, port, 500)
    );

    const results = await Promise.allSettled(portChecks);
    const openPorts = results.filter(r => 
      r.status === 'fulfilled' && r.value === true
    ).length;

    // Si tiene al menos 2 puertos de dominio abiertos
    return openPorts >= 2;
  }

  /**
   * Verifica específicamente LDAP (puerto 389)
   */
  async checkLDAP(ip) {
    return this.checkPort(ip, 389, 1000);
  }

  /**
   * Verifica NetBIOS (puerto 137)
   */
  async checkNetBIOS(ip) {
    return this.checkPort(ip, 137, 500);
  }

  /**
   * Verifica si un puerto está abierto
   */
  checkPort(ip, port, timeout = 500) {
    return new Promise((resolve) => {
      const socket = new net.Socket();
      let resolved = false;

      const cleanup = () => {
        if (!resolved) {
          socket.destroy();
          resolve(false);
          resolved = true;
        }
      };

      socket.setTimeout(timeout);
      
      socket.on('connect', () => {
        socket.destroy();
        if (!resolved) {
          resolve(true);
          resolved = true;
        }
      });
      
      socket.on('timeout', cleanup);
      socket.on('error', cleanup);
      socket.on('close', () => {
        if (!resolved) {
          resolve(false);
          resolved = true;
        }
      });

      try {
        socket.connect(port, ip);
      } catch (error) {
        cleanup();
      }
    });
  }

  /**
   * Obtiene información de dominio si está disponible
   */
  async getDomainInfo(ip) {
    try {
      // Aquí podrías implementar consultas LDAP reales
      // Por ahora retornamos información básica
      const portChecks = await Promise.all(
        [389, 636, 88].map(port => this.checkPort(ip, port, 1000))
      );

      const domainServices = [];
      if (portChecks[0]) domainServices.push('LDAP');
      if (portChecks[1]) domainServices.push('LDAPS');
      if (portChecks[2]) domainServices.push('Kerberos');

      return {
        hasDomainServices: domainServices.length > 0,
        services: domainServices,
        detectedBy: 'port_scan'
      };
    } catch (error) {
      return {
        hasDomainServices: false,
        services: [],
        error: error.message
      };
    }
  }
}

module.exports = new DomainChecker();
