import { useState, useCallback, useEffect } from 'react';
import { scanNetwork, ScanError } from '../services/networkScanner';
import { APP_CONFIG } from '../utils/constants';
import useInterval from './useInterval';

// Custom hook para manejar el escaneo de red
export const useNetworkScanner = (autoScan = true) => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [networkInfo, setNetworkInfo] = useState(null);
  const [lastScan, setLastScan] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    inDomain: 0,
    byVendor: {},
    lowLatency: 0
  });

  // Función principal de escaneo
  const performScan = useCallback(async () => {
    if (loading) return;

    setLoading(true);
    setError(null);

    const result = await scanNetwork();

    if (result.success) {
      const { data } = result;
      
      setDevices(data.devices || []);
      setNetworkInfo(data.network);
      setLastScan(new Date());
      
      // Calcular estadísticas
      const inDomainCount = (data.devices || []).filter(d => d.inDomain).length;
      const lowLatencyCount = (data.devices || []).filter(d => {
        const latency = parseInt(d.latency);
        return !isNaN(latency) && latency < APP_CONFIG.LOW_LATENCY_THRESHOLD;
      }).length;
      
      // Contar por fabricante
      const vendorCount = {};
      (data.devices || []).forEach(device => {
        vendorCount[device.vendor] = (vendorCount[device.vendor] || 0) + 1;
      });
      
      setStats({
        total: data.total || 0,
        inDomain: inDomainCount,
        lowLatency: lowLatencyCount,
        byVendor: vendorCount
      });
      
      console.log(`📊 Escaneo exitoso: ${data.total} dispositivos`);
    } else {
      setError({
        type: result.error.type,
        message: result.error.message,
        details: result.error.details
      });
      
      // Si es error de red, mantener dispositivos previos si existen
      if (result.error.type === ScanError.NETWORK_ERROR && devices.length === 0) {
        // Podríamos cargar datos de ejemplo aquí si queremos
        console.log('Modo offline - sin datos previos');
      }
    }

    setLoading(false);
  }, [loading, devices.length]);

  // Escaneo automático con intervalo
  useInterval(
    () => {
      if (autoScan && !loading) {
        performScan();
      }
    },
    autoScan ? APP_CONFIG.SCAN_INTERVAL : null
  );

  // Escanear al montar el componente
  useEffect(() => {
    performScan();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    // Estado
    devices,
    loading,
    error,
    networkInfo,
    lastScan,
    stats,
    
    // Acciones
    scan: performScan,
    clearError: () => setError(null),
    
    // Métodos de utilidad
    getDomainDevices: () => devices.filter(d => d.inDomain),
    getNonDomainDevices: () => devices.filter(d => !d.inDomain),
    getDeviceByIp: (ip) => devices.find(d => d.ip === ip),
    getDevicesByVendor: (vendor) => devices.filter(d => d.vendor === vendor)
  };
};

export default useNetworkScanner;
