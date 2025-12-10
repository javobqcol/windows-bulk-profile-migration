// Servicio para comunicarse con el backend de escaneo

const API_BASE_URL = 'http://localhost:3001';

// Tipos de error
export const ScanError = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
};

// Configuración de requests
const DEFAULT_TIMEOUT = 10000; // 10 segundos

// Función de fetch con timeout
const fetchWithTimeout = async (url, options = {}, timeout = DEFAULT_TIMEOUT) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    if (error.name === 'AbortError') {
      throw new Error('Timeout: La solicitud tomó demasiado tiempo', ScanError.TIMEOUT_ERROR);
    }
    throw error;
  }
};

// Escanear red
export const scanNetwork = async () => {
  try {
    console.log('📡 Iniciando escaneo de red...');
    
    const response = await fetchWithTimeout(`${API_BASE_URL}/api/scan`);
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`, ScanError.SERVER_ERROR);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || 'Error en el escaneo', ScanError.SERVER_ERROR);
    }
    
    console.log(`✅ Escaneo completado: ${data.devices.length} dispositivos encontrados`);
    return {
      success: true,
      data: data
    };
    
  } catch (error) {
    console.error('❌ Error en escaneo:', error);
    
    // Determinar tipo de error
    let errorType = ScanError.UNKNOWN_ERROR;
    let errorMessage = error.message || 'Error desconocido';
    
    if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
      errorType = ScanError.NETWORK_ERROR;
      errorMessage = 'No se pudo conectar con el servidor backend';
    } else if (error.message.includes('Timeout')) {
      errorType = ScanError.TIMEOUT_ERROR;
      errorMessage = 'El escaneo tomó demasiado tiempo';
    }
    
    return {
      success: false,
      error: {
        type: errorType,
        message: errorMessage,
        details: error.toString()
      },
      data: null
    };
  }
};

// Obtener información del sistema
export const getSystemInfo = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/system`);
    return await response.json();
  } catch (error) {
    console.error('Error obteniendo info del sistema:', error);
    return null;
  }
};

// Verificar salud del servidor
export const checkServerHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`);
    const data = await response.json();
    return { healthy: data.status === 'OK', data };
  } catch (error) {
    return { healthy: false, error: error.message };
  }
};

export default {
  scanNetwork,
  getSystemInfo,
  checkServerHealth,
  ScanError
};
