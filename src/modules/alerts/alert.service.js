const { prisma } = require('../../config/db');
const ApiResponse = require('../../utils/apiResponse');
const logger = require('../../utils/logger');
const { AlertSocket } = require('../../sockets');

class AlertService {
  async createAlert(alertData, userId = null) {
    try {
      const { type, priority, title, message, department, resourceId, resourceType, threshold, currentValue } = alertData;

      const alert = await prisma.alert.create({
        data: {
          type,
          priority,
          title,
          message,
          department,
          resourceId,
          resourceType,
          threshold,
          currentValue,
        },
      });

      // Broadcast the alert to relevant users
      this.broadcastAlert(alert);

      // Create notifications for relevant users
      await this.createNotificationsForAlert(alert);

      logger.info(`Alert created: ${title} (${priority})`);

      return ApiResponse.created(alert, 'Alert created successfully');
    } catch (error) {
      logger.error('Create alert error:', error);
      return ApiResponse.error('Failed to create alert', 500);
    }
  }

  async getAllAlerts(filters = {}) {
    try {
      const { department, type, priority, isActive, page = 1, limit = 50 } = filters;
      
      const where = {};
      if (department) where.department = department;
      if (type) where.type = type;
      if (priority) where.priority = priority;
      if (isActive !== undefined) where.isActive = isActive;

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [alerts, total] = await Promise.all([
        prisma.alert.findMany({
          where,
          skip,
          take: parseInt(limit),
          orderBy: [
            { priority: 'desc' },
            { createdAt: 'desc' },
          ],
          include: {
            notifications: {
              select: {
                id: true,
                userId: true,
                isRead: true,
                createdAt: true,
              },
            },
          },
        }),
        prisma.alert.count({ where }),
      ]);

      const pagination = {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      };

      return ApiResponse.success(
        { alerts, pagination },
        'Alerts retrieved successfully'
      );
    } catch (error) {
      logger.error('Get alerts error:', error);
      return ApiResponse.error('Failed to retrieve alerts', 500);
    }
  }

