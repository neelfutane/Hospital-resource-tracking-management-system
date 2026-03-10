const express = require('express');
const auditController = require('./audit.controller');
const authenticateToken = require('../../middleware/auth.middleware');
const { checkPermission } = require('../../middleware/role.middleware');
const { handleValidationErrors } = require('./audit.validator');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Routes
router.get(
  '/',
  checkPermission('audit:read'),
  handleValidationErrors,
  auditController.getAllAuditLogs
);

router.get(
  '/stats',
  checkPermission('audit:read'),
  auditController.getAuditStats
);

router.get(
  '/export',
  checkPermission('audit:export'),
  handleValidationErrors,
  auditController.exportAuditLogs
);

router.get(
  '/recent',
  checkPermission('audit:read'),
  handleValidationErrors,
  auditController.getRecentActivity
);

router.get(
  '/:id',
  checkPermission('audit:read'),
  auditController.getAuditLogById
);

module.exports = router;
