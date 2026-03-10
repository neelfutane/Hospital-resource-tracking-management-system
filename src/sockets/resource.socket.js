const { getIO } = require('../config/socket');
const logger = require('../utils/logger');

class ResourceSocket {
  static broadcastResourceUpdate(resourceType, data, department = null) {
    try {
      const io = getIO();
      
      // Broadcast to all connected clients
      io.emit('resource-update', {
        type: resourceType,
        action: 'update',
        data,
        timestamp: new Date().toISOString(),
      });

      // Broadcast to department-specific room if specified
      if (department) {
        io.to(`department-${department}`).emit('department-resource-update', {
          type: resourceType,
          action: 'update',
          data,
          department,
          timestamp: new Date().toISOString(),
        });
      }

      logger.info(`Broadcasted ${resourceType} update to all clients`);
    } catch (error) {
      logger.error('Error broadcasting resource update:', error);
    }
  }

  static broadcastResourceCreate(resourceType, data, department = null) {
    try {
      const io = getIO();
      
      // Broadcast to all connected clients
      io.emit('resource-create', {
        type: resourceType,
        action: 'create',
        data,
        timestamp: new Date().toISOString(),
      });

      // Broadcast to department-specific room if specified
      if (department) {
        io.to(`department-${department}`).emit('department-resource-create', {
          type: resourceType,
          action: 'create',
          data,
          department,
          timestamp: new Date().toISOString(),
        });
      }

      logger.info(`Broadcasted ${resourceType} creation to all clients`);
    } catch (error) {
      logger.error('Error broadcasting resource creation:', error);
    }
  }

  static broadcastResourceDelete(resourceType, data, department = null) {
    try {
      const io = getIO();
      
      // Broadcast to all connected clients
      io.emit('resource-delete', {
        type: resourceType,
        action: 'delete',
        data,
        timestamp: new Date().toISOString(),
      });

      // Broadcast to department-specific room if specified
      if (department) {
        io.to(`department-${department}`).emit('department-resource-delete', {
          type: resourceType,
          action: 'delete',
          data,
          department,
          timestamp: new Date().toISOString(),
        });
      }

      logger.info(`Broadcasted ${resourceType} deletion to all clients`);
    } catch (error) {
      logger.error('Error broadcasting resource deletion:', error);
    }
  }

  static broadcastStatusChange(resourceType, resourceId, oldStatus, newStatus, department = null) {
    try {
      const io = getIO();
      const data = {
        resourceId,
        oldStatus,
        newStatus,
        department,
      };
      
      // Broadcast to all connected clients
      io.emit('status-change', {
        type: resourceType,
        action: 'status-change',
        data,
        timestamp: new Date().toISOString(),
      });

      // Broadcast to department-specific room if specified
      if (department) {
        io.to(`department-${department}`).emit('department-status-change', {
          type: resourceType,
          action: 'status-change',
          data,
          department,
          timestamp: new Date().toISOString(),
        });
      }

      logger.info(`Broadcasted ${resourceType} status change: ${oldStatus} -> ${newStatus}`);
    } catch (error) {
      logger.error('Error broadcasting status change:', error);
    }
  }

  static broadcastStatsUpdate(stats, department = null) {
    try {
      const io = getIO();
      
      // Broadcast to all connected clients
      io.emit('stats-update', {
        data: stats,
        timestamp: new Date().toISOString(),
      });

      // Broadcast to department-specific room if specified
      if (department) {
        io.to(`department-${department}`).emit('department-stats-update', {
          data: stats,
          department,
          timestamp: new Date().toISOString(),
        });
      }

      logger.info('Broadcasted statistics update to all clients');
    } catch (error) {
      logger.error('Error broadcasting stats update:', error);
    }
  }

  static sendToUser(userId, event, data) {
    try {
      const io = getIO();
      
      // Find socket for specific user
      const sockets = io.sockets.sockets;
      for (const [socketId, socket] of sockets) {
        if (socket.userId === userId) {
          socket.emit(event, {
            ...data,
            timestamp: new Date().toISOString(),
          });
          logger.info(`Sent ${event} to user ${userId}`);
          break;
        }
      }
    } catch (error) {
      logger.error('Error sending to user:', error);
    }
  }

  static sendToRole(role, event, data) {
    try {
      const io = getIO();
      
      io.to(`role-${role}`).emit(event, {
        ...data,
        timestamp: new Date().toISOString(),
      });

      logger.info(`Sent ${event} to role: ${role}`);
    } catch (error) {
      logger.error('Error sending to role:', error);
    }
  }

  static broadcastMaintenanceReminder(equipment) {
    try {
      const io = getIO();
      
      // Send to all admins and maintenance staff
      io.to('role-ADMIN').emit('maintenance-reminder', {
        equipment,
        message: `Equipment ${equipment.name} is due for maintenance`,
        timestamp: new Date().toISOString(),
      });

      // Send to department-specific room
      if (equipment.department) {
        io.to(`department-${equipment.department}`).emit('department-maintenance-reminder', {
          equipment,
          message: `Equipment ${equipment.name} is due for maintenance`,
          department: equipment.department,
          timestamp: new Date().toISOString(),
        });
      }

      logger.info(`Broadcasted maintenance reminder for equipment: ${equipment.name}`);
    } catch (error) {
      logger.error('Error broadcasting maintenance reminder:', error);
    }
  }
}

module.exports = ResourceSocket;
