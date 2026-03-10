const express = require('express');
const roomController = require('./room.controller');
const authenticateToken = require('../../middleware/auth.middleware');
const { checkPermission } = require('../../middleware/role.middleware');
const { handleValidationErrors } = require('./room.validator');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Routes
router.post(
  '/',
  checkPermission('rooms:create'),
  handleValidationErrors,
  roomController.createRoom
);

router.get(
  '/',
  checkPermission('rooms:read'),
  handleValidationErrors,
  roomController.getAllRooms
);

router.get(
  '/stats',
  checkPermission('rooms:read'),
  roomController.getRoomStats
);

router.get(
  '/:id',
  checkPermission('rooms:read'),
  roomController.getRoomById
);

router.put(
  '/:id',
  checkPermission('rooms:update'),
  handleValidationErrors,
  roomController.updateRoom
);

router.patch(
  '/:id/status',
  checkPermission('rooms:update'),
  handleValidationErrors,
  roomController.updateRoomStatus
);

router.patch(
  '/:id/occupancy',
  checkPermission('rooms:update'),
  handleValidationErrors,
  roomController.updateRoomOccupancy
);

router.delete(
  '/:id',
  checkPermission('rooms:delete'),
  roomController.deleteRoom
);

module.exports = router;
