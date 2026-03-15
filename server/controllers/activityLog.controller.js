const ActivityLog = require('../models/ActivityLog.model');
const { success, error } = require('../utils/apiResponse');

const getLogs = async (req, res) => {
  try {
    const logs = await ActivityLog.find({})
      .populate('updatedBy', 'name email role')
      .sort({ timestamp: -1 })
      .limit(50);

    success(res, logs, 'Activity logs retrieved successfully');
  } catch (err) {
    console.error('Get logs error:', err);
    error(res, 'Failed to retrieve activity logs', 500);
  }
};

const getLogsByResource = async (req, res) => {
  try {
    const { resourceId } = req.params;

    const logs = await ActivityLog.find({ resourceId })
      .populate('updatedBy', 'name email role')
      .sort({ timestamp: -1 });

    success(res, logs, 'Resource activity logs retrieved successfully');
  } catch (err) {
    console.error('Get logs by resource error:', err);
    error(res, 'Failed to retrieve resource activity logs', 500);
  }
};

module.exports = {
  getLogs,
  getLogsByResource
};
