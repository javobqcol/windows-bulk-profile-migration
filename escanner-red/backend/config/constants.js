// Configuración de la aplicación
module.exports = {
  // Puerto del servidor
  PORT: process.env.PORT || 3001,
  
  // Configuración de escaneo
  SCAN_CONFIG: {
    PING_TIMEOUT: 1000,        // ms
    PING_RETRIES: 1,
    DNS_TIMEOUT: 1000,
    DOMAIN_CHECK_TIMEOUT: 500,
    SCAN_TIMEOUT: 10000        // Timeout total del escaneo
  },
  
  // Configuración de dominio
  DOMAIN_CONFIG: {
    DEFAULT_SUFFIX: process.env.DOMAIN_SUFFIX || 'local',
    DOMAIN_PORTS: [389, 636, 88, 445, 135],  // Puertos comunes de dominio
    DOMAIN_CHECK_ENABLED: true
  },
  
  // Rutas de comandos del sistema
  COMMAND_PATHS: {
    IP_NEIGH: 'ip neigh show',
    ARP: 'arp -a',
    NMBLOOKUP: 'nmblookup -A',
    AVAHI_RESOLVE: 'avahi-resolve-address'
  }
};
