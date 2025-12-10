import React from 'react';
import PropTypes from 'prop-types';
import { APP_CONFIG } from '../utils/constants';

const StatsBar = ({ stats, devices }) => {
  const lowLatencyCount = devices.filter(d => {
    const latency = parseInt(d.latency);
    return !isNaN(latency) && latency < APP_CONFIG.LOW_LATENCY_THRESHOLD;
  }).length;

  return (
    <div className="stats-bar">
      <div className="stat-item">
        <div className="stat-icon">🖥️</div>
        <div className="stat-content">
          <h3>{stats.total}</h3>
          <p>Total</p>
        </div>
      </div>
      
      <div className="stat-item">
        <div className="stat-icon">🏢</div>
        <div className="stat-content">
          <h3>{stats.inDomain}</h3>
          <p>En Dominio</p>
        </div>
      </div>
      
      <div className="stat-item">
        <div className="stat-icon">⚡</div>
        <div className="stat-content">
          <h3>{lowLatencyCount}</h3>
          <p>Baja Latencia</p>
        </div>
      </div>
      
      <div className="stat-item">
        <div className="stat-icon">🏷️</div>
        <div className="stat-content">
          <h3>{Object.keys(stats.byVendor || {}).length}</h3>
          <p>Fabricantes</p>
        </div>
      </div>
    </div>
  );
};

StatsBar.propTypes = {
  stats: PropTypes.shape({
    total: PropTypes.number,
    inDomain: PropTypes.number,
    byVendor: PropTypes.object
  }).isRequired,
  devices: PropTypes.array.isRequired
};

export default StatsBar;
