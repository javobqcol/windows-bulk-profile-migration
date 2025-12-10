import React, { useState } from 'react';
import './App.css';

// Hooks
import useNetworkScanner from './hooks/useNetworkScanner';

// Componentes
import Header from './components/Header';
import StatsBar from './components/StatsBar';
import ControlPanel from './components/ControlPanel';
import NetworkInfo from './components/NetworkInfo';
import DeviceGrid from './components/DeviceGrid';
import Footer from './components/Footer';

// Utilidades
import generateReport from './utils/generateReport';

function App() {
  const [autoScan, setAutoScan] = useState(true);
  const [filter, setFilter] = useState('all');
  
  // Usar nuestro custom hook para el escaneo
  const {
    devices,
    loading,
    error,
    networkInfo,
    lastScan,
    stats,
    scan,
    clearError
  } = useNetworkScanner(autoScan);

  // Manejar generación de reporte
  const handleGenerateReport = () => {
    generateReport(devices, networkInfo, stats);
  };

  // Manejar toggle de auto-scan
  const handleToggleAutoScan = () => {
    setAutoScan(!autoScan);
  };

  // Manejar cambio de filtro
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };

  return (
    <div className="app">
      {/* Cabecera */}
      <Header 
        networkInfo={networkInfo} 
        lastScan={lastScan} 
      />
      
      {/* Barra de estadísticas */}
      <StatsBar 
        stats={stats} 
        devices={devices} 
      />
      
      {/* Panel de control */}
      <ControlPanel 
        loading={loading}
        onScan={scan}
        onGenerateReport={handleGenerateReport}
        autoScan={autoScan}
        onToggleAutoScan={handleToggleAutoScan}
      />
      
      {/* Filtros */}
      <div className="filter-bar">
        <button 
          className={`filter-button ${filter === 'all' ? 'active' : ''}`}
          onClick={() => handleFilterChange('all')}
        >
          Todos ({devices.length})
        </button>
        <button 
          className={`filter-button ${filter === 'domain' ? 'active' : ''}`}
          onClick={() => handleFilterChange('domain')}
        >
          En Dominio ({stats.inDomain})
        </button>
        <button 
          className={`filter-button ${filter === 'non-domain' ? 'active' : ''}`}
          onClick={() => handleFilterChange('non-domain')}
        >
          Sin Dominio ({devices.length - stats.inDomain})
        </button>
        <button 
          className={`filter-button ${filter === 'low-latency' ? 'active' : ''}`}
          onClick={() => handleFilterChange('low-latency')}
        >
          Baja Latencia ({devices.filter(d => parseInt(d.latency) < 10).length})
        </button>
      </div>
      
      {/* Mensaje de error */}
      {error && (
        <div className="error-message">
          <div className="error-content">
            <span className="error-icon">⚠️</span>
            <span className="error-text">{error.message}</span>
            <button className="error-dismiss" onClick={clearError}>
              ×
            </button>
          </div>
          {error.details && (
            <div className="error-details">
              <small>{error.details}</small>
            </div>
          )}
        </div>
      )}
      
      {/* Información de red */}
      <NetworkInfo networkInfo={networkInfo} />
      
      {/* Grid de dispositivos */}
      <div className="devices-section">
        <div className="section-header">
          <h2>
            Dispositivos {filter !== 'all' && `(${filter})`}
            <span className="device-count">{devices.length} encontrados</span>
          </h2>
        </div>
        
        <DeviceGrid 
          devices={devices} 
          loading={loading} 
          filter={filter}
        />
      </div>
      
      {/* Pie de página */}
      <Footer 
        version="2.0" 
        lastScan={lastScan} 
      />
    </div>
  );
}

export default App;
