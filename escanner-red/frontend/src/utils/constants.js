// Colores por fabricante
export const VENDOR_COLORS = {
  'Netgear': '#FF6B6B',
  'Samsung': '#4ECDC4',
  'Huawei': '#FFD166',
  'Apple': '#95E1D3',
  'Dell': '#FF9A76',
  'Intel': '#6A89CC',
  'Raspberry Pi': '#C44569',
  'QEMU Virtual': '#06D6A0',
  'VirtualBox': '#786FA6',
  'Xiaomi': '#FDA7DF',
  'TP-Link': '#B8E994',
  'Cisco': '#4A69BD',
  'Router/Gateway': '#E55039',
  'Desconocido': '#8AC926'
};

// Configuración de la aplicación
export const APP_CONFIG = {
  SCAN_INTERVAL: 45000, // 45 segundos
  API_URL: 'http://localhost:3001/api/scan',
  DOMAIN_COLOR: '#9b59b6',
  LOW_LATENCY_THRESHOLD: 10 // ms
};

// Tipos de dispositivos
export const DEVICE_TYPES = {
  ROUTER: 'Router/Gateway',
  SERVER: 'Servidor',
  DESKTOP: 'Computadora',
  LAPTOP: 'Portátil',
  PHONE: 'Teléfono',
  PRINTER: 'Impresora',
  VIRTUAL: 'Virtual',
  IOT: 'IoT',
  UNKNOWN: 'Desconocido'
};
