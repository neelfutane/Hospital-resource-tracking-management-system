const { prisma } = require('../../config/db');
const ApiResponse = require('../../utils/apiResponse');
const logger = require('../../utils/logger');
const ResourceSocket = require('../../sockets/resource.socket');

class RoomService {
  async createRoom(roomData, userId) {
    try {
      const { roomNumber, type, department, floor, capacity, status = 'AVAILABLE' } = roomData;

      // Check if room number already exists in the same department
      const existingRoom = await prisma.room.findFirst({
        where: {
          roomNumber,
          department,
        },
      });

      if (existingRoom) {
        return ApiResponse.conflict(`Room ${roomNumber} already exists in ${department} department`);
      }

      const room = await prisma.room.create({
        data: {
          roomNumber,
          type,
          department,
          floor,
          capacity,
          currentOccupancy: 0,
          status,
        },
      });

      // Log the action
      await this.logAudit(userId, 'CREATE', 'room', room.id, null, room);

      // Broadcast creation
      ResourceSocket.broadcastResourceCreate('room', room, department);

      logger.info(`Room created: ${roomNumber} in ${department}`);

      return ApiResponse.created(room, 'Room created successfully');
    } catch (error) {
      logger.error('Create room error:', error);
      return ApiResponse.error('Failed to create room', 500);
    }
  }

  async getAllRooms(filters = {}) {
    try {
      const { department, status, type, floor, page = 1, limit = 50 } = filters;
      
      const where = {};
      if (department) where.department = department;
      if (status) where.status = status;
      if (type) where.type = type;
      if (floor) where.floor = parseInt(floor);

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [rooms, total] = await Promise.all([
        prisma.room.findMany({
          where,
          skip,
          take: parseInt(limit),
          orderBy: [
            { department: 'asc' },
            { floor: 'asc' },
            { roomNumber: 'asc' },
          ],
        }),
        prisma.room.count({ where }),
      ]);

      const pagination = {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      };

      return ApiResponse.success(
        { rooms, pagination },
        'Rooms retrieved successfully'
      );
    } catch (error) {
      logger.error('Get rooms error:', error);
      return ApiResponse.error('Failed to retrieve rooms', 500);
    }
  }

  async getRoomById(roomId) {
    try {
      const room = await prisma.room.findUnique({
        where: { id: roomId },
      });

      if (!room) {
        return ApiResponse.notFound('Room not found');
      }

      return ApiResponse.success(room, 'Room retrieved successfully');
    } catch (error) {
      logger.error('Get room error:', error);
      return ApiResponse.error('Failed to retrieve room', 500);
    }
  }

  async updateRoom(roomId, updateData, userId) {
    try {
      const existingRoom = await prisma.room.findUnique({
        where: { id: roomId },
      });

      if (!existingRoom) {
        return ApiResponse.notFound('Room not found');
      }

      // Validate capacity vs current occupancy
      if (updateData.capacity && updateData.capacity < existingRoom.currentOccupancy) {
        return ApiResponse.badRequest('Cannot set capacity below current occupancy');
      }

      const updatedRoom = await prisma.room.update({
        where: { id: roomId },
        data: {
          ...updateData,
          updatedAt: new Date(),
        },
      });

      // Log the action
      await this.logAudit(userId, 'UPDATE', 'room', roomId, existingRoom, updatedRoom);

      // Broadcast update
      ResourceSocket.broadcastResourceUpdate('room', updatedRoom, updatedRoom.department);

      logger.info(`Room updated: ${updatedRoom.roomNumber}`);

      return ApiResponse.success(updatedRoom, 'Room updated successfully');
    } catch (error) {
      logger.error('Update room error:', error);
      return ApiResponse.error('Failed to update room', 500);
    }
  }

