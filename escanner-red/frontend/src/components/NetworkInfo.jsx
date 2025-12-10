import React from 'react';
import PropTypes from 'prop-types';

const NetworkInfo = ({ networkInfo }) => {
  if (!networkInfo) return null;

  return (
    <div className="network-details">
      <h3 className="section-title">
        <span className="section-icon">📡</span>
        Información de Red
      </h3>
      
      <div className="info-grid">
        <div className="info-item">
          <span className="info-label">Interfaz:</span>
          <span className="info-value">{networkInfo.interface || 'N/A'}</span>
        </div>
        
        <div className="info-item">
          <span className="info-label">IP Local:</span>
          <span className="info-value">{networkInfo.ip || 'N/A'}</span>
        </div>
        
        <div className="info-item">
          <span className="info-label">Estado:</span>
          <span className="info-value status-active">
            <span className="status-dot"></span>
            Activa
          </span>
        </div>
        
        {networkInfo.netmask && (
          <div className="info-item">
            <span className="info-label">Máscara:</span>
            <span className="info-value">{networkInfo.netmask}</span>
          </div>
        )}
        
        {networkInfo.range && (
          <div className="info-item">
            <span className="info-label">Rango:</span>
            <span className="info-value">
              {networkInfo.range.firstHost} - {networkInfo.range.lastHost}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

NetworkInfo.propTypes = {
  networkInfo: PropTypes.shape({
    interface: PropTypes.string,
    ip: PropTypes.string,
    netmask: PropTypes.string,
    range: PropTypes.shape({
      firstHost: PropTypes.string,
      lastHost: PropTypes.string
    })
  })
};

NetworkInfo.defaultProps = {
  networkInfo: null
};

export default NetworkInfo;
