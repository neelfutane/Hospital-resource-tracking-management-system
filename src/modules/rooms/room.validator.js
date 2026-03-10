const { body, query, validationResult } = require('express-validator');
const ApiResponse = require('../../utils/apiResponse');

const validateCreateRoom = [
  body('roomNumber')
    .trim()
    .notEmpty()
    .withMessage('Room number is required')
    .isLength({ min: 1, max: 20 })
    .withMessage('Room number must be between 1 and 20 characters'),
  
  body('type')
    .trim()
    .notEmpty()
    .withMessage('Room type is required')
    .isLength({ min: 1, max: 50 })
    .withMessage('Room type must be between 1 and 50 characters'),
  
  body('department')
    .isIn(['ICU', 'ER', 'GENERAL', 'PEDIATRICS', 'CARDIOLOGY', 'NEUROLOGY', 'ORTHOPEDICS', 'MATERNITY', 'SURGERY', 'LABORATORY', 'RADIOLOGY'])
    .withMessage('Invalid department'),
  
  body('floor')
    .isInt({ min: 1, max: 50 })
    .withMessage('Floor must be between 1 and 50'),
  
  body('capacity')
    .isInt({ min: 1, max: 20 })
    .withMessage('Capacity must be between 1 and 20'),
  
  body('status')
    .optional()
    .isIn(['AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'RESERVED', 'CLEANING'])
    .withMessage('Invalid status'),
];

const validateUpdateRoom = [
  body('roomNumber')
    .optional()
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Room number must be between 1 and 20 characters'),
  
  body('type')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Room type must be between 1 and 50 characters'),
  
  body('department')
    .optional()
    .isIn(['ICU', 'ER', 'GENERAL', 'PEDIATRICS', 'CARDIOLOGY', 'NEUROLOGY', 'ORTHOPEDICS', 'MATERNITY', 'SURGERY', 'LABORATORY', 'RADIOLOGY'])
    .withMessage('Invalid department'),
  
  body('floor')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Floor must be between 1 and 50'),
  
  body('capacity')
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage('Capacity must be between 1 and 20'),
  
  body('status')
    .optional()
    .isIn(['AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'RESERVED', 'CLEANING'])
    .withMessage('Invalid status'),
  
  body('currentOccupancy')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Current occupancy must be a non-negative integer'),
  
  body('scheduledFor')
    .optional()
    .isISO8601()
    .withMessage('Scheduled for must be a valid date'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes must not exceed 500 characters'),
];

const validateUpdateRoomStatus = [
  body('status')
    .isIn(['AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'RESERVED', 'CLEANING'])
    .withMessage('Invalid status'),
  
  body('scheduledFor')
    .optional()
    .isISO8601()
    .withMessage('Scheduled for must be a valid date'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes must not exceed 500 characters'),
];

const validateUpdateRoomOccupancy = [
  body('occupancyChange')
    .isInt({ min: -20, max: 20 })
    .withMessage('Occupancy change must be between -20 and 20'),
];

const validateGetRooms = [
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
  validateCreateRoom,
  validateUpdateRoom,
  validateUpdateRoomStatus,
  validateUpdateRoomOccupancy,
  validateGetRooms,
  handleValidationErrors,
};
