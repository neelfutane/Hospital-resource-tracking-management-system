const { query, validationResult } = require('express-validator');
const ApiResponse = require('../../utils/apiResponse');

const validateGetAuditLogs = [
  query('userId')
    .optional()
    .isUUID()
    .withMessage('User ID must be a valid UUID'),
  
  query('action')
    .optional()
    .isIn(['CREATE', 'UPDATE', 'DELETE'])
    .withMessage('Action must be one of: CREATE, UPDATE, DELETE'),
  
  query('resourceType')
    .optional()
    .isIn(['bed', 'room', 'equipment', 'user'])
    .withMessage('Resource type must be one of: bed, room, equipment, user'),
  
  query('resourceId')
    .optional()
    .isUUID()
    .withMessage('Resource ID must be a valid UUID'),
  
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date'),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Limit must be between 1 and 1000'),
];

const validateExportAuditLogs = [
  query('format')
    .optional()
    .isIn(['csv', 'pdf'])
    .withMessage('Format must be either csv or pdf'),
  
  query('userId')
    .optional()
    .isUUID()
    .withMessage('User ID must be a valid UUID'),
  
  query('action')
    .optional()
    .isIn(['CREATE', 'UPDATE', 'DELETE'])
    .withMessage('Action must be one of: CREATE, UPDATE, DELETE'),
  
  query('resourceType')
    .optional()
    .isIn(['bed', 'room', 'equipment', 'user'])
    .withMessage('Resource type must be one of: bed, room, equipment, user'),
  
  query('resourceId')
    .optional()
    .isUUID()
    .withMessage('Resource ID must be a valid UUID'),
  
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 10000 })
    .withMessage('Limit must be between 1 and 10000'),
];

const validateGetRecentActivity = [
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
  validateGetAuditLogs,
  validateExportAuditLogs,
  validateGetRecentActivity,
  handleValidationErrors,
};
