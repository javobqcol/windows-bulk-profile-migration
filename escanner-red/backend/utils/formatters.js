/**
 * Formatea la latencia para mostrar
 */
const formatLatency = (latencyMs) => {
  if (!latencyMs || latencyMs === 0) return '<1ms';
  if (latencyMs < 1000) return `${Math.round(latencyMs)}ms`;
  return `${(latencyMs / 1000).toFixed(2)}s`;
};

/**
 * Formatea el tiempo para mostrar
 */
const formatTime = (date = new Date()) => {
  return date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

/**
 * Formatea bytes a tamaño legible
 */
const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

/**
 * Trunca un texto si es muy largo
 */
const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};

/**
 * Capitaliza la primera letra
 */
const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

module.exports = {
  formatLatency,
  formatTime,
  formatBytes,
  truncateText,
  capitalize
};
