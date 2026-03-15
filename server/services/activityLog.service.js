const ActivityLog = require('../models/ActivityLog.model');

const logChange = async ({ resourceType, resourceId, oldStatus, newStatus, updatedBy }) => {
  try {
    const logEntry = new ActivityLog({
      resourceType,
      resourceId,
      oldStatus,
      newStatus,
      updatedBy
    });

    await logEntry.save();
    return logEntry;
  } catch (error) {
    console.error('Error logging activity:', error);
    throw new Error('Failed to log activity');
  }
};

module.exports = {
  logChange
};
