const { prisma } = require('../../config/db');
const ApiResponse = require('../../utils/apiResponse');
const logger = require('../../utils/logger');
const { Parser } = require('json2csv');
const PDFDocument = require('pdfkit');

class AuditService {
  async createAuditLog(auditData) {
    try {
      const { userId, action, resourceType, resourceId, oldValue, newValue, ipAddress, userAgent } = auditData;

      const auditLog = await prisma.auditLog.create({
        data: {
          userId,
          action,
          resourceType,
          resourceId,
          oldValue,
          newValue,
          ipAddress,
          userAgent,
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true,
            },
          },
        },
      });

      logger.info(`Audit log created: ${action} ${resourceType} by ${auditLog.user.email}`);
      return auditLog;
    } catch (error) {
      logger.error('Create audit log error:', error);
      throw error;
    }
  }

  async getAllAuditLogs(filters = {}) {
    try {
      const { 
        userId, 
        action, 
        resourceType, 
        resourceId,
        startDate, 
        endDate, 
        page = 1, 
        limit = 50 
      } = filters;
      
      const where = {};
      if (userId) where.userId = userId;
      if (action) where.action = action;
      if (resourceType) where.resourceType = resourceType;
      if (resourceId) where.resourceId = resourceId;
      
      if (startDate || endDate) {
        where.timestamp = {};
        if (startDate) where.timestamp.gte = new Date(startDate);
        if (endDate) where.timestamp.lte = new Date(endDate);
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [auditLogs, total] = await Promise.all([
        prisma.auditLog.findMany({
          where,
          skip,
          take: parseInt(limit),
          orderBy: [
            { timestamp: 'desc' },
          ],
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                role: true,
              },
            },
          },
        }),
        prisma.auditLog.count({ where }),
      ]);

      const pagination = {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      };

      return ApiResponse.success(
        { auditLogs, pagination },
        'Audit logs retrieved successfully'
      );
    } catch (error) {
      logger.error('Get audit logs error:', error);
      return ApiResponse.error('Failed to retrieve audit logs', 500);
    }
  }

  async getAuditLogById(logId) {
    try {
      const auditLog = await prisma.auditLog.findUnique({
        where: { id: logId },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true,
              department: true,
            },
          },
        },
      });

      if (!auditLog) {
        return ApiResponse.notFound('Audit log not found');
      }

      return ApiResponse.success(auditLog, 'Audit log retrieved successfully');
    } catch (error) {
      logger.error('Get audit log error:', error);
      return ApiResponse.error('Failed to retrieve audit log', 500);
    }
  }

  async getAuditStats(filters = {}) {
    try {
      const { startDate, endDate, userId } = filters;
      
      const where = {};
      if (userId) where.userId = userId;
      
      if (startDate || endDate) {
        where.timestamp = {};
        if (startDate) where.timestamp.gte = new Date(startDate);
        if (endDate) where.timestamp.lte = new Date(endDate);
      }

      // Get stats by action
      const actionStats = await prisma.auditLog.groupBy({
        by: ['action'],
        where,
        _count: { id: true },
      });

      // Get stats by resource type
      const resourceStats = await prisma.auditLog.groupBy({
        by: ['resourceType'],
        where,
        _count: { id: true },
      });

      // Get stats by user
      const userStats = await prisma.auditLog.groupBy({
        by: ['userId'],
        where,
        _count: { id: true },
      });

      // Get user details for user stats
      const userIds = userStats.map(stat => stat.userId);
      const users = await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
        },
      });

      const userMap = users.reduce((acc, user) => {
        acc[user.id] = user;
        return acc;
      }, {});

      const formattedUserStats = userStats.map(stat => ({
        user: userMap[stat.userId],
        count: stat._count.id,
      }));

      const stats = {
        byAction: actionStats.reduce((acc, stat) => {
          acc[stat.action] = stat._count.id;
          return acc;
        }, {}),
        byResourceType: resourceStats.reduce((acc, stat) => {
          acc[stat.resourceType] = stat._count.id;
          return acc;
        }, {}),
        byUser: formattedUserStats.sort((a, b) => b.count - a.count),
        total: await prisma.auditLog.count({ where }),
      };

      return ApiResponse.success(stats, 'Audit statistics retrieved successfully');
    } catch (error) {
      logger.error('Get audit stats error:', error);
      return ApiResponse.error('Failed to retrieve audit statistics', 500);
    }
  }

  async exportAuditLogs(filters = {}, format = 'csv') {
    try {
      const { 
        userId, 
        action, 
        resourceType, 
        resourceId,
        startDate, 
        endDate,
        limit = 10000 
      } = filters;
      
      const where = {};
      if (userId) where.userId = userId;
      if (action) where.action = action;
      if (resourceType) where.resourceType = resourceType;
      if (resourceId) where.resourceId = resourceId;
      
      if (startDate || endDate) {
        where.timestamp = {};
        if (startDate) where.timestamp.gte = new Date(startDate);
        if (endDate) where.timestamp.lte = new Date(endDate);
      }

      const auditLogs = await prisma.auditLog.findMany({
        where,
        take: parseInt(limit),
        orderBy: [
          { timestamp: 'desc' },
        ],
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              role: true,
            },
          },
        },
      });

      if (format === 'csv') {
        return this.exportToCSV(auditLogs);
      } else if (format === 'pdf') {
        return this.exportToPDF(auditLogs);
      } else {
        return ApiResponse.badRequest('Invalid export format');
      }
    } catch (error) {
      logger.error('Export audit logs error:', error);
      return ApiResponse.error('Failed to export audit logs', 500);
    }
  }

  exportToCSV(auditLogs) {
    try {
      const fields = [
        { label: 'Timestamp', value: 'timestamp' },
        { label: 'User', value: row => `${row.user.firstName} ${row.user.lastName}` },
        { label: 'Email', value: row => row.user.email },
        { label: 'Role', value: row => row.user.role },
        { label: 'Action', value: 'action' },
        { label: 'Resource Type', value: 'resourceType' },
        { label: 'Resource ID', value: 'resourceId' },
        { label: 'IP Address', value: 'ipAddress' },
        { label: 'User Agent', value: 'userAgent' },
      ];

      const json2csvParser = new Parser({ fields });
      const csv = json2csvParser.parse(auditLogs);

      return {
        success: true,
        data: csv,
        filename: `audit_logs_${new Date().toISOString().split('T')[0]}.csv`,
        contentType: 'text/csv',
      };
    } catch (error) {
      logger.error('CSV export error:', error);
      return ApiResponse.error('Failed to export to CSV', 500);
    }
  }

  exportToPDF(auditLogs) {
    try {
      return new Promise((resolve) => {
        const doc = new PDFDocument();
        const chunks = [];

        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(chunks);
          resolve({
            success: true,
            data: pdfBuffer,
            filename: `audit_logs_${new Date().toISOString().split('T')[0]}.pdf`,
            contentType: 'application/pdf',
          });
        });

        // Add content to PDF
        doc.fontSize(20).text('Audit Logs Report', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Generated: ${new Date().toLocaleString()}`);
        doc.fontSize(12).text(`Total Records: ${auditLogs.length}`);
        doc.moveDown();

        // Add table headers
        const headers = ['Timestamp', 'User', 'Action', 'Resource', 'IP Address'];
        const headerY = doc.y;
        let headerX = 50;
        
        headers.forEach(header => {
          doc.fontSize(10).font('Helvetica-Bold').text(header, headerX, headerY);
          headerX += 100;
        });

        doc.moveDown();

        // Add data rows
        auditLogs.forEach((log, index) => {
          if (doc.y > 700) {
            doc.addPage();
          }

          const rowY = doc.y;
          let rowX = 50;
          
          const rowData = [
            new Date(log.timestamp).toLocaleString(),
            `${log.user.firstName} ${log.user.lastName}`,
            log.action,
            `${log.resourceType} - ${log.resourceId}`,
            log.ipAddress || 'N/A',
          ];

          rowData.forEach(data => {
            doc.fontSize(8).font('Helvetica').text(data, rowX, rowY, { width: 90 });
            rowX += 100;
          });

          doc.moveDown(0.5);
        });

        doc.end();
      });
    } catch (error) {
      logger.error('PDF export error:', error);
      return ApiResponse.error('Failed to export to PDF', 500);
    }
  }

  async getRecentActivity(limit = 50) {
    try {
      const recentLogs = await prisma.auditLog.findMany({
        take: parseInt(limit),
        orderBy: [
          { timestamp: 'desc' },
        ],
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              role: true,
            },
          },
        },
      });

      return ApiResponse.success(recentLogs, 'Recent activity retrieved successfully');
    } catch (error) {
      logger.error('Get recent activity error:', error);
      return ApiResponse.error('Failed to retrieve recent activity', 500);
    }
  }
}

module.exports = new AuditService();
