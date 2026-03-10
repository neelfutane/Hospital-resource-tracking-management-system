const bedService = require('./bed.service');

class BedController {
  async createBed(req, res) {
    const userId = req.user.id;
    const result = await bedService.createBed(req.body, userId);
    return res.status(result.statusCode).json(result);
  }

  async getAllBeds(req, res) {
    const result = await bedService.getAllBeds(req.query);
    return res.status(result.statusCode).json(result);
  }

  async getBedById(req, res) {
    const { id } = req.params;
    const result = await bedService.getBedById(id);
    return res.status(result.statusCode).json(result);
  }

  async updateBed(req, res) {
    const { id } = req.params;
    const userId = req.user.id;
    const result = await bedService.updateBed(id, req.body, userId);
    return res.status(result.statusCode).json(result);
  }

  async deleteBed(req, res) {
    const { id } = req.params;
    const userId = req.user.id;
    const result = await bedService.deleteBed(id, userId);
    return res.status(result.statusCode).json(result);
  }

  async updateBedStatus(req, res) {
    const { id } = req.params;
    const { status, ...additionalData } = req.body;
    const userId = req.user.id;
    const result = await bedService.updateBedStatus(id, status, additionalData, userId);
    return res.status(result.statusCode).json(result);
  }

  async getBedStats(req, res) {
    const { department } = req.query;
    const result = await bedService.getBedStats(department);
    return res.status(result.statusCode).json(result);
  }
}

module.exports = new BedController();
