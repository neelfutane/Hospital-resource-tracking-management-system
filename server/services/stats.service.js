const Bed = require('../models/Bed.model');
const Equipment = require('../models/Equipment.model');
const Room = require('../models/Room.model');
const { occupancyCalculator } = require('../utils/occupancyCalculator');

const getHospitalStats = async () => {
  try {
    // Get all resources
    const beds = await Bed.find({});
    const equipment = await Equipment.find({});
    const rooms = await Room.find({});

    // Calculate bed statistics
    const bedStats = occupancyCalculator(beds);
    
    // Overall bed statistics
    const totalBeds = beds.length;
    const availableBeds = beds.filter(bed => bed.status === 'available').length;
    const occupiedBeds = beds.filter(bed => bed.status === 'occupied').length;
    const maintenanceBeds = beds.filter(bed => bed.status === 'maintenance').length;
    const overallOccupancy = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

    // Equipment statistics
    const equipmentStats = {
      total: equipment.length,
      available: equipment.filter(eq => eq.status === 'available').length,
      inUse: equipment.filter(eq => eq.status === 'in-use').length,
      maintenance: equipment.filter(eq => eq.status === 'maintenance').length,
      critical: equipment.filter(eq => eq.status === 'critical').length
    };

    // Room statistics
    const roomStats = {
      total: rooms.length,
      available: rooms.filter(room => room.status === 'available').length,
      occupied: rooms.filter(room => room.status === 'occupied').length,
      cleaning: rooms.filter(room => room.status === 'cleaning').length
    };

    // Equipment by type
    const equipmentByType = {};
    equipment.forEach(eq => {
      if (!equipmentByType[eq.type]) {
        equipmentByType[eq.type] = { total: 0, available: 0, inUse: 0, maintenance: 0, critical: 0 };
      }
      equipmentByType[eq.type].total++;
      equipmentByType[eq.type][eq.status]++;
    });

    // Rooms by type
    const roomsByType = {};
    rooms.forEach(room => {
      if (!roomsByType[room.type]) {
        roomsByType[room.type] = { total: 0, available: 0, occupied: 0, cleaning: 0 };
      }
      roomsByType[room.type].total++;
      roomsByType[room.type][room.status]++;
    });

    return {
      beds: {
        overall: {
          total: totalBeds,
          available: availableBeds,
          occupied: occupiedBeds,
          maintenance: maintenanceBeds,
          occupancyPercent: overallOccupancy
        },
        byWard: bedStats
      },
      equipment: {
        overall: equipmentStats,
        byType: equipmentByType
      },
      rooms: {
        overall: roomStats,
        byType: roomsByType
      },
      lastUpdated: new Date()
    };
  } catch (error) {
    console.error('Error getting hospital stats:', error);
    throw new Error('Failed to retrieve hospital statistics');
  }
};

module.exports = {
  getHospitalStats
};
