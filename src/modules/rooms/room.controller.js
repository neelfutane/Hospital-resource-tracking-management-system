const roomService = require('./room.service');

class RoomController {
  async createRoom(req, res) {
    const userId = req.user.id;
    const result = await roomService.createRoom(req.body, userId);
    return res.status(result.statusCode).json(result);
  }

  async getAllRooms(req, res) {
    const result = await roomService.getAllRooms(req.query);
    return res.status(result.statusCode).json(result);
  }

  async getRoomById(req, res) {
    const { id } = req.params;
    const result = await roomService.getRoomById(id);
    return res.status(result.statusCode).json(result);
  }

  async updateRoom(req, res) {
    const { id } = req.params;
    const userId = req.user.id;
    const result = await roomService.updateRoom(id, req.body, userId);
    return res.status(result.statusCode).json(result);
  }

  async deleteRoom(req, res) {
    const { id } = req.params;
    const userId = req.user.id;
    const result = await roomService.deleteRoom(id, userId);
    return res.status(result.statusCode).json(result);
  }

  async updateRoomStatus(req, res) {
    const { id } = req.params;
    const { status, ...additionalData } = req.body;
    const userId = req.user.id;
    const result = await roomService.updateRoomStatus(id, status, additionalData, userId);
    return res.status(result.statusCode).json(result);
  }

  async updateRoomOccupancy(req, res) {
    const { id } = req.params;
    const { occupancyChange } = req.body;
    const userId = req.user.id;
    const result = await roomService.updateRoomOccupancy(id, occupancyChange, userId);
    return res.status(result.statusCode).json(result);
  }

  async getRoomStats(req, res) {
    const { department } = req.query;
    const result = await roomService.getRoomStats(department);
    return res.status(result.statusCode).json(result);
  }
}

module.exports = new RoomController();
