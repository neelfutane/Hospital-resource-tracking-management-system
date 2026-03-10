const express = require('express');
const bedController = require('./bed.controller');
const authenticateToken = require('../../middleware/auth.middleware');
const { checkPermission } = require('../../middleware/role.middleware');
const {
  validateCreateBed,
  validateUpdateBed,
  validateUpdateBedStatus,
  validateGetBeds,
  handleValidationErrors,
} = require('./bed.validator');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Routes
router.post(
  '/',
  checkPermission('beds:create'),
  validateCreateBed,
  handleValidationErrors,
  bedController.createBed
);

router.get(
  '/',
  checkPermission('beds:read'),
  validateGetBeds,
  handleValidationErrors,
  bedController.getAllBeds
);

router.get(
  '/stats',
  checkPermission('beds:read'),
  bedController.getBedStats
);

router.get(
  '/:id',
  checkPermission('beds:read'),
  bedController.getBedById
);

router.put(
  '/:id',
  checkPermission('beds:update'),
  validateUpdateBed,
  handleValidationErrors,
  bedController.updateBed
);

router.patch(
  '/:id/status',
  checkPermission('beds:update'),
  validateUpdateBedStatus,
  handleValidationErrors,
  bedController.updateBedStatus
);

router.delete(
  '/:id',
  checkPermission('beds:delete'),
  bedController.deleteBed
);

module.exports = router;
