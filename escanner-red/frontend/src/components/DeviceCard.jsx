import React from 'react';
import PropTypes from 'prop-types';
import { VENDOR_COLORS, APP_CONFIG } from '../utils/constants';
import { copyToClipboard } from '../utils/copyToClipboard';
import { formatLatency, shortenHostname } from '../utils/formatters';

const DeviceCard = ({ device }) => {
  const handleCopyIp = () => copyToClipboard(device.ip, 'IP');
  const handleCopyMac = () => copyToClipboard(device.mac, 'MAC');
  
  const vendorColor = VENDOR_COLORS[device.vendor] || VENDOR_COLORS.Desconocido;
  const isLowLatency = parseInt(device.latency) < APP_CONFIG.LOW_LATENCY_THRESHOLD;

  return (
    <div 
      className={`device-card ${device.inDomain ? 'domain-member' : ''}`}
      style={{ borderLeftColor: vendorColor }}
      title={`${device.displayName} (${device.hostname})`}
    >
      {/* Cabecera con vendor y latencia */}
      <div className="device-header">
        <div className="vendor-section">
          <div 
            className="vendor-badge"
            style={{ backgroundColor: vendorColor }}
            title={device.vendor}
          >
            <span className="vendor-name">{device.vendor}</span>
            {device.inDomain && (
              <span className="domain-badge" title="En Dominio Active Directory">
                AD
              </span>
            )}
          </div>
          
          {device.type && device.type !== 'Dispositivo' && (
            <span className="device-type">{device.type}</span>
          )}
        </div>
        
        <div className={`latency-badge ${isLowLatency ? 'low-latency' : 'high-latency'}`}>
          <span className="latency-icon">⏱️</span>
          <span className="latency-value">{formatLatency(device.latency)}</span>
        </div>
      </div>
      
      {/* Nombre del dispositivo */}
      <h3 className="device-name" title={device.hostname}>
        {shortenHostname(device.displayName, 25)}
      </h3>
      
      {/* Detalles del dispositivo */}
      <div className="device-details">
        <DetailRow 
          label="IP:" 
          value={device.ip} 
          onClick={handleCopyIp}
          title="Copiar IP"
        />
        
        <DetailRow 
          label="MAC:" 
          value={device.mac} 
          onClick={handleCopyMac}
          title="Copiar dirección MAC"
        />
        
        <DetailRow 
          label="Interfaz:" 
          value={device.interface} 
        />
        
        <DetailRow 
          label="Última vez:" 
          value={device.lastSeen} 
        />
      </div>
      
      {/* Acciones */}
      <div className="device-actions">
        <button 
          className="action-button copy-ip"
          onClick={handleCopyIp}
          title="Copiar IP"
        >
          <span className="action-icon">📋</span>
          <span className="action-text">IP</span>
        </button>
        
        <button 
          className="action-button open-web"
          onClick={() => window.open(`http://${device.ip}`, '_blank')}
          title="Abrir en navegador"
        >
          <span className="action-icon">🌐</span>
          <span className="action-text">Web</span>
        </button>
        
        <button 
          className="action-button ping-device"
          onClick={() => window.open(`cmd://ping ${device.ip}`, '_blank')}
          title="Hacer ping"
        >
          <span className="action-icon">📶</span>
          <span className="action-text">Ping</span>
        </button>
      </div>
    </div>
  );
};

// Subcomponente para filas de detalles
const DetailRow = ({ label, value, onClick, title }) => (
  <div className="detail-row">
    <span className="detail-label">{label}</span>
    <span 
      className={`detail-value ${onClick ? 'clickable' : ''}`}
      onClick={onClick}
      title={title}
    >
      {value}
    </span>
  </div>
);

DeviceCard.propTypes = {
  device: PropTypes.shape({
    ip: PropTypes.string.isRequired,
    mac: PropTypes.string.isRequired,
    hostname: PropTypes.string,
    displayName: PropTypes.string.isRequired,
    vendor: PropTypes.string.isRequired,
    type: PropTypes.string,
    inDomain: PropTypes.bool,
    interface: PropTypes.string,
    latency: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    lastSeen: PropTypes.string
  }).isRequired
};

DetailRow.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  title: PropTypes.string
};

export default DeviceCard;