  async deleteRoom(roomId, userId) {
    try {
      const existingRoom = await prisma.room.findUnique({
        where: { id: roomId },
      });

      if (!existingRoom) {
        return ApiResponse.notFound('Room not found');
      }

      if (existingRoom.currentOccupancy > 0) {
        return ApiResponse.badRequest('Cannot delete room with current occupancy');
      }

      await prisma.room.delete({
        where: { id: roomId },
      });

      // Log the action
      await this.logAudit(userId, 'DELETE', 'room', roomId, existingRoom, null);

      // Broadcast deletion
      ResourceSocket.broadcastResourceDelete('room', existingRoom, existingRoom.department);

      logger.info(`Room deleted: ${existingRoom.roomNumber}`);

      return ApiResponse.success(null, 'Room deleted successfully');
    } catch (error) {
      logger.error('Delete room error:', error);
      return ApiResponse.error('Failed to delete room', 500);
    }
  }

  async updateRoomStatus(roomId, status, additionalData = {}, userId) {
    try {
      const existingRoom = await prisma.room.findUnique({
        where: { id: roomId },
      });

      if (!existingRoom) {
        return ApiResponse.notFound('Room not found');
      }

      const updateData = {
        status,
        lastUpdated: new Date(),
        ...additionalData,
      };

      const updatedRoom = await prisma.room.update({
        where: { id: roomId },
        data: updateData,
      });

      // Log the action
      await this.logAudit(userId, 'UPDATE', 'room', roomId, existingRoom, updatedRoom);

      // Broadcast status change
      ResourceSocket.broadcastStatusChange('room', roomId, existingRoom.status, status, updatedRoom.department);
      ResourceSocket.broadcastResourceUpdate('room', updatedRoom, updatedRoom.department);

      logger.info(`Room status updated: ${updatedRoom.roomNumber} -> ${status}`);

      return ApiResponse.success(updatedRoom, 'Room status updated successfully');
    } catch (error) {
      logger.error('Update room status error:', error);
      return ApiResponse.error('Failed to update room status', 500);
    }
  }

  async updateRoomOccupancy(roomId, occupancyChange, userId) {
    try {
      const existingRoom = await prisma.room.findUnique({
        where: { id: roomId },
      });

      if (!existingRoom) {
        return ApiResponse.notFound('Room not found');
      }

      const newOccupancy = existingRoom.currentOccupancy + occupancyChange;

      if (newOccupancy < 0) {
        return ApiResponse.badRequest('Occupancy cannot be negative');
      }

      if (newOccupancy > existingRoom.capacity) {
        return ApiResponse.badRequest('Occupancy cannot exceed capacity');
      }

      const updatedRoom = await prisma.room.update({
        where: { id: roomId },
        data: {
          currentOccupancy: newOccupancy,
          lastUpdated: new Date(),
        },
      });

      // Log the action
      await this.logAudit(userId, 'UPDATE', 'room', roomId, existingRoom, updatedRoom);

      // Broadcast update
      ResourceSocket.broadcastResourceUpdate('room', updatedRoom, updatedRoom.department);

      logger.info(`Room occupancy updated: ${updatedRoom.roomNumber} -> ${newOccupancy}/${updatedRoom.capacity}`);

      return ApiResponse.success(updatedRoom, 'Room occupancy updated successfully');
    } catch (error) {
      logger.error('Update room occupancy error:', error);
      return ApiResponse.error('Failed to update room occupancy', 500);
    }
  }

  async getRoomStats(department = null) {
    try {
      const where = department ? { department } : {};

      const stats = await prisma.room.groupBy({
        by: ['status', 'department', 'type'],
        where,
        _count: {
          id: true,
        },
        _avg: {
          capacity: true,
          currentOccupancy: true,
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
            avgCapacity: 0,
            avgOccupancy: 0,
          };
        }
        
        acc[dept][type].total += stat._count.id;
        acc[dept][type][stat.status.toLowerCase()] = stat._count.id;
        acc[dept][type].avgCapacity = stat._avg.capacity || 0;
        acc[dept][type].avgOccupancy = stat._avg.currentOccupancy || 0;
        
        return acc;
      }, {});

      return ApiResponse.success(formattedStats, 'Room statistics retrieved successfully');
    } catch (error) {
      logger.error('Get room stats error:', error);
      return ApiResponse.error('Failed to retrieve room statistics', 500);
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

module.exports = new RoomService();
