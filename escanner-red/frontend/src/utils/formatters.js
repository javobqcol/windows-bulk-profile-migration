// Formatear tiempo
export const formatTime = (date) => {
  return date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

// Formatear latencia
export const formatLatency = (latency) => {
  if (!latency) return '<1ms';
  if (typeof latency === 'string') return latency;
  return `${Math.round(latency)}ms`;
};

// Acortar nombre de host
export const shortenHostname = (hostname, maxLength = 20) => {
  if (!hostname) return 'Desconocido';
  if (hostname.length <= maxLength) return hostname;
  
  // Remover sufijo de dominio si es muy largo
  const parts = hostname.split('.');
  if (parts[0].length > maxLength) {
    return parts[0].substring(0, maxLength - 3) + '...';
  }
  return parts[0];
};

// Determinar tipo de dispositivo
export const determineDeviceType = (vendor, hostname) => {
  const hostnameLower = (hostname || '').toLowerCase();
  const vendorLower = (vendor || '').toLowerCase();

  if (vendorLower.includes('raspberry')) return 'Raspberry Pi';
  if (vendorLower.includes('qemu') || vendorLower.includes('virtual')) return 'Virtual';
  if (hostnameLower.includes('router') || hostnameLower.includes('gateway')) return 'Router';
  if (hostnameLower.includes('server') || hostnameLower.includes('srv')) return 'Servidor';
  if (hostnameLower.includes('nas') || hostnameLower.includes('storage')) return 'NAS';
  if (hostnameLower.includes('printer') || hostnameLower.includes('print')) return 'Impresora';
  if (hostnameLower.includes('switch') || hostnameLower.includes('sw')) return 'Switch';
  if (vendorLower.includes('apple')) return 'Apple';
  if (vendorLower.includes('dell') || vendorLower.includes('hp') || vendorLower.includes('lenovo')) {
    return hostnameLower.includes('laptop') ? 'Portátil' : 'Computadora';
  }
  
  return 'Dispositivo';
};
