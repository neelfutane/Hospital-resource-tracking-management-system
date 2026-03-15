const http = require('http');
const { app } = require('./app');
const { connectDB } = require('./config/db');
const { initializeSocket } = require('./config/socket');
const { validateEnv } = require('./config/env');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

// Validate environment variables
validateEnv();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
const io = initializeSocket(server);

// Connect to MongoDB
connectDB();

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { server, io };
