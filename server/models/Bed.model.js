const mongoose = require('mongoose');

const bedSchema = new mongoose.Schema({
  ward: {
    type: String,
    enum: ['ICU', 'Emergency', 'General', 'Pediatrics', 'Maternity', 'Surgery'],
    required: true
  },
  number: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'occupied', 'maintenance'],
    default: 'available'
  },
  patientId: {
    type: String,
    default: null
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index for ward and number to ensure uniqueness
bedSchema.index({ ward: 1, number: 1 }, { unique: true });

module.exports = mongoose.model('Bed', bedSchema);
