const { prisma } = require('../../config/db');
const ApiResponse = require('../../utils/apiResponse');
const logger = require('../../utils/logger');
const ResourceSocket = require('../../sockets/resource.socket');

class EquipmentService {
  async createEquipment(equipmentData, userId) {
    try {
      const { name, type, model, serialNumber, department, location, status = 'AVAILABLE' } = equipmentData;

      // Check if serial number already exists (if provided)
      if (serialNumber) {
        const existingEquipment = await prisma.equipment.findUnique({
          where: { serialNumber },
        });

        if (existingEquipment) {
          return ApiResponse.conflict('Equipment with this serial number already exists');
        }
      }

      const equipment = await prisma.equipment.create({
        data: {
          name,
          type,
          model,
          serialNumber,
          department,
          location,
          status,
        },
      });

      // Log the action
      await this.logAudit(userId, 'CREATE', 'equipment', equipment.id, null, equipment);

      // Broadcast creation
      ResourceSocket.broadcastResourceCreate('equipment', equipment, department);

      logger.info(`Equipment created: ${name} (${type}) in ${department}`);

      return ApiResponse.created(equipment, 'Equipment created successfully');
    } catch (error) {
      logger.error('Create equipment error:', error);
      return ApiResponse.error('Failed to create equipment', 500);
    }
  }

  async getAllEquipment(filters = {}) {
    try {
      const { department, status, type, location, page = 1, limit = 50 } = filters;
      
      const where = {};
      if (department) where.department = department;
      if (status) where.status = status;
      if (type) where.type = { contains: type, mode: 'insensitive' };
      if (location) where.location = { contains: location, mode: 'insensitive' };

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [equipment, total] = await Promise.all([
        prisma.equipment.findMany({
          where,
          skip,
          take: parseInt(limit),
          orderBy: [
            { department: 'asc' },
            { type: 'asc' },
            { name: 'asc' },
          ],
        }),
        prisma.equipment.count({ where }),
      ]);

      const pagination = {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      };

      return ApiResponse.success(
        { equipment, pagination },
        'Equipment retrieved successfully'
      );
    } catch (error) {
      logger.error('Get equipment error:', error);
      return ApiResponse.error('Failed to retrieve equipment', 500);
    }
  }

  async getEquipmentById(equipmentId) {
    try {
      const equipment = await prisma.equipment.findUnique({
        where: { id: equipmentId },
      });

      if (!equipment) {
        return ApiResponse.notFound('Equipment not found');
      }

      return ApiResponse.success(equipment, 'Equipment retrieved successfully');
    } catch (error) {
      logger.error('Get equipment error:', error);
      return ApiResponse.error('Failed to retrieve equipment', 500);
    }
  }

  async updateEquipment(equipmentId, updateData, userId) {
    try {
      const existingEquipment = await prisma.equipment.findUnique({
        where: { id: equipmentId },
      });

      if (!existingEquipment) {
        return ApiResponse.notFound('Equipment not found');
      }

      // Check if serial number conflict (if being updated)
      if (updateData.serialNumber && updateData.serialNumber !== existingEquipment.serialNumber) {
        const duplicateEquipment = await prisma.equipment.findUnique({
          where: { serialNumber: updateData.serialNumber },
        });

        if (duplicateEquipment) {
          return ApiResponse.conflict('Equipment with this serial number already exists');
        }
      }

      const updatedEquipment = await prisma.equipment.update({
        where: { id: equipmentId },
        data: {
          ...updateData,
          updatedAt: new Date(),
        },
      });

      // Log the action
      await this.logAudit(userId, 'UPDATE', 'equipment', equipmentId, existingEquipment, updatedEquipment);

      // Broadcast update
      ResourceSocket.broadcastResourceUpdate('equipment', updatedEquipment, updatedEquipment.department);

      logger.info(`Equipment updated: ${updatedEquipment.name}`);

      return ApiResponse.success(updatedEquipment, 'Equipment updated successfully');
    } catch (error) {
      logger.error('Update equipment error:', error);
      return ApiResponse.error('Failed to update equipment', 500);
    }
  }

  async deleteEquipment(equipmentId, userId) {
    try {
      const existingEquipment = await prisma.equipment.findUnique({
        where: { id: equipmentId },
      });

      if (!existingEquipment) {
        return ApiResponse.notFound('Equipment not found');
      }

      await prisma.equipment.delete({
        where: { id: equipmentId },
      });

      // Log the action
      await this.logAudit(userId, 'DELETE', 'equipment', equipmentId, existingEquipment, null);

      // Broadcast deletion
      ResourceSocket.broadcastResourceDelete('equipment', existingEquipment, existingEquipment.department);

      logger.info(`Equipment deleted: ${existingEquipment.name}`);

      return ApiResponse.success(null, 'Equipment deleted successfully');
    } catch (error) {
      logger.error('Delete equipment error:', error);
      return ApiResponse.error('Failed to delete equipment', 500);
    }
  }

