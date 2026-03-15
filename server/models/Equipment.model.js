const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true
  },
  serialId: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['available', 'in-use', 'maintenance', 'critical'],
    required: true
  },
  location: {
    type: String,
    required: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Equipment', equipmentSchema);
