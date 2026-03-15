const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  resourceType: {
    type: String,
    enum: ['bed', 'equipment', 'room'],
    required: true
  },
  resourceId: {
    type: String,
    required: true
  },
  oldStatus: {
    type: String,
    required: true
  },
  newStatus: {
    type: String,
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient querying by resource
activityLogSchema.index({ resourceType: 1, resourceId: 1 });
activityLogSchema.index({ updatedBy: 1 });
activityLogSchema.index({ timestamp: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
