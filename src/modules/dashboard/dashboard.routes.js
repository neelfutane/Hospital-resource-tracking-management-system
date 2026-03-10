const express = require('express');
const controller = require('./dashboard.controller');
const authenticateToken = require('../../middleware/auth.middleware');

const router = express.Router();

router.use(authenticateToken);

router.get('/stats', controller.getDashboardStats);

module.exports = router;
