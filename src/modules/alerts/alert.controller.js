const alertService = require('./alert.service');

class AlertController {
  async createAlert(req, res) {
    const userId = req.user.id;
    const result = await alertService.createAlert(req.body, userId);
    return res.status(result.statusCode).json(result);
  }

  async getAllAlerts(req, res) {
    const result = await alertService.getAllAlerts(req.query);
    return res.status(result.statusCode).json(result);
  }

  async getAlertById(req, res) {
    const { id } = req.params;
    const result = await alertService.getAlertById(id);
    return res.status(result.statusCode).json(result);
  }

  async acknowledgeAlert(req, res) {
    const { id } = req.params;
    const userId = req.user.id;
    const result = await alertService.acknowledgeAlert(id, userId);
    return res.status(result.statusCode).json(result);
  }

  async resolveAlert(req, res) {
    const { id } = req.params;
    const userId = req.user.id;
    const result = await alertService.resolveAlert(id, userId);
    return res.status(result.statusCode).json(result);
  }

  async checkThresholds(req, res) {
    await alertService.checkThresholds();
    return res.status(200).json({
      success: true,
      message: 'Threshold checks completed',
    });
  }

  async getAlertStats(req, res) {
    const result = await alertService.getAlertStats();
    return res.status(result.statusCode).json(result);
  }
}

module.exports = new AlertController();
