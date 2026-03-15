const { getIO } = require('../config/socket');

const emitBedUpdate = (bed) => {
  const io = getIO();
  if (io) {
    io.emit('bed:updated', bed);
  }
};

const emitEquipmentUpdate = (equipment) => {
  const io = getIO();
  if (io) {
    io.emit('equipment:updated', equipment);
  }
};

const emitRoomUpdate = (room) => {
  const io = getIO();
  if (io) {
    io.emit('room:updated', room);
  }
};

const emitAlert = (message) => {
  const io = getIO();
  if (io) {
    io.emit('alert:triggered', { message, timestamp: new Date() });
  }
};

module.exports = {
  emitBedUpdate,
  emitEquipmentUpdate,
  emitRoomUpdate,
  emitAlert
};
