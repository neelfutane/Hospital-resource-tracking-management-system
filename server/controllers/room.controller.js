const Room = require('../models/Room.model');
const { success, error } = require('../utils/apiResponse');
const { emitRoomUpdate } = require('../services/socket.service');
const { logChange } = require('../services/activityLog.service');

const getRooms = async (req, res) => {
  try {
    const { type } = req.query;
    
    let query = {};
    if (type) {
      query.type = type;
    }

    const rooms = await Room.find(query).sort({ floor: 1, roomId: 1 });
    success(res, rooms, 'Rooms retrieved successfully');
  } catch (err) {
    console.error('Get rooms error:', err);
    error(res, 'Failed to retrieve rooms', 500);
  }
};

const updateRoomStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const room = await Room.findById(id);
    if (!room) {
      return error(res, 'Room not found', 404);
    }

    const oldStatus = room.status;
    
    // Update room
    room.status = status;
    room.lastUpdated = new Date();

    await room.save();

    // Log activity
    await logChange({
      resourceType: 'room',
      resourceId: room._id.toString(),
      oldStatus,
      newStatus: status,
      updatedBy: req.user._id
    });

    // Emit socket event
    emitRoomUpdate(room);

    success(res, room, 'Room status updated successfully');
  } catch (err) {
    console.error('Update room status error:', err);
    error(res, 'Failed to update room status', 500);
  }
};

module.exports = {
  getRooms,
  updateRoomStatus
};
