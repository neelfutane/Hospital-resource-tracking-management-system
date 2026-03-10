const express = require('express');
const authController = require('./auth.controller');
const authenticateToken = require('../../middleware/auth.middleware');
const {
  validateRegistration,
  validateLogin,
  validateChangePassword,
  handleValidationErrors,
} = require('./auth.validator');

const router = express.Router();

// Public routes
router.post('/register', validateRegistration, handleValidationErrors, authController.register);
router.post('/login', validateLogin, handleValidationErrors, authController.login);

// Protected routes
router.post('/refresh', authenticateToken, authController.refreshToken);
router.post('/change-password', authenticateToken, validateChangePassword, handleValidationErrors, authController.changePassword);
router.get('/profile', authenticateToken, authController.getProfile);
router.post('/logout', authenticateToken, authController.logout);

module.exports = router;
