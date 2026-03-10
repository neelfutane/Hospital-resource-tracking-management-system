const { prisma } = require('../../config/db');
const ApiResponse = require('../../utils/apiResponse');
const logger = require('../../utils/logger');

class BedService {
  async createBed(bedData, userId) {
    try {
      const { bedNumber, department, floor, room, status = 'AVAILABLE' } = bedData;

      // Check if bed number already exists in the same department
      const existingBed = await prisma.bed.findFirst({
        where: {
          bedNumber,
          department,
        },
      });

      if (existingBed) {
        return ApiResponse.conflict(`Bed ${bedNumber} already exists in ${department} department`);
      }

      const bed = await prisma.bed.create({
        data: {
          bedNumber,
          department,
          floor,
          room,
          status,
        },
      });

      // Log the action
      await this.logAudit(userId, 'CREATE', 'bed', bed.id, null, bed);

      logger.info(`Bed created: ${bedNumber} in ${department}`);

      return ApiResponse.created(bed, 'Bed created successfully');
    } catch (error) {
      logger.error('Create bed error:', error);
      return ApiResponse.error('Failed to create bed', 500);
    }
  }

  async getAllBeds(filters = {}) {
    try {
      const { department, status, floor, page = 1, limit = 50 } = filters;
      
      const where = {};
      if (department) where.department = department;
      if (status) where.status = status;
      if (floor) where.floor = parseInt(floor);

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [beds, total] = await Promise.all([
        prisma.bed.findMany({
          where,
          skip,
          take: parseInt(limit),
          orderBy: [
            { department: 'asc' },
            { floor: 'asc' },
            { bedNumber: 'asc' },
          ],
        }),
        prisma.bed.count({ where }),
      ]);

      const pagination = {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      };

      return ApiResponse.success(
        { beds, pagination },
        'Beds retrieved successfully'
      );
    } catch (error) {
      logger.error('Get beds error:', error);
      return ApiResponse.error('Failed to retrieve beds', 500);
    }
  }

  async getBedById(bedId) {
    try {
      const bed = await prisma.bed.findUnique({
        where: { id: bedId },
      });

      if (!bed) {
        return ApiResponse.notFound('Bed not found');
      }

      return ApiResponse.success(bed, 'Bed retrieved successfully');
    } catch (error) {
      logger.error('Get bed error:', error);
      return ApiResponse.error('Failed to retrieve bed', 500);
    }
  }

  async updateBed(bedId, updateData, userId) {
    try {
      const existingBed = await prisma.bed.findUnique({
        where: { id: bedId },
      });

      if (!existingBed) {
        return ApiResponse.notFound('Bed not found');
      }

      const updatedBed = await prisma.bed.update({
        where: { id: bedId },
        data: {
          ...updateData,
          updatedAt: new Date(),
        },
      });

      // Log the action
      await this.logAudit(userId, 'UPDATE', 'bed', bedId, existingBed, updatedBed);

      logger.info(`Bed updated: ${updatedBed.bedNumber}`);

      return ApiResponse.success(updatedBed, 'Bed updated successfully');
    } catch (error) {
      logger.error('Update bed error:', error);
      return ApiResponse.error('Failed to update bed', 500);
    }
  }

  async deleteBed(bedId, userId) {
    try {
      const existingBed = await prisma.bed.findUnique({
        where: { id: bedId },
      });

      if (!existingBed) {
        return ApiResponse.notFound('Bed not found');
      }

      await prisma.bed.delete({
        where: { id: bedId },
      });

      // Log the action
      await this.logAudit(userId, 'DELETE', 'bed', bedId, existingBed, null);

      logger.info(`Bed deleted: ${existingBed.bedNumber}`);

      return ApiResponse.success(null, 'Bed deleted successfully');
    } catch (error) {
      logger.error('Delete bed error:', error);
      return ApiResponse.error('Failed to delete bed', 500);
    }
  }

  async updateBedStatus(bedId, status, additionalData = {}, userId) {
    try {
      const existingBed = await prisma.bed.findUnique({
        where: { id: bedId },
      });

      if (!existingBed) {
        return ApiResponse.notFound('Bed not found');
      }

      const updateData = {
        status,
        lastUpdated: new Date(),
        ...additionalData,
      };

      const updatedBed = await prisma.bed.update({
        where: { id: bedId },
        data: updateData,
      });

      // Log the action
      await this.logAudit(userId, 'UPDATE', 'bed', bedId, existingBed, updatedBed);

      logger.info(`Bed status updated: ${updatedBed.bedNumber} -> ${status}`);

      return ApiResponse.success(updatedBed, 'Bed status updated successfully');
    } catch (error) {
      logger.error('Update bed status error:', error);
      return ApiResponse.error('Failed to update bed status', 500);
    }
  }

  async getBedStats(department = null) {
    try {
      const where = department ? { department } : {};

      const stats = await prisma.bed.groupBy({
        by: ['status', 'department'],
        where,
        _count: {
          id: true,
        },
      });

      const formattedStats = stats.reduce((acc, stat) => {
        const dept = stat.department;
        if (!acc[dept]) {
          acc[dept] = {
            total: 0,
            available: 0,
            occupied: 0,
            maintenance: 0,
            reserved: 0,
            cleaning: 0,
          };
        }
        
        acc[dept].total += stat._count.id;
        acc[dept][stat.status.toLowerCase()] = stat._count.id;
        
        return acc;
      }, {});

      return ApiResponse.success(formattedStats, 'Bed statistics retrieved successfully');
    } catch (error) {
      logger.error('Get bed stats error:', error);
      return ApiResponse.error('Failed to retrieve bed statistics', 500);
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

module.exports = new BedService();
