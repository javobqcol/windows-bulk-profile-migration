const os = require('os');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

/**
 * Obtiene información de las interfaces de red activas
 */
const getNetworkInterfaces = () => {
  const interfaces = os.networkInterfaces();
  const activeInterfaces = [];

  for (const [name, ifaceList] of Object.entries(interfaces)) {
    for (const iface of ifaceList) {
      if (!iface.internal && iface.family === 'IPv4') {
        activeInterfaces.push({
          name,
          address: iface.address,
          netmask: iface.netmask,
          cidr: iface.cidr,
          mac: iface.mac,
          family: iface.family
        });
      }
    }
  }

  return activeInterfaces;
};

/**
 * Obtiene la interfaz de red principal
 */
const getPrimaryInterface = () => {
  const interfaces = getNetworkInterfaces();
  return interfaces.length > 0 ? interfaces[0] : null;
};

/**
 * Calcula el rango de red basado en IP y máscara
 */
const calculateNetworkRange = (ip, netmask) => {
  const ipParts = ip.split('.').map(Number);
  const maskParts = netmask.split('.').map(Number);
  
  if (ipParts.length !== 4 || maskParts.length !== 4) {
    return null;
  }
  
  const network = ipParts.map((part, i) => part & maskParts[i]);
  const broadcast = ipParts.map((part, i) => part | (~maskParts[i] & 255));
  
  return {
    network: network.join('.'),
    broadcast: broadcast.join('.'),
    firstHost: network.map((part, i) => i === 3 ? part + 1 : part).join('.'),
    lastHost: broadcast.map((part, i) => i === 3 ? part - 1 : part).join('.'),
    totalHosts: Math.pow(2, 32 - maskParts.reduce((acc, val) => acc + Math.log2(~val & 255 + 1), 0)) - 2
  };
};

/**
 * Ejecuta un comando de sistema con timeout
 */
const executeCommand = async (command, timeout = 5000) => {
  try {
    const { stdout, stderr } = await execPromise(command, { timeout });
    
    if (stderr && !stderr.includes('warning')) {
      console.warn(`Comando ${command} generó stderr:`, stderr);
    }
    
    return { success: true, stdout, stderr: stderr || '' };
  } catch (error) {
    return { 
      success: false, 
      error: error.message,
      code: error.code,
      killed: error.killed,
      timedOut: error.code === 'ETIMEDOUT' || error.killed
    };
  }
};

/**
 * Verifica si una IP está en el rango de red privada
 */
const isPrivateIP = (ip) => {
  const parts = ip.split('.').map(Number);
  
  // 10.0.0.0 - 10.255.255.255
  if (parts[0] === 10) return true;
  
  // 172.16.0.0 - 172.31.255.255
  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
  
  // 192.168.0.0 - 192.168.255.255
  if (parts[0] === 192 && parts[1] === 168) return true;
  
  return false;
};

/**
 * Formatea una dirección MAC
 */
const formatMAC = (mac) => {
  if (!mac) return '00:00:00:00:00:00';
  
  // Limpiar y formatear
  const clean = mac.replace(/[^a-fA-F0-9]/g, '').toUpperCase();
  if (clean.length !== 12) return mac;
  
  return clean.match(/.{2}/g).join(':');
};

module.exports = {
  getNetworkInterfaces,
  getPrimaryInterface,
  calculateNetworkRange,
  executeCommand,
  isPrivateIP,
  formatMAC
};
