const { prisma } = require('../../config/db');
const ApiResponse = require('../../utils/apiResponse');
const logger = require('../../utils/logger');

class NotificationService {
  async getNotifications(userId, query = {}) {
    try {
      const { limit = 50, page = 1, isRead } = query;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      const where = { userId };
      if (isRead !== undefined) {
        where.isRead = isRead === 'true';
      }

      const [notifications, total] = await Promise.all([
        prisma.notification.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: parseInt(limit),
        }),
        prisma.notification.count({ where }),
      ]);

      return ApiResponse.success({
        notifications,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / parseInt(limit)),
        },
      }, 'Notifications retrieved successfully');
    } catch (error) {
      logger.error('Error fetching notifications:', error);
      return ApiResponse.error('Failed to retrieve notifications', 500);
    }
  }

  async markAsRead(notificationId, userId) {
    try {
      const notification = await prisma.notification.findFirst({
        where: { id: notificationId, userId },
      });

      if (!notification) {
        return ApiResponse.notFound('Notification not found');
      }

      const updated = await prisma.notification.update({
        where: { id: notificationId },
        data: { isRead: true },
      });

      const unreadCount = await prisma.notification.count({
        where: { userId, isRead: false },
      });

      return ApiResponse.success({ notification: updated, unreadCount }, 'Notification marked as read');
    } catch (error) {
      logger.error('Error marking notification read:', error);
      return ApiResponse.error('Failed to update notification', 500);
    }
  }

  async markAllAsRead(userId) {
    try {
      await prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true },
      });

      return ApiResponse.success({ unreadCount: 0 }, 'All notifications marked as read');
    } catch (error) {
      logger.error('Error marking all notifications read:', error);
      return ApiResponse.error('Failed to update notifications', 500);
    }
  }

  async getUnreadCount(userId) {
    try {
      const count = await prisma.notification.count({
        where: { userId, isRead: false },
      });

      return ApiResponse.success({ count }, 'Unread count retrieved');
    } catch (error) {
      logger.error('Error getting unread count:', error);
      return ApiResponse.error('Failed to retrieve count', 500);
    }
  }
}

module.exports = new NotificationService();
