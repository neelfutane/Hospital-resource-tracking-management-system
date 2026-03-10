const http = require('http');
const app = require('./src/app');
const { connectDB } = require('./src/config/db');
const { initializeSocket } = require('./src/config/socket');
const { PORT, NODE_ENV } = require('./src/config/env');
const AlertCron = require('./src/modules/alerts/alert.cron');
const logger = require('./src/utils/logger');

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
const io = initializeSocket(server);

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Initialize cron jobs
    AlertCron.initialize();
    
    // Start listening
    server.listen(PORT, () => {
      logger.info(`🚀 Server running in ${NODE_ENV} mode on port ${PORT}`);
      logger.info(`📊 Health check: http://localhost:${PORT}/health`);
      logger.info(`🔌 Socket.io server initialized`);
      
      if (NODE_ENV === 'development') {
        console.log(`
╔══════════════════════════════════════════════════════════════╗
║                    HOSPITAL RESOURCE TRACKER                     ║
╠══════════════════════════════════════════════════════════════╣
║  Server: http://localhost:${PORT}                                ║
║  Health:  http://localhost:${PORT}/health                        ║
║  Mode:    ${NODE_ENV}                                              ║
║  Socket:  ✅ Initialized                                          ║
║  Database: ✅ Connected                                           ║
║  Cron Jobs: ✅ Scheduled                                          ║
╚══════════════════════════════════════════════════════════════╝
        `);
      }
    });
    
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle server errors
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    logger.error(`Port ${PORT} is already in use`);
  } else {
    logger.error('Server error:', error);
  }
  process.exit(1);
});

// Start the server
startServer();
