const { body, query, validationResult } = require('express-validator');
const ApiResponse = require('../../utils/apiResponse');

const validateCreateEquipment = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Equipment name is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Equipment name must be between 1 and 100 characters'),
  
  body('type')
    .trim()
    .notEmpty()
    .withMessage('Equipment type is required')
    .isLength({ min: 1, max: 50 })
    .withMessage('Equipment type must be between 1 and 50 characters'),
  
  body('department')
    .isIn(['ICU', 'ER', 'GENERAL', 'PEDIATRICS', 'CARDIOLOGY', 'NEUROLOGY', 'ORTHOPEDICS', 'MATERNITY', 'SURGERY', 'LABORATORY', 'RADIOLOGY'])
    .withMessage('Invalid department'),
  
  body('location')
    .trim()
    .notEmpty()
    .withMessage('Location is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Location must be between 1 and 100 characters'),
  
  body('model')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Model must not exceed 50 characters'),
  
  body('serialNumber')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Serial number must not exceed 50 characters'),
  
  body('status')
    .optional()
    .isIn(['AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'RESERVED', 'CLEANING'])
    .withMessage('Invalid status'),
];

const validateUpdateEquipment = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Equipment name must be between 1 and 100 characters'),
  
  body('type')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Equipment type must be between 1 and 50 characters'),
  
  body('department')
    .optional()
    .isIn(['ICU', 'ER', 'GENERAL', 'PEDIATRICS', 'CARDIOLOGY', 'NEUROLOGY', 'ORTHOPEDICS', 'MATERNITY', 'SURGERY', 'LABORATORY', 'RADIOLOGY'])
    .withMessage('Invalid department'),
  
  body('location')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Location must be between 1 and 100 characters'),
  
  body('model')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Model must not exceed 50 characters'),
  
  body('serialNumber')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Serial number must not exceed 50 characters'),
  
  body('status')
    .optional()
    .isIn(['AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'RESERVED', 'CLEANING'])
    .withMessage('Invalid status'),
  
  body('lastMaintenance')
    .optional()
    .isISO8601()
    .withMessage('Last maintenance must be a valid date'),
  
  body('nextMaintenance')
    .optional()
    .isISO8601()
    .withMessage('Next maintenance must be a valid date'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes must not exceed 500 characters'),
];

const validateUpdateEquipmentStatus = [
  body('status')
    .isIn(['AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'RESERVED', 'CLEANING'])
    .withMessage('Invalid status'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes must not exceed 500 characters'),
];

const validateScheduleMaintenance = [
  body('maintenanceDate')
    .isISO8601()
    .withMessage('Maintenance date must be a valid date')
    .isAfter(new Date().toISOString())
    .withMessage('Maintenance date must be in the future'),
];

const validateGetEquipment = [
  query('department')
    .optional()
    .isIn(['ICU', 'ER', 'GENERAL', 'PEDIATRICS', 'CARDIOLOGY', 'NEUROLOGY', 'ORTHOPEDICS', 'MATERNITY', 'SURGERY', 'LABORATORY', 'RADIOLOGY'])
    .withMessage('Invalid department'),
  
  query('status')
    .optional()
    .isIn(['AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'RESERVED', 'CLEANING'])
    .withMessage('Invalid status'),
  
  query('type')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Type must be between 1 and 50 characters'),
  
  query('location')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Location must be between 1 and 100 characters'),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path,
      message: error.msg,
    }));
    
    return res.status(400).json(
      ApiResponse.badRequest('Validation failed', errorMessages)
    );
  }
  
  next();
};

module.exports = {
  validateCreateEquipment,
  validateUpdateEquipment,
  validateUpdateEquipmentStatus,
  validateScheduleMaintenance,
  validateGetEquipment,
  handleValidationErrors,
};
