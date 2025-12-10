import React from 'react';
import PropTypes from 'prop-types';

const ControlPanel = ({ loading, onScan, onGenerateReport, autoScan, onToggleAutoScan }) => {
  return (
    <div className="control-panel">
      <div className="control-group">
        <button 
          onClick={onScan} 
          disabled={loading}
          className={`scan-button ${loading ? 'scanning' : ''}`}
          title="Realizar escaneo manual"
        >
          {loading ? (
            <>
              <span className="button-icon">🔄</span>
              <span className="button-text">Escaneando...</span>
            </>
          ) : (
            <>
              <span className="button-icon">🔍</span>
              <span className="button-text">Escanear Ahora</span>
            </>
          )}
        </button>
        
        <button 
          onClick={onGenerateReport}
          className="report-button"
          title="Generar reporte en formato texto"
        >
          <span className="button-icon">📄</span>
          <span className="button-text">Reporte</span>
        </button>
      </div>
      
      <div className="control-group">
        <label className="toggle-switch">
          <input 
            type="checkbox"
            checked={autoScan}
            onChange={onToggleAutoScan}
          />
          <span className="toggle-slider"></span>
          <span className="toggle-label">Auto-escaneo (45s)</span>
        </label>
      </div>
    </div>
  );
};

ControlPanel.propTypes = {
  loading: PropTypes.bool.isRequired,
  onScan: PropTypes.func.isRequired,
  onGenerateReport: PropTypes.func.isRequired,
  autoScan: PropTypes.bool.isRequired,
  onToggleAutoScan: PropTypes.func.isRequired
};

export default ControlPanel;
