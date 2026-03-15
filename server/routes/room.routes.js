const express = require('express');
const { getRooms, updateRoomStatus } = require('../controllers/room.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { allowRoles } = require('../middleware/role.middleware');
const Joi = require('joi');

const router = express.Router();

// Validation schema for room status update
const updateRoomSchema = Joi.object({
  status: Joi.string().valid('available', 'occupied', 'cleaning').required()
});

// Apply authentication middleware to all routes
router.use(verifyToken);

router.get('/', getRooms);

router.patch('/:id', 
  allowRoles('admin', 'nurse', 'doctor'),
  (req, res, next) => {
    const { error } = updateRoomSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }
    next();
  },
  updateRoomStatus
);

module.exports = router;
