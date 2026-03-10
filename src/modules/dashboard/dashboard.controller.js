const dashboardService = require('./dashboard.service');
const asyncHandler = require('../../utils/errorHandler');

const getDashboardStats = asyncHandler(async (req, res) => {
  const department = req.query.department || null;
  const result = await dashboardService.getDashboardStats(department);
  res.status(result.success ? 200 : result.statusCode || 500).json(result);
});

module.exports = {
  getDashboardStats,
};
