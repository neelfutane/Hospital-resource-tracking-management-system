const dotenv = require('dotenv');

dotenv.config();

module.exports = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  REDIS_URL: process.env.REDIS_URL,
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  
  // Email configuration
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  
  // Alert thresholds
  ICU_BED_THRESHOLD: parseInt(process.env.ICU_BED_THRESHOLD) || 3,
  VENTILATOR_THRESHOLD: parseInt(process.env.VENTILATOR_THRESHOLD) || 2,
  GENERAL_BED_THRESHOLD: parseInt(process.env.GENERAL_BED_THRESHOLD) || 10,
};
