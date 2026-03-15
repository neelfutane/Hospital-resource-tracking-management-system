const express = require('express');
const { getLogs, getLogsByResource } = require('../controllers/activityLog.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { allowRoles } = require('../middleware/role.middleware');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(verifyToken);

// Admin only access
router.use(allowRoles('admin'));

router.get('/', getLogs);
router.get('/:resourceId', getLogsByResource);

module.exports = router;
