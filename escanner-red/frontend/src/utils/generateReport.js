// Generar reporte en formato texto
export const generateReport = (devices, networkInfo, stats) => {
  const timestamp = new Date().toLocaleString();
  const domainDevices = devices.filter(d => d.inDomain);
  const nonDomainDevices = devices.filter(d => !d.inDomain);

  const report = `
============================================
REPORTE DE ESCANEO DE RED
============================================
Fecha: ${timestamp}
Generado por: Network Scanner v2.0

INFORMACIÓN DE RED
-------------------
Interfaz: ${networkInfo?.interface || 'N/A'}
IP Local: ${networkInfo?.ip || 'N/A'}

ESTADÍSTICAS
------------
Total dispositivos: ${stats.total}
En dominio: ${stats.inDomain}
Fuera de dominio: ${stats.total - stats.inDomain}

DISPOSITIVOS EN DOMINIO (${domainDevices.length})
---------------------------------------------
${domainDevices.map((d, i) => formatDeviceLine(d, i + 1)).join('\n')}

DISPOSITIVOS FUERA DE DOMINIO (${nonDomainDevices.length})
---------------------------------------------------------
${nonDomainDevices.map((d, i) => formatDeviceLine(d, i + 1)).join('\n')}

RESUMEN POR FABRICANTE
----------------------
${getVendorSummary(devices)}

============================================
FIN DEL REPORTE
============================================
`.trim();

  downloadReport(report);
};

// Formatear línea de dispositivo para el reporte
const formatDeviceLine = (device, index) => {
  return `${index}. ${device.displayName}
     IP: ${device.ip}
     MAC: ${device.mac}
     Fabricante: ${device.vendor}
     Tipo: ${device.type}
     Latencia: ${device.latency}
     Dominio: ${device.inDomain ? 'Sí' : 'No'}
     Última vez: ${device.lastSeen}`;
};

// Resumen por fabricante
const getVendorSummary = (devices) => {
  const vendorCount = {};
  devices.forEach(device => {
    vendorCount[device.vendor] = (vendorCount[device.vendor] || 0) + 1;
  });

  return Object.entries(vendorCount)
    .map(([vendor, count]) => `- ${vendor}: ${count} dispositivo(s)`)
    .join('\n');
};

// Descargar reporte
const downloadReport = (content) => {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  
  const dateStr = new Date().toISOString().split('T')[0];
  const timeStr = new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
  
  a.href = url;
  a.download = `reporte-red-${dateStr}_${timeStr}.txt`;
  a.style.display = 'none';
  
  document.body.appendChild(a);
  a.click();
  
  // Limpiar
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
};

export default generateReport;
