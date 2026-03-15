const Bed = require('../models/Bed.model');
const mongoose = require('mongoose');

const seedBeds = async () => {
  try {
    // Clear existing beds
    await Bed.deleteMany({});
    console.log('Cleared existing beds');

    const bedData = [];

    // ICU: 8 beds
    for (let i = 1; i <= 8; i++) {
      const status = ['available', 'occupied', 'maintenance'][Math.floor(Math.random() * 3)];
      bedData.push({
        ward: 'ICU',
        number: i,
        status: status,
        patientId: status === 'occupied' ? `P${1000 + i}` : null
      });
    }

    // Emergency: 12 beds
    for (let i = 1; i <= 12; i++) {
      const status = ['available', 'occupied', 'maintenance'][Math.floor(Math.random() * 3)];
      bedData.push({
        ward: 'Emergency',
        number: i,
        status: status,
        patientId: status === 'occupied' ? `P${2000 + i}` : null
      });
    }

    // General: 16 beds
    for (let i = 1; i <= 16; i++) {
      const status = ['available', 'occupied', 'maintenance'][Math.floor(Math.random() * 3)];
      bedData.push({
        ward: 'General',
        number: i,
        status: status,
        patientId: status === 'occupied' ? `P${3000 + i}` : null
      });
    }

    // Pediatrics: 16 beds
    for (let i = 1; i <= 16; i++) {
      const status = ['available', 'occupied', 'maintenance'][Math.floor(Math.random() * 3)];
      bedData.push({
        ward: 'Pediatrics',
        number: i,
        status: status,
        patientId: status === 'occupied' ? `P${4000 + i}` : null
      });
    }

    // Maternity: 16 beds
    for (let i = 1; i <= 16; i++) {
      const status = ['available', 'occupied', 'maintenance'][Math.floor(Math.random() * 3)];
      bedData.push({
        ward: 'Maternity',
        number: i,
        status: status,
        patientId: status === 'occupied' ? `P${5000 + i}` : null
      });
    }

    // Surgery: 16 beds
    for (let i = 1; i <= 16; i++) {
      const status = ['available', 'occupied', 'maintenance'][Math.floor(Math.random() * 3)];
      bedData.push({
        ward: 'Surgery',
        number: i,
        status: status,
        patientId: status === 'occupied' ? `P${6000 + i}` : null
      });
    }

    await Bed.insertMany(bedData);
    console.log(`Seeded ${bedData.length} beds successfully`);

    // Log summary
    const summary = await Bed.aggregate([
      {
        $group: {
          _id: '$ward',
          total: { $sum: 1 },
          available: { $sum: { $cond: [{ $eq: ['$status', 'available'] }, 1, 0] } },
          occupied: { $sum: { $cond: [{ $eq: ['$status', 'occupied'] }, 1, 0] } },
          maintenance: { $sum: { $cond: [{ $eq: ['$status', 'maintenance'] }, 1, 0] } }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    console.log('Bed summary by ward:');
    summary.forEach(ward => {
      console.log(`${ward._id}: ${ward.total} total, ${ward.available} available, ${ward.occupied} occupied, ${ward.maintenance} maintenance`);
    });

  } catch (error) {
    console.error('Error seeding beds:', error);
    throw error;
  }
};

module.exports = seedBeds;
