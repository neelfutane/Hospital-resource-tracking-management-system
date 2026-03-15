const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { corsOptions } = require('./config/cors');
const routes = require('./routes');
const { errorHandler } = require('./middleware/errorHandler');
const { requestLogger } = require('./middleware/requestLogger');

const app = express();

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(requestLogger);

// Routes
app.use('/api/v1', routes);

// Error handler
app.use(errorHandler);

module.exports = { app };