  async updateEquipmentStatus(equipmentId, status, additionalData = {}, userId) {
    try {
      const existingEquipment = await prisma.equipment.findUnique({
        where: { id: equipmentId },
      });

      if (!existingEquipment) {
        return ApiResponse.notFound('Equipment not found');
      }

      const updateData = {
        status,
        lastUpdated: new Date(),
        ...additionalData,
      };

      const updatedEquipment = await prisma.equipment.update({
        where: { id: equipmentId },
        data: updateData,
      });

      // Log the action
      await this.logAudit(userId, 'UPDATE', 'equipment', equipmentId, existingEquipment, updatedEquipment);

      // Broadcast status change
      ResourceSocket.broadcastStatusChange('equipment', equipmentId, existingEquipment.status, status, updatedEquipment.department);
      ResourceSocket.broadcastResourceUpdate('equipment', updatedEquipment, updatedEquipment.department);

      logger.info(`Equipment status updated: ${updatedEquipment.name} -> ${status}`);

      return ApiResponse.success(updatedEquipment, 'Equipment status updated successfully');
    } catch (error) {
      logger.error('Update equipment status error:', error);
      return ApiResponse.error('Failed to update equipment status', 500);
    }
  }

  async scheduleMaintenance(equipmentId, maintenanceDate, userId) {
    try {
      const existingEquipment = await prisma.equipment.findUnique({
        where: { id: equipmentId },
      });

      if (!existingEquipment) {
        return ApiResponse.notFound('Equipment not found');
      }

      const updatedEquipment = await prisma.equipment.update({
        where: { id: equipmentId },
        data: {
          nextMaintenance: maintenanceDate,
          lastUpdated: new Date(),
        },
      });

      // Log the action
      await this.logAudit(userId, 'UPDATE', 'equipment', equipmentId, existingEquipment, updatedEquipment);

      // Broadcast update
      ResourceSocket.broadcastResourceUpdate('equipment', updatedEquipment, updatedEquipment.department);

      logger.info(`Maintenance scheduled for equipment: ${updatedEquipment.name}`);

      return ApiResponse.success(updatedEquipment, 'Maintenance scheduled successfully');
    } catch (error) {
      logger.error('Schedule maintenance error:', error);
      return ApiResponse.error('Failed to schedule maintenance', 500);
    }
  }

  async completeMaintenance(equipmentId, userId) {
    try {
      const existingEquipment = await prisma.equipment.findUnique({
        where: { id: equipmentId },
      });

      if (!existingEquipment) {
        return ApiResponse.notFound('Equipment not found');
      }

      const now = new Date();
      const nextMaintenance = new Date(now);
      nextMaintenance.setMonth(nextMaintenance.getMonth() + 6); // Schedule next maintenance in 6 months

      const updatedEquipment = await prisma.equipment.update({
        where: { id: equipmentId },
        data: {
          status: 'AVAILABLE',
          lastMaintenance: now,
          nextMaintenance,
          lastUpdated: now,
        },
      });

      // Log the action
      await this.logAudit(userId, 'UPDATE', 'equipment', equipmentId, existingEquipment, updatedEquipment);

      // Broadcast update and status change
      ResourceSocket.broadcastResourceUpdate('equipment', updatedEquipment, updatedEquipment.department);
      ResourceSocket.broadcastStatusChange('equipment', equipmentId, existingEquipment.status, 'AVAILABLE', updatedEquipment.department);

      logger.info(`Maintenance completed for equipment: ${updatedEquipment.name}`);

      return ApiResponse.success(updatedEquipment, 'Maintenance completed successfully');
    } catch (error) {
      logger.error('Complete maintenance error:', error);
      return ApiResponse.error('Failed to complete maintenance', 500);
    }
  }

  async getEquipmentStats(department = null) {
    try {
      const where = department ? { department } : {};

      const stats = await prisma.equipment.groupBy({
        by: ['status', 'department', 'type'],
        where,
        _count: {
          id: true,
        },
      });

      const formattedStats = stats.reduce((acc, stat) => {
        const dept = stat.department;
        const type = stat.type;
        
        if (!acc[dept]) {
          acc[dept] = {};
        }
        
        if (!acc[dept][type]) {
          acc[dept][type] = {
            total: 0,
            available: 0,
            occupied: 0,
            maintenance: 0,
            reserved: 0,
            cleaning: 0,
          };
        }
        
        acc[dept][type].total += stat._count.id;
        acc[dept][type][stat.status.toLowerCase()] = stat._count.id;
        
        return acc;
      }, {});

      return ApiResponse.success(formattedStats, 'Equipment statistics retrieved successfully');
    } catch (error) {
      logger.error('Get equipment stats error:', error);
      return ApiResponse.error('Failed to retrieve equipment statistics', 500);
    }
  }

  async getDueForMaintenance() {
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const equipment = await prisma.equipment.findMany({
        where: {
          nextMaintenance: {
            lte: tomorrow,
          },
          status: {
            not: 'MAINTENANCE',
          },
        },
        orderBy: {
          nextMaintenance: 'asc',
        },
      });

      return ApiResponse.success(equipment, 'Due for maintenance equipment retrieved successfully');
    } catch (error) {
      logger.error('Get due for maintenance error:', error);
      return ApiResponse.error('Failed to retrieve due for maintenance equipment', 500);
    }
  }

  async logAudit(userId, action, resourceType, resourceId, oldValue, newValue) {
    try {
      await prisma.auditLog.create({
        data: {
          userId,
          action,
          resourceType,
          resourceId,
          oldValue: oldValue || null,
          newValue: newValue || null,
          ipAddress: null, // Will be set by middleware
          userAgent: null, // Will be set by middleware
        },
      });
    } catch (error) {
      logger.error('Audit logging error:', error);
    }
  }
}

module.exports = new EquipmentService();
