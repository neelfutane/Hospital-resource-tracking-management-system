const { getHospitalStats } = require('../services/stats.service');
const { success, error } = require('../utils/apiResponse');

const getSummary = async (req, res) => {
  try {
    const stats = await getHospitalStats();
    success(res, stats, 'Hospital statistics retrieved successfully');
  } catch (err) {
    console.error('Get stats error:', err);
    error(res, 'Failed to retrieve hospital statistics', 500);
  }
};

module.exports = {
  getSummary
};
