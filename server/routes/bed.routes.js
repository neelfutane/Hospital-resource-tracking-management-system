const express = require('express');
const { getBeds, getBedById, updateBedStatus, createBed } = require('../controllers/bed.controller');
const { verifyToken } = require('../middleware/auth.middleware');
const { allowRoles } = require('../middleware/role.middleware');
const { validate } = require('../middleware/validate');
const { updateBedSchema, createBedSchema } = require('../validators/bed.validator');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(verifyToken);

router.get('/', getBeds);
router.get('/:id', getBedById);

router.post('/',
  allowRoles('admin'),
  validate(createBedSchema),
  createBed
);

router.patch('/:id', 
  allowRoles('admin', 'nurse', 'doctor'),
  validate(updateBedSchema),
  updateBedStatus
);

module.exports = router;
