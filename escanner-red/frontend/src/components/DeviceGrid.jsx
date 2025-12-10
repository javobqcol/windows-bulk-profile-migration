import React from 'react';
import PropTypes from 'prop-types';
import DeviceCard from './DeviceCard';

const DeviceGrid = ({ devices, loading, filter = 'all' }) => {
  // Filtrar dispositivos según el filtro seleccionado
  const filteredDevices = React.useMemo(() => {
    switch (filter) {
      case 'domain':
        return devices.filter(d => d.inDomain);
      case 'non-domain':
        return devices.filter(d => !d.inDomain);
      case 'low-latency':
        return devices.filter(d => {
          const latency = parseInt(d.latency);
          return !isNaN(latency) && latency < 10;
        });
      default:
        return devices;
    }
  }, [devices, filter]);

  if (loading && devices.length === 0) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Escaneando red...</p>
      </div>
    );
  }

  if (filteredDevices.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">🔍</div>
        <h3>No se encontraron dispositivos</h3>
        <p>
          {filter === 'all' 
            ? 'No hay dispositivos activos en la red.'
            : `No hay dispositivos que coincidan con el filtro "${filter}".`
          }
        </p>
      </div>
    );
  }

  return (
    <div className="devices-grid">
      {filteredDevices.map((device, index) => (
        <DeviceCard 
          key={`${device.ip}-${index}`} 
          device={device} 
        />
      ))}
    </div>
  );
};

DeviceGrid.propTypes = {
  devices: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired,
  filter: PropTypes.oneOf(['all', 'domain', 'non-domain', 'low-latency'])
};

DeviceGrid.defaultProps = {
  filter: 'all'
};

export default DeviceGrid;
