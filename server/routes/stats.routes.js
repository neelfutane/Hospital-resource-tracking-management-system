const express = require('express');
const { getSummary } = require('../controllers/stats.controller');
const { verifyToken } = require('../middleware/auth.middleware');

const router = express.Router();

// Apply authentication middleware
router.use(verifyToken);

router.get('/summary', getSummary);

module.exports = router;
