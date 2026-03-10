const express = require('express');
const alertController = require('./alert.controller');
const authenticateToken = require('../../middleware/auth.middleware');
const { checkPermission } = require('../../middleware/role.middleware');
const { handleValidationErrors } = require('./alert.validator');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Routes
router.post(
  '/',
  checkPermission('alerts:create'),
  handleValidationErrors,
  alertController.createAlert
);

router.get(
  '/',
  checkPermission('alerts:read'),
  handleValidationErrors,
  alertController.getAllAlerts
);

router.get(
  '/stats',
  checkPermission('alerts:read'),
  alertController.getAlertStats
);

router.post(
  '/check-thresholds',
  checkPermission('alerts:manage'),
  alertController.checkThresholds
);

router.get(
  '/:id',
  checkPermission('alerts:read'),
  alertController.getAlertById
);

router.post(
  '/:id/acknowledge',
  checkPermission('alerts:update'),
  alertController.acknowledgeAlert
);

router.post(
  '/:id/resolve',
  checkPermission('alerts:update'),
  alertController.resolveAlert
);

module.exports = router;
