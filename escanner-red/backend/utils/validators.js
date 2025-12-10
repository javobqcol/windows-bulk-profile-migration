/**
 * Valida una dirección IPv4
 */
const isValidIPv4 = (ip) => {
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  return ipv4Regex.test(ip);
};

/**
 * Valida una dirección MAC
 */
const isValidMAC = (mac) => {
  const macRegex = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/;
  return macRegex.test(mac);
};

/**
 * Valida un nombre de host
 */
const isValidHostname = (hostname) => {
  if (!hostname || hostname.length > 255) return false;
  
  const hostnameRegex = /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$/;
  return hostnameRegex.test(hostname);
};

/**
 * Sanitiza una entrada de texto
 */
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/[<>]/g, '')  // Remover tags HTML
    .trim()
    .substring(0, 1000);   // Limitar longitud
};

/**
 * Valida los parámetros de escaneo
 */
const validateScanParams = (params) => {
  const errors = [];
  
  if (params.timeout && (isNaN(params.timeout) || params.timeout < 100 || params.timeout > 30000)) {
    errors.push('El timeout debe estar entre 100 y 30000 ms');
  }
  
  if (params.range) {
    if (!isValidIPv4(params.range.split('-')[0])) {
      errors.push('Rango de IP inválido');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

module.exports = {
  isValidIPv4,
  isValidMAC,
  isValidHostname,
  sanitizeInput,
  validateScanParams
};