  async getAlertById(alertId) {
    try {
      const alert = await prisma.alert.findUnique({
        where: { id: alertId },
        include: {
          notifications: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      if (!alert) {
        return ApiResponse.notFound('Alert not found');
      }

      return ApiResponse.success(alert, 'Alert retrieved successfully');
    } catch (error) {
      logger.error('Get alert error:', error);
      return ApiResponse.error('Failed to retrieve alert', 500);
    }
  }

  async acknowledgeAlert(alertId, userId) {
    try {
      const existingAlert = await prisma.alert.findUnique({
        where: { id: alertId },
      });

      if (!existingAlert) {
        return ApiResponse.notFound('Alert not found');
      }

      if (existingAlert.acknowledged) {
        return ApiResponse.badRequest('Alert already acknowledged');
      }

      const updatedAlert = await prisma.alert.update({
        where: { id: alertId },
        data: {
          acknowledged: true,
          acknowledgedBy: userId,
          acknowledgedAt: new Date(),
        },
      });

      // Broadcast acknowledgment
      AlertSocket.broadcastAlertAcknowledged(alertId, userId);

      logger.info(`Alert acknowledged: ${alertId} by user ${userId}`);

      return ApiResponse.success(updatedAlert, 'Alert acknowledged successfully');
    } catch (error) {
      logger.error('Acknowledge alert error:', error);
      return ApiResponse.error('Failed to acknowledge alert', 500);
    }
  }

  async resolveAlert(alertId, userId) {
    try {
      const existingAlert = await prisma.alert.findUnique({
        where: { id: alertId },
      });

      if (!existingAlert) {
        return ApiResponse.notFound('Alert not found');
      }

      const updatedAlert = await prisma.alert.update({
        where: { id: alertId },
        data: {
          isActive: false,
          acknowledged: true,
          acknowledgedBy: userId,
          acknowledgedAt: new Date(),
        },
      });

      // Broadcast resolution
      AlertSocket.broadcastAlertResolved(alertId, userId);

      logger.info(`Alert resolved: ${alertId} by user ${userId}`);

      return ApiResponse.success(updatedAlert, 'Alert resolved successfully');
    } catch (error) {
      logger.error('Resolve alert error:', error);
      return ApiResponse.error('Failed to resolve alert', 500);
    }
  }

  async checkThresholds() {
    try {
      const { ICU_BED_THRESHOLD, VENTILATOR_THRESHOLD, GENERAL_BED_THRESHOLD } = require('../../config/env');

      // Check ICU beds
      const icuStats = await this.getResourceStats('beds', 'ICU');
      const icuAvailable = icuStats.AVAILABLE || 0;
      if (icuAvailable <= ICU_BED_THRESHOLD) {
        await this.createThresholdAlert('ICU Beds', ICU_BED_THRESHOLD, icuAvailable, 'ICU');
      }

      // Check ventilators
      const ventilatorStats = await this.getResourceStats('equipment', 'Ventilator');
      const ventilatorAvailable = ventilatorStats.AVAILABLE || 0;
      if (ventilatorAvailable <= VENTILATOR_THRESHOLD) {
        await this.createThresholdAlert('Ventilators', VENTILATOR_THRESHOLD, ventilatorAvailable, 'ICU');
      }

      // Check general beds
      const generalStats = await this.getResourceStats('beds', 'GENERAL');
      const generalAvailable = generalStats.AVAILABLE || 0;
      if (generalAvailable <= GENERAL_BED_THRESHOLD) {
        await this.createThresholdAlert('General Beds', GENERAL_BED_THRESHOLD, generalAvailable, 'GENERAL');
      }

      logger.info('Threshold checks completed');
    } catch (error) {
      logger.error('Threshold check error:', error);
    }
  }

  async createThresholdAlert(resourceType, threshold, currentValue, department) {
    try {
      // Check if similar alert already exists and is active
      const existingAlert = await prisma.alert.findFirst({
        where: {
          type: 'THRESHOLD',
          department,
          resourceType,
          isActive: true,
          createdAt: {
            gte: new Date(Date.now() - 60 * 60 * 1000), // Last hour
          },
        },
      });

      if (existingAlert) {
        return; // Don't create duplicate alerts
      }

      const alertData = {
        type: 'THRESHOLD',
        priority: currentValue <= threshold / 2 ? 'CRITICAL' : 'HIGH',
        title: `${resourceType} Threshold Alert`,
        message: `${resourceType} availability has dropped to ${currentValue} (threshold: ${threshold})`,
        department,
        threshold,
        currentValue,
      };

      await this.createAlert(alertData);
    } catch (error) {
      logger.error('Create threshold alert error:', error);
    }
  }

  async getResourceStats(resourceType, filter) {
    try {
      if (resourceType === 'beds') {
        const stats = await prisma.bed.groupBy({
          by: ['status'],
          where: { department: filter },
          _count: { id: true },
        });
        
        return stats.reduce((acc, stat) => {
          acc[stat.status] = stat._count.id;
          return acc;
        }, {});
      } else if (resourceType === 'equipment') {
        const stats = await prisma.equipment.groupBy({
          by: ['status'],
          where: { 
            type: { contains: filter, mode: 'insensitive' }
          },
          _count: { id: true },
        });
        
        return stats.reduce((acc, stat) => {
          acc[stat.status] = stat._count.id;
          return acc;
        }, {});
      }
      
      return {};
    } catch (error) {
      logger.error('Get resource stats error:', error);
      return {};
    }
  }

  async createNotificationsForAlert(alert) {
    try {
      // Get users who should receive this alert
      let targetUsers = [];

      if (alert.department) {
        // Get users in the same department
        const deptUsers = await prisma.user.findMany({
          where: {
            department: alert.department,
            isActive: true,
            role: { in: ['DOCTOR', 'NURSE', 'ADMIN'] },
          },
          select: { id: true },
        });
        targetUsers.push(...deptUsers);
      }

      // Always include admins for high priority alerts
      if (['HIGH', 'CRITICAL'].includes(alert.priority)) {
        const admins = await prisma.user.findMany({
          where: {
            role: 'ADMIN',
            isActive: true,
          },
          select: { id: true },
        });
        targetUsers.push(...admins);
      }

      // Create notifications
      const notifications = targetUsers.map(user => ({
        userId: user.id,
        alertId: alert.id,
        title: alert.title,
        message: alert.message,
      }));

      if (notifications.length > 0) {
        await prisma.notification.createMany({
          data: notifications,
        });

        // Send real-time notifications
        notifications.forEach(notification => {
          AlertSocket.sendNotificationToUser(notification.userId, {
            id: notification.alertId,
            title: notification.title,
            message: notification.message,
            priority: alert.priority,
          });
        });
      }
    } catch (error) {
      logger.error('Create notifications error:', error);
    }
  }

  broadcastAlert(alert) {
    // Determine target departments and roles
    const targetDepartments = alert.department ? [alert.department] : null;
    const targetRoles = ['ADMIN']; // Admins always get alerts

    if (['HIGH', 'CRITICAL'].includes(alert.priority)) {
      targetRoles.push('DOCTOR', 'NURSE');
    }

    AlertSocket.broadcastAlert(alert, targetDepartments, targetRoles);
  }

  async getAlertStats() {
    try {
      const stats = await prisma.alert.groupBy({
        by: ['priority', 'type', 'isActive'],
        _count: { id: true },
      });

      const formattedStats = stats.reduce((acc, stat) => {
        const key = `${stat.type}_${stat.priority}_${stat.isActive ? 'active' : 'inactive'}`;
        acc[key] = stat._count.id;
        return acc;
      }, {});

      return ApiResponse.success(formattedStats, 'Alert statistics retrieved successfully');
    } catch (error) {
      logger.error('Get alert stats error:', error);
      return ApiResponse.error('Failed to retrieve alert statistics', 500);
    }
  }
}

module.exports = new AlertService();
