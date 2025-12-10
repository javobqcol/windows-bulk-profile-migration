import React from 'react';
import PropTypes from 'prop-types';

const Footer = ({ version, lastScan }) => {
  const formatTime = (date) => {
    if (!date) return '--:--:--';
    return date.toLocaleTimeString('es-ES');
  };

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-info">
          <span className="app-name">Network Scanner</span>
          <span className="app-version">v{version}</span>
          <span className="app-stack">Arch Linux • React • Node.js</span>
        </div>
        
        <div className="footer-stats">
          <span className="last-update">
            Último escaneo: <strong>{formatTime(lastScan)}</strong>
          </span>
          <span className="scan-frequency">Auto-escaneo: 45s</span>
        </div>
        
        <div className="footer-technologies">
          <span className="tech">NetBIOS/LLMNR</span>
          <span className="separator">•</span>
          <span className="tech">mDNS/Avahi</span>
          <span className="separator">•</span>
          <span className="tech">Reverse DNS</span>
          <span className="separator">•</span>
          <span className="tech">Detección AD</span>
        </div>
      </div>
    </footer>
  );
};

Footer.propTypes = {
  version: PropTypes.string,
  lastScan: PropTypes.instanceOf(Date)
};

Footer.defaultProps = {
  version: '2.0',
  lastScan: null
};

export default Footer;
