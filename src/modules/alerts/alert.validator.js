const { body, query, validationResult } = require('express-validator');
const ApiResponse = require('../../utils/apiResponse');

const validateCreateAlert = [
  body('type')
    .isIn(['THRESHOLD', 'MAINTENANCE', 'EMERGENCY', 'SYSTEM'])
    .withMessage('Invalid alert type'),
  
  body('priority')
    .isIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
    .withMessage('Invalid alert priority'),
  
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Alert title is required')
    .isLength({ min: 1, max: 200 })
    .withMessage('Alert title must be between 1 and 200 characters'),
  
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Alert message is required')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Alert message must be between 1 and 1000 characters'),
  
  body('department')
    .optional()
    .isIn(['ICU', 'ER', 'GENERAL', 'PEDIATRICS', 'CARDIOLOGY', 'NEUROLOGY', 'ORTHOPEDICS', 'MATERNITY', 'SURGERY', 'LABORATORY', 'RADIOLOGY'])
    .withMessage('Invalid department'),
  
  body('resourceId')
    .optional()
    .isUUID()
    .withMessage('Resource ID must be a valid UUID'),
  
  body('resourceType')
    .optional()
    .isIn(['bed', 'room', 'equipment'])
    .withMessage('Invalid resource type'),
  
  body('threshold')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Threshold must be a non-negative integer'),
  
  body('currentValue')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Current value must be a non-negative integer'),
];

const validateGetAlerts = [
  query('department')
    .optional()
    .isIn(['ICU', 'ER', 'GENERAL', 'PEDIATRICS', 'CARDIOLOGY', 'NEUROLOGY', 'ORTHOPEDICS', 'MATERNITY', 'SURGERY', 'LABORATORY', 'RADIOLOGY'])
    .withMessage('Invalid department'),
  
  query('type')
    .optional()
    .isIn(['THRESHOLD', 'MAINTENANCE', 'EMERGENCY', 'SYSTEM'])
    .withMessage('Invalid alert type'),
  
  query('priority')
    .optional()
    .isIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
    .withMessage('Invalid alert priority'),
  
  query('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  
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
  validateCreateAlert,
  validateGetAlerts,
  handleValidationErrors,
};
