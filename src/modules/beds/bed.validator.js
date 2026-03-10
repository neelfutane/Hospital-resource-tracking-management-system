const { body, query, validationResult } = require('express-validator');
const ApiResponse = require('../../utils/apiResponse');

const validateCreateBed = [
  body('bedNumber')
    .trim()
    .notEmpty()
    .withMessage('Bed number is required')
    .isLength({ min: 1, max: 20 })
    .withMessage('Bed number must be between 1 and 20 characters'),
  
  body('department')
    .isIn(['ICU', 'ER', 'GENERAL', 'PEDIATRICS', 'CARDIOLOGY', 'NEUROLOGY', 'ORTHOPEDICS', 'MATERNITY', 'SURGERY', 'LABORATORY', 'RADIOLOGY'])
    .withMessage('Invalid department'),
  
  body('floor')
    .isInt({ min: 1, max: 50 })
    .withMessage('Floor must be between 1 and 50'),
  
  body('room')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Room must be between 1 and 50 characters'),
  
  body('status')
    .optional()
    .isIn(['AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'RESERVED', 'CLEANING'])
    .withMessage('Invalid status'),
];

const validateUpdateBed = [
  body('bedNumber')
    .optional()
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Bed number must be between 1 and 20 characters'),
  
  body('department')
    .optional()
    .isIn(['ICU', 'ER', 'GENERAL', 'PEDIATRICS', 'CARDIOLOGY', 'NEUROLOGY', 'ORTHOPEDICS', 'MATERNITY', 'SURGERY', 'LABORATORY', 'RADIOLOGY'])
    .withMessage('Invalid department'),
  
  body('floor')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Floor must be between 1 and 50'),
  
  body('room')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Room must be between 1 and 50 characters'),
  
  body('status')
    .optional()
    .isIn(['AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'RESERVED', 'CLEANING'])
    .withMessage('Invalid status'),
  
  body('patientName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Patient name must be between 1 and 100 characters'),
  
  body('patientId')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Patient ID must be between 1 and 50 characters'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes must not exceed 500 characters'),
];

const validateUpdateBedStatus = [
  body('status')
    .isIn(['AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'RESERVED', 'CLEANING'])
    .withMessage('Invalid status'),
  
  body('patientName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Patient name must be between 1 and 100 characters'),
  
  body('patientId')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Patient ID must be between 1 and 50 characters'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes must not exceed 500 characters'),
];

const validateGetBeds = [
  query('department')
    .optional()
    .isIn(['ICU', 'ER', 'GENERAL', 'PEDIATRICS', 'CARDIOLOGY', 'NEUROLOGY', 'ORTHOPEDICS', 'MATERNITY', 'SURGERY', 'LABORATORY', 'RADIOLOGY'])
    .withMessage('Invalid department'),
  
  query('status')
    .optional()
    .isIn(['AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'RESERVED', 'CLEANING'])
    .withMessage('Invalid status'),
  
  query('floor')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Floor must be between 1 and 50'),
  
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
  validateCreateBed,
  validateUpdateBed,
  validateUpdateBedStatus,
  validateGetBeds,
  handleValidationErrors,
};
