const jwt = require('jsonwebtoken');
const { prisma } = require('../config/db');
const { JWT_SECRET } = require('../config/env');
const ApiResponse = require('../utils/apiResponse');
const logger = require('../utils/logger');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json(ApiResponse.unauthorized('Access token required'));
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        department: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      return res.status(401).json(ApiResponse.unauthorized('Invalid or inactive user'));
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json(ApiResponse.unauthorized('Invalid token'));
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json(ApiResponse.unauthorized('Token expired'));
    }
    return res.status(500).json(ApiResponse.error('Authentication failed'));
  }
};

module.exports = authenticateToken;
