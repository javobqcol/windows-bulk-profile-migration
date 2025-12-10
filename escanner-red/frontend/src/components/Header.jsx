import React from 'react';
import PropTypes from 'prop-types';

const Header = ({ networkInfo, lastScan }) => {
  const formatTime = (date) => {
    if (!date) return 'Nunca';
    return date.toLocaleTimeString('es-ES');
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-title">
          <h1>🌐 Escáner de Red</h1>
          <p className="subtitle">Monitoreo en tiempo real • Detección de dominio</p>
        </div>
        
        <div className="header-info">
          {networkInfo && (
            <div className="network-status">
              <div className="network-badge">
                <span className="badge-icon">📡</span>
                <span className="badge-text">{networkInfo.interface}</span>
              </div>
              <div className="network-ip">{networkInfo.ip}</div>
            </div>
          )}
          
          <div className="last-scan">
            <span className="scan-label">Último escaneo:</span>
            <span className="scan-time">{formatTime(lastScan)}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

Header.propTypes = {
  networkInfo: PropTypes.shape({
    interface: PropTypes.string,
    ip: PropTypes.string
  }),
  lastScan: PropTypes.instanceOf(Date)
};

Header.defaultProps = {
  networkInfo: null,
  lastScan: null
};

export default Header;
