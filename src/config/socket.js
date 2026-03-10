const { Server } = require('socket.io');
const { REDIS_URL } = require('./env');
const logger = require('../utils/logger');

let io;

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // Socket.io middleware for authentication
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const jwt = require('jsonwebtoken');
      const { JWT_SECRET } = require('./env');
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Attach user info to socket
      socket.userId = decoded.userId;
      socket.userRole = decoded.role;
      socket.userEmail = decoded.email;
      
      next();
    } catch (error) {
      logger.error('Socket authentication error:', error);
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id} (User: ${socket.userEmail})`);

    // Join department-specific rooms
    socket.on('join-department', (department) => {
      socket.join(`department-${department}`);
      logger.info(`User ${socket.userEmail} joined department: ${department}`);
    });

    // Leave department rooms
    socket.on('leave-department', (department) => {
      socket.leave(`department-${department}`);
      logger.info(`User ${socket.userEmail} left department: ${department}`);
    });

    // Join role-specific rooms
    socket.on('join-role', (role) => {
      socket.join(`role-${role}`);
      logger.info(`User ${socket.userEmail} joined role: ${role}`);
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      logger.info(`Socket disconnected: ${socket.id} (User: ${socket.userEmail}) - Reason: ${reason}`);
    });

    // Error handling
    socket.on('error', (error) => {
      logger.error(`Socket error for ${socket.id}:`, error);
    });
  });

  logger.info('Socket.io server initialized');
  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

module.exports = {
  initializeSocket,
  getIO,
};
