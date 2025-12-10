const express = require('express');
const { PORT } = require('./config/constants');

// Middleware
const corsMiddleware = require('./middleware/cors');
const loggerMiddleware = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');

// Rutas
const apiRoutes = require('./routes');

// Inicializar Express
const app = express();

// Middleware básico
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware personalizado
app.use(corsMiddleware());
app.use(loggerMiddleware({ logResponseTime: true }));

// Rutas
app.use('/api', apiRoutes);

// Ruta por defecto
app.get('/', (req, res) => {
  res.redirect('/api');
});

// Middleware de manejo de errores (debe ir al final)
app.use(errorHandler);

// Iniciar servidor
const startServer = () => {
  return new Promise((resolve, reject) => {
    const server = app.listen(PORT, '0.0.0.0', () => {
      const address = server.address();
      console.log(`
╔══════════════════════════════════════════════════╗
║        🚀 NETWORK SCANNER API v2.0              ║
╠══════════════════════════════════════════════════╣
║ Status:  🟢 ONLINE                              ║
║ Port:    ${PORT}                                   ║
║ Mode:    ${process.env.NODE_ENV || 'development'}  ║
╠══════════════════════════════════════════════════╣
║ Endpoints disponibles:                          ║
║ • http://localhost:${PORT}/api                   ║
║ • http://localhost:${PORT}/api/scan              ║
║ • http://localhost:${PORT}/api/system            ║
║ • http://localhost:${PORT}/api/health            ║
╠══════════════════════════════════════════════════╣
║ Características:                                ║
║ • Arquitectura modular                          ║
║ • Escaneo en paralelo                           ║
║ • Detección de dominio AD                       ║
║ • Resolución de nombres multi-método            ║
║ • Historial de escaneos                         ║
║ • Monitoreo de salud del sistema                ║
╚══════════════════════════════════════════════════╝
      `);
      
      resolve(server);
    });

    server.on('error', (error) => {
      console.error('❌ Error al iniciar servidor:', error);
      reject(error);
    });
  });
};

// Manejar señales de terminación
const setupGracefulShutdown = (server) => {
  const shutdown = async (signal) => {
    console.log(`\n🛑 Recibida señal ${signal}. Cerrando servidor...`);
    
    server.close(() => {
      console.log('✅ Servidor cerrado correctamente.');
      process.exit(0);
    });

    // Forzar cierre después de 5 segundos
    setTimeout(() => {
      console.error('⏰ Timeout forzando cierre del servidor.');
      process.exit(1);
    }, 5000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGUSR2', () => shutdown('SIGUSR2')); // Para nodemon
};

// Iniciar aplicación
if (require.main === module) {
  startServer()
    .then(server => {
      setupGracefulShutdown(server);
    })
    .catch(error => {
      console.error('❌ Error fatal:', error);
      process.exit(1);
    });
}

module.exports = { app, startServer };
