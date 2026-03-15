const express = require('express');
const { getEquipment, updateEquipment } = require('../controllers/equipment.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { allowRoles } = require('../middleware/role.middleware');
const { validate } = require('../middleware/validate');
const { updateEquipmentSchema } = require('../validators/equipment.validator');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(verifyToken);

router.get('/', getEquipment);

router.patch('/:id', 
  allowRoles('admin', 'nurse'),
  validate(updateEquipmentSchema),
  updateEquipment
);

module.exports = router;
