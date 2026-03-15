const Equipment = require('../models/Equipment.model');
const mongoose = require('mongoose');

const seedEquipment = async () => {
  try {
    // Clear existing equipment
    await Equipment.deleteMany({});
    console.log('Cleared existing equipment');

    const equipmentData = [];
    const equipmentTypes = ['Ventilator', 'Heart Monitor', 'Defibrillator', 'Infusion Pump', 'Wheelchair', 'X-Ray'];
    const wards = ['ICU', 'Emergency', 'General', 'Pediatrics', 'Maternity', 'Surgery'];
    const statuses = ['available', 'in-use', 'maintenance', 'critical'];

    // Generate sample equipment
    let serialCounter = 1;

    equipmentTypes.forEach(type => {
      // Create different quantities based on equipment type
      let quantity = 10; // default
      
      if (type === 'Ventilator') quantity = 8;
      if (type === 'Heart Monitor') quantity = 15;
      if (type === 'Defibrillator') quantity = 6;
      if (type === 'Infusion Pump') quantity = 20;
      if (type === 'Wheelchair') quantity = 12;
      if (type === 'X-Ray') quantity = 4;

      for (let i = 1; i <= quantity; i++) {
        // Assign random location/ward
        const location = wards[Math.floor(Math.random() * wards.length)];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        
        equipmentData.push({
          type: type,
          serialId: `${type.substring(0, 3).toUpperCase()}-${String(serialCounter).padStart(4, '0')}`,
          status: status,
          location: location
        });
        
        serialCounter++;
      }
    });

    await Equipment.insertMany(equipmentData);
    console.log(`Seeded ${equipmentData.length} equipment items successfully`);

    // Log summary
    const summary = await Equipment.aggregate([
      {
        $group: {
          _id: '$type',
          total: { $sum: 1 },
          available: { $sum: { $cond: [{ $eq: ['$status', 'available'] }, 1, 0] } },
          inUse: { $sum: { $cond: [{ $eq: ['$status', 'in-use'] }, 1, 0] } },
          maintenance: { $sum: { $cond: [{ $eq: ['$status', 'maintenance'] }, 1, 0] } },
          critical: { $sum: { $cond: [{ $eq: ['$status', 'critical'] }, 1, 0] } }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    console.log('Equipment summary by type:');
    summary.forEach(eq => {
      console.log(`${eq._id}: ${eq.total} total, ${eq.available} available, ${eq.inUse} in-use, ${eq.maintenance} maintenance, ${eq.critical} critical`);
    });

  } catch (error) {
    console.error('Error seeding equipment:', error);
    throw error;
  }
};

module.exports = seedEquipment;
