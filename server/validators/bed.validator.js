const Joi = require('joi');

const createBedSchema = Joi.object({
  number: Joi.string().required().messages({
    'string.empty': 'Bed number is required',
    'any.required': 'Bed number is required'
  }),
  ward: Joi.string().required().messages({
    'string.empty': 'Ward is required',
    'any.required': 'Ward is required'
  }),
  status: Joi.string().valid('available', 'occupied', 'maintenance').default('available').messages({
    'any.only': 'Status must be one of: available, occupied, maintenance'
  }),
  patientId: Joi.string().when('status', {
    is: 'occupied',
    then: Joi.required().messages({
      'string.empty': 'Patient ID is required when status is occupied',
      'any.required': 'Patient ID is required when status is occupied'
    }),
    otherwise: Joi.optional()
  })
});

const updateBedSchema = Joi.object({
  status: Joi.string().valid('available', 'occupied', 'maintenance').required().messages({
    'any.only': 'Status must be one of: available, occupied, maintenance',
    'any.required': 'Status is required'
  }),
  patientId: Joi.string().optional().allow('').messages({
    'string.base': 'Patient ID must be a string'
  })
});

module.exports = {
  createBedSchema,
  updateBedSchema
};
