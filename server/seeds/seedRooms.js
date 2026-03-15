const Room = require('../models/Room.model');
const mongoose = require('mongoose');

const seedRooms = async () => {
  try {
    // Clear existing rooms
    await Room.deleteMany({});
    console.log('Cleared existing rooms');

    const roomData = [];
    const statuses = ['available', 'occupied', 'cleaning'];
    let roomCounter = 1;

    // Operating Rooms: 6 rooms, floors 2-3
    for (let i = 1; i <= 6; i++) {
      const floor = i <= 3 ? 2 : 3;
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      roomData.push({
        roomId: `OR-${String(i).padStart(2, '0')}`,
        type: 'Operating Room',
        floor: floor,
        status: status
      });
      roomCounter++;
    }

    // ICU Rooms: 8 rooms, floor 4
    for (let i = 1; i <= 8; i++) {
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      roomData.push({
        roomId: `ICU-${String(i).padStart(2, '0')}`,
        type: 'ICU Room',
        floor: 4,
        status: status
      });
      roomCounter++;
    }

    // Isolation Rooms: 4 rooms, floor 4
    for (let i = 1; i <= 4; i++) {
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      roomData.push({
        roomId: `ISO-${String(i).padStart(2, '0')}`,
        type: 'Isolation',
        floor: 4,
        status: status
      });
      roomCounter++;
    }

    // Recovery Rooms: 5 rooms, floor 3
    for (let i = 1; i <= 5; i++) {
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      roomData.push({
        roomId: `REC-${String(i).padStart(2, '0')}`,
        type: 'Recovery',
        floor: 3,
        status: status
      });
      roomCounter++;
    }

    // Consultation Rooms: 8 rooms, floors 1-2
    for (let i = 1; i <= 8; i++) {
      const floor = i <= 4 ? 1 : 2;
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      roomData.push({
        roomId: `CON-${String(i).padStart(2, '0')}`,
        type: 'Consultation',
        floor: floor,
        status: status
      });
      roomCounter++;
    }

    await Room.insertMany(roomData);
    console.log(`Seeded ${roomData.length} rooms successfully`);

    // Log summary
    const summary = await Room.aggregate([
      {
        $group: {
          _id: '$type',
          total: { $sum: 1 },
          available: { $sum: { $cond: [{ $eq: ['$status', 'available'] }, 1, 0] } },
          occupied: { $sum: { $cond: [{ $eq: ['$status', 'occupied'] }, 1, 0] } },
          cleaning: { $sum: { $cond: [{ $eq: ['$status', 'cleaning'] }, 1, 0] } }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    console.log('Room summary by type:');
    summary.forEach(room => {
      console.log(`${room._id}: ${room.total} total, ${room.available} available, ${room.occupied} occupied, ${room.cleaning} cleaning`);
    });

  } catch (error) {
    console.error('Error seeding rooms:', error);
    throw error;
  }
};

module.exports = seedRooms;
