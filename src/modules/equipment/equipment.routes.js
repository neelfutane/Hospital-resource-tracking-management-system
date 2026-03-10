const express = require('express');
const equipmentController = require('./equipment.controller');
const authenticateToken = require('../../middleware/auth.middleware');
const { checkPermission } = require('../../middleware/role.middleware');
const { handleValidationErrors } = require('./equipment.validator');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Routes
router.post(
  '/',
  checkPermission('equipment:create'),
  handleValidationErrors,
  equipmentController.createEquipment
);

router.get(
  '/',
  checkPermission('equipment:read'),
  handleValidationErrors,
  equipmentController.getAllEquipment
);

router.get(
  '/stats',
  checkPermission('equipment:read'),
  equipmentController.getEquipmentStats
);

router.get(
  '/due-for-maintenance',
  checkPermission('equipment:read'),
  equipmentController.getDueForMaintenance
);

router.get(
  '/:id',
  checkPermission('equipment:read'),
  equipmentController.getEquipmentById
);

router.put(
  '/:id',
  checkPermission('equipment:update'),
  handleValidationErrors,
  equipmentController.updateEquipment
);

router.patch(
  '/:id/status',
  checkPermission('equipment:update'),
  handleValidationErrors,
  equipmentController.updateEquipmentStatus
);

router.post(
  '/:id/schedule-maintenance',
  checkPermission('equipment:update'),
  handleValidationErrors,
  equipmentController.scheduleMaintenance
);

router.post(
  '/:id/complete-maintenance',
  checkPermission('equipment:update'),
  equipmentController.completeMaintenance
);

router.delete(
  '/:id',
  checkPermission('equipment:delete'),
  equipmentController.deleteEquipment
);

module.exports = router;
