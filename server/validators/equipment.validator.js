const Joi = require('joi');

const createEquipmentSchema = Joi.object({
  type: Joi.string().min(1).max(100).required().messages({
    'string.empty': 'Equipment type is required',
    'string.min': 'Equipment type cannot be empty',
    'string.max': 'Equipment type cannot exceed 100 characters',
    'any.required': 'Equipment type is required'
  }),
  serialId: Joi.string().min(1).max(50).required().messages({
    'string.empty': 'Serial ID is required',
    'string.min': 'Serial ID cannot be empty',
    'string.max': 'Serial ID cannot exceed 50 characters',
    'any.required': 'Serial ID is required'
  }),
  status: Joi.string().valid('available', 'in-use', 'maintenance', 'critical').required().messages({
    'any.only': 'Status must be one of: available, in-use, maintenance, critical',
    'any.required': 'Status is required'
  }),
  location: Joi.string().min(1).max(100).required().messages({
    'string.empty': 'Location is required',
    'string.min': 'Location cannot be empty',
    'string.max': 'Location cannot exceed 100 characters',
    'any.required': 'Location is required'
  })
});

const updateEquipmentSchema = Joi.object({
  type: Joi.string().min(1).max(100).optional().messages({
    'string.min': 'Equipment type cannot be empty',
    'string.max': 'Equipment type cannot exceed 100 characters'
  }),
  status: Joi.string().valid('available', 'in-use', 'maintenance', 'critical').optional().messages({
    'any.only': 'Status must be one of: available, in-use, maintenance, critical'
  }),
  location: Joi.string().min(1).max(100).optional().messages({
    'string.min': 'Location cannot be empty',
    'string.max': 'Location cannot exceed 100 characters'
  })
});

module.exports = {
  createEquipmentSchema,
  updateEquipmentSchema
};
