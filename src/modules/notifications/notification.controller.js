const notificationService = require('./notification.service');
const asyncHandler = require('../../utils/errorHandler');

const getNotifications = asyncHandler(async (req, res) => {
  const result = await notificationService.getNotifications(req.user.id, req.query);
  res.status(result.success ? 200 : result.statusCode || 500).json(result);
});

const markAsRead = asyncHandler(async (req, res) => {
  const result = await notificationService.markAsRead(req.params.id, req.user.id);
  res.status(result.success ? 200 : result.statusCode || 500).json(result);
});

const markAllAsRead = asyncHandler(async (req, res) => {
  const result = await notificationService.markAllAsRead(req.user.id);
  res.status(result.success ? 200 : result.statusCode || 500).json(result);
});

const getUnreadCount = asyncHandler(async (req, res) => {
  const result = await notificationService.getUnreadCount(req.user.id);
  res.status(result.success ? 200 : result.statusCode || 500).json(result);
});

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
};
