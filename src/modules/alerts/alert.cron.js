const cron = require('node-cron');
const alertService = require('./alert.service');
const logger = require('../../utils/logger');

class AlertCron {
  static initialize() {
    // Check thresholds every 5 minutes
    cron.schedule('*/5 * * * *', async () => {
      try {
        logger.info('Running threshold check cron job');
        await alertService.checkThresholds();
      } catch (error) {
        logger.error('Threshold check cron job error:', error);
      }
    });

    // Check for maintenance reminders every hour
    cron.schedule('0 * * * *', async () => {
      try {
        logger.info('Running maintenance reminder check');
        await this.checkMaintenanceReminders();
      } catch (error) {
        logger.error('Maintenance reminder cron job error:', error);
      }
    });

    // Clean up old resolved alerts daily at midnight
    cron.schedule('0 0 * * *', async () => {
      try {
        logger.info('Running old alerts cleanup');
        await this.cleanupOldAlerts();
      } catch (error) {
        logger.error('Alert cleanup cron job error:', error);
      }
    });

    logger.info('Alert cron jobs initialized');
  }

  static async checkMaintenanceReminders() {
    try {
      const { prisma } = require('../../config/db');
      const { AlertSocket } = require('../../sockets');
      
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(23, 59, 59, 999);

      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);

      // Find equipment due for maintenance in the next week
      const equipmentDue = await prisma.equipment.findMany({
        where: {
          nextMaintenance: {
            lte: nextWeek,
            gte: new Date(),
          },
          status: {
            not: 'MAINTENANCE',
          },
        },
        orderBy: {
          nextMaintenance: 'asc',
        },
      });

      // Send reminders for equipment due in the next 24 hours
      const urgentEquipment = equipmentDue.filter(eq => 
        eq.nextMaintenance <= tomorrow
      );

      urgentEquipment.forEach(equipment => {
        AlertSocket.broadcastMaintenanceReminder(equipment);
      });

      logger.info(`Checked maintenance reminders: ${urgentEquipment.length} urgent, ${equipmentDue.length} total`);
    } catch (error) {
      logger.error('Check maintenance reminders error:', error);
    }
  }

  static async cleanupOldAlerts() {
    try {
      const { prisma } = require('../../config/db');
      
      // Delete resolved alerts older than 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const deletedAlerts = await prisma.alert.deleteMany({
        where: {
          isActive: false,
          acknowledgedAt: {
            lt: thirtyDaysAgo,
          },
        },
      });

      // Delete read notifications older than 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const deletedNotifications = await prisma.notification.deleteMany({
        where: {
          isRead: true,
          createdAt: {
            lt: sevenDaysAgo,
          },
        },
      });

      logger.info(`Cleanup completed: ${deletedAlerts.count} alerts, ${deletedNotifications.count} notifications deleted`);
    } catch (error) {
      logger.error('Cleanup old alerts error:', error);
    }
  }
}

module.exports = AlertCron;
