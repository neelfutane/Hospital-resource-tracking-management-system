const { prisma } = require('../../config/db');
const ApiResponse = require('../../utils/apiResponse');
const logger = require('../../utils/logger');

class DashboardService {
  async getDashboardStats(department = null) {
    try {
      const whereDept = department ? { department } : {};

      const [
        bedCount,
        roomCount,
        equipmentCount,
        activeAlertsCount,
        recentActivity
      ] = await Promise.all([
        prisma.bed.count({ where: whereDept }),
        prisma.room.count({ where: whereDept }),
        prisma.equipment.count({ where: whereDept }),
        prisma.alert.count({ 
          where: { 
            isActive: true, 
            ...(department ? { department } : {}) 
          } 
        }),
        prisma.auditLog.findMany({
          take: 10,
          orderBy: { timestamp: 'desc' },
          include: {
            user: { select: { firstName: true, lastName: true, role: true } }
          }
        })
      ]);

      // Bed status distribution
      const bedStats = await prisma.bed.groupBy({
        by: ['status'],
        where: whereDept,
        _count: { id: true },
      });

      // Format for frontend
      const stats = {
        overview: {
          totalBeds: bedCount,
          totalRooms: roomCount,
          totalEquipment: equipmentCount,
          activeAlerts: activeAlertsCount,
        },
        bedDistribution: bedStats.reduce((acc, curr) => {
          acc[curr.status] = curr._count.id;
          return acc;
        }, {}),
        recentActivity
      };

      return ApiResponse.success(stats, 'Dashboard statistics retrieved successfully');
    } catch (error) {
      logger.error('Error fetching dashboard stats:', error);
      return ApiResponse.error('Failed to retrieve dashboard statistics', 500);
    }
  }
}

module.exports = new DashboardService();
