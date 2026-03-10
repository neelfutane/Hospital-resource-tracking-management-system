const equipmentService = require('./equipment.service');

class EquipmentController {
  async createEquipment(req, res) {
    const userId = req.user.id;
    const result = await equipmentService.createEquipment(req.body, userId);
    return res.status(result.statusCode).json(result);
  }

  async getAllEquipment(req, res) {
    const result = await equipmentService.getAllEquipment(req.query);
    return res.status(result.statusCode).json(result);
  }

  async getEquipmentById(req, res) {
    const { id } = req.params;
    const result = await equipmentService.getEquipmentById(id);
    return res.status(result.statusCode).json(result);
  }

  async updateEquipment(req, res) {
    const { id } = req.params;
    const userId = req.user.id;
    const result = await equipmentService.updateEquipment(id, req.body, userId);
    return res.status(result.statusCode).json(result);
  }

  async deleteEquipment(req, res) {
    const { id } = req.params;
    const userId = req.user.id;
    const result = await equipmentService.deleteEquipment(id, userId);
    return res.status(result.statusCode).json(result);
  }

  async updateEquipmentStatus(req, res) {
    const { id } = req.params;
    const { status, ...additionalData } = req.body;
    const userId = req.user.id;
    const result = await equipmentService.updateEquipmentStatus(id, status, additionalData, userId);
    return res.status(result.statusCode).json(result);
  }

  async scheduleMaintenance(req, res) {
    const { id } = req.params;
    const { maintenanceDate } = req.body;
    const userId = req.user.id;
    const result = await equipmentService.scheduleMaintenance(id, maintenanceDate, userId);
    return res.status(result.statusCode).json(result);
  }

  async completeMaintenance(req, res) {
    const { id } = req.params;
    const userId = req.user.id;
    const result = await equipmentService.completeMaintenance(id, userId);
    return res.status(result.statusCode).json(result);
  }

  async getEquipmentStats(req, res) {
    const { department } = req.query;
    const result = await equipmentService.getEquipmentStats(department);
    return res.status(result.statusCode).json(result);
  }

  async getDueForMaintenance(req, res) {
    const result = await equipmentService.getDueForMaintenance();
    return res.status(result.statusCode).json(result);
  }
}

module.exports = new EquipmentController();
