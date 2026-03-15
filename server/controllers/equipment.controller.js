const Equipment = require('../models/Equipment.model');
const { success, error } = require('../utils/apiResponse');
const { emitEquipmentUpdate } = require('../services/socket.service');
const { logChange } = require('../services/activityLog.service');
const { checkEquipmentAlerts } = require('../services/alert.service');

const getEquipment = async (req, res) => {
  try {
    const { type, location } = req.query;
    
    let query = {};
    if (type) {
      query.type = type;
    }
    if (location) {
      query.location = location;
    }

    const equipment = await Equipment.find(query).sort({ type: 1, serialId: 1 });
    success(res, equipment, 'Equipment retrieved successfully');
  } catch (err) {
    console.error('Get equipment error:', err);
    error(res, 'Failed to retrieve equipment', 500);
  }
};

const updateEquipment = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, status, location } = req.body;

    const equipment = await Equipment.findById(id);
    if (!equipment) {
      return error(res, 'Equipment not found', 404);
    }

    const oldStatus = equipment.status;
    
    // Update equipment
    if (type !== undefined) {
      equipment.type = type;
    }
    if (status !== undefined) {
      equipment.status = status;
    }
    if (location !== undefined) {
      equipment.location = location;
    }
    equipment.lastUpdated = new Date();

    await equipment.save();

    // Log activity if status changed
    if (status !== undefined && oldStatus !== status) {
      await logChange({
        resourceType: 'equipment',
        resourceId: equipment._id.toString(),
        oldStatus,
        newStatus: status,
        updatedBy: req.user._id
      });
    }

    // Emit socket event
    emitEquipmentUpdate(equipment);

    // Check for alerts
    const allEquipment = await Equipment.find({});
    checkEquipmentAlerts(allEquipment);

    success(res, equipment, 'Equipment updated successfully');
  } catch (err) {
    console.error('Update equipment error:', err);
    error(res, 'Failed to update equipment', 500);
  }
};

module.exports = {
  getEquipment,
  updateEquipment
};
