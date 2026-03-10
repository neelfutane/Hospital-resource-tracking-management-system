const auditService = require('./audit.service');

class AuditController {
  async getAllAuditLogs(req, res) {
    const result = await auditService.getAllAuditLogs(req.query);
    return res.status(result.statusCode).json(result);
  }

  async getAuditLogById(req, res) {
    const { id } = req.params;
    const result = await auditService.getAuditLogById(id);
    return res.status(result.statusCode).json(result);
  }

  async getAuditStats(req, res) {
    const result = await auditService.getAuditStats(req.query);
    return res.status(result.statusCode).json(result);
  }

  async exportAuditLogs(req, res) {
    const { format = 'csv' } = req.query;
    const result = await auditService.exportAuditLogs(req.query, format);
    
    if (result.success) {
      res.setHeader('Content-Type', result.contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
      return res.send(result.data);
    }
    
    return res.status(result.statusCode).json(result);
  }

  async getRecentActivity(req, res) {
    const { limit = 50 } = req.query;
    const result = await auditService.getRecentActivity(limit);
    return res.status(result.statusCode).json(result);
  }
}

module.exports = new AuditController();
