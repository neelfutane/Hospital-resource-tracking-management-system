const { getIO } = require('../config/socket');
const logger = require('../utils/logger');

class AlertSocket {
  static broadcastAlert(alert, targetDepartments = null, targetRoles = null) {
    try {
      const io = getIO();
      
      const alertData = {
        id: alert.id,
        type: alert.type,
        priority: alert.priority,
        title: alert.title,
        message: alert.message,
        department: alert.department,
        resourceId: alert.resourceId,
        resourceType: alert.resourceType,
        timestamp: alert.createdAt || new Date().toISOString(),
      };

      // Broadcast to all connected clients
      io.emit('new-alert', alertData);

      // Broadcast to specific departments
      if (targetDepartments && Array.isArray(targetDepartments)) {
        targetDepartments.forEach(dept => {
          io.to(`department-${dept}`).emit('department-alert', {
            ...alertData,
            targetDepartment: dept,
          });
        });
      }

      // Broadcast to specific roles
      if (targetRoles && Array.isArray(targetRoles)) {
        targetRoles.forEach(role => {
          io.to(`role-${role}`).emit('role-alert', {
            ...alertData,
            targetRole: role,
          });
        });
      }

      // If alert has a specific department, broadcast to that department
      if (alert.department) {
        io.to(`department-${alert.department}`).emit('department-alert', {
          ...alertData,
          targetDepartment: alert.department,
        });
      }

      logger.info(`Broadcasted alert: ${alert.title} (Priority: ${alert.priority})`);
    } catch (error) {
      logger.error('Error broadcasting alert:', error);
    }
  }

  static broadcastThresholdAlert(type, threshold, currentValue, department) {
    try {
      const io = getIO();
      
      const alertData = {
        type: 'THRESHOLD',
        priority: 'HIGH',
        title: `${type} Threshold Alert`,
        message: `${type} availability has dropped to ${currentValue} (threshold: ${threshold})`,
        department,
        threshold,
        currentValue,
        timestamp: new Date().toISOString(),
      };

      // Send to all admins
      io.to('role-ADMIN').emit('threshold-alert', alertData);

      // Send to department staff
      if (department) {
        io.to(`department-${department}`).emit('department-threshold-alert', {
          ...alertData,
          targetDepartment: department,
        });
      }

      // Also send to all doctors and nurses in that department
      ['DOCTOR', 'NURSE'].forEach(role => {
        io.to(`role-${role}`).emit('threshold-alert', alertData);
      });

      logger.info(`Broadcasted threshold alert for ${type} in ${department}: ${currentValue}/${threshold}`);
    } catch (error) {
      logger.error('Error broadcasting threshold alert:', error);
    }
  }

  static broadcastEmergencyAlert(alert, affectedDepartments = null) {
    try {
      const io = getIO();
      
      const alertData = {
        ...alert,
        isEmergency: true,
        timestamp: new Date().toISOString(),
      };

      // Emergency alerts go to everyone
      io.emit('emergency-alert', alertData);

      // Also send to all roles
      ['ADMIN', 'DOCTOR', 'NURSE'].forEach(role => {
        io.to(`role-${role}`).emit('emergency-alert', alertData);
      });

      // Send to specific departments if provided
      if (affectedDepartments && Array.isArray(affectedDepartments)) {
        affectedDepartments.forEach(dept => {
          io.to(`department-${dept}`).emit('department-emergency-alert', {
            ...alertData,
            targetDepartment: dept,
          });
        });
      }

      logger.info(`Broadcasted emergency alert: ${alert.title}`);
    } catch (error) {
      logger.error('Error broadcasting emergency alert:', error);
    }
  }

  static broadcastAlertAcknowledged(alertId, acknowledgedBy) {
    try {
      const io = getIO();
      
      const acknowledgmentData = {
        alertId,
        acknowledgedBy,
        timestamp: new Date().toISOString(),
      };

      // Broadcast to all connected clients
      io.emit('alert-acknowledged', acknowledgmentData);

      // Send to admins
      io.to('role-ADMIN').emit('alert-acknowledgment', acknowledgmentData);

      logger.info(`Broadcasted alert acknowledgment: ${alertId} by ${acknowledgedBy}`);
    } catch (error) {
      logger.error('Error broadcasting alert acknowledgment:', error);
    }
  }

  static broadcastAlertResolved(alertId, resolvedBy) {
    try {
      const io = getIO();
      
      const resolutionData = {
        alertId,
        resolvedBy,
        timestamp: new Date().toISOString(),
      };

      // Broadcast to all connected clients
      io.emit('alert-resolved', resolutionData);

      // Send to admins
      io.to('role-ADMIN').emit('alert-resolution', resolutionData);

      logger.info(`Broadcasted alert resolution: ${alertId} by ${resolvedBy}`);
    } catch (error) {
      logger.error('Error broadcasting alert resolution:', error);
    }
  }

  static sendNotificationToUser(userId, notification) {
    try {
      const io = getIO();
      
      const notificationData = {
        ...notification,
        timestamp: new Date().toISOString(),
      };

      // Find socket for specific user
      const sockets = io.sockets.sockets;
      for (const [socketId, socket] of sockets) {
        if (socket.userId === userId) {
          socket.emit('notification', notificationData);
          logger.info(`Sent notification to user ${userId}: ${notification.title}`);
          break;
        }
      }
    } catch (error) {
      logger.error('Error sending notification to user:', error);
    }
  }

  static broadcastSystemAlert(message, severity = 'MEDIUM') {
    try {
      const io = getIO();
      
      const systemAlert = {
        type: 'SYSTEM',
        priority: severity,
        title: 'System Alert',
        message,
        timestamp: new Date().toISOString(),
      };

      // Send to all admins
      io.to('role-ADMIN').emit('system-alert', systemAlert);

      logger.info(`Broadcasted system alert: ${message}`);
    } catch (error) {
      logger.error('Error broadcasting system alert:', error);
    }
  }
}

module.exports = AlertSocket;
