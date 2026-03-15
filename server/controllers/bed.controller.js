const Bed = require('../models/Bed.model');
const { success, error } = require('../utils/apiResponse');
const { emitBedUpdate } = require('../services/socket.service');
const { logActivity } = require('../services/activityLog.service');

const createBed = async (req, res) => {
  try {
    const { number, ward, status, patientId } = req.body;

    // Check if bed number already exists in the same ward
    const existingBed = await Bed.findOne({ number, ward });
    if (existingBed) {
      return error(res, `Bed ${number} already exists in ${ward}`, 400);
    }

    // Create new bed
    const bed = new Bed({
      number,
      ward,
      status,
      patientId: status === 'occupied' ? patientId : null,
      lastUpdated: new Date()
    });

    await bed.save();

    // Emit real-time update
    emitBedUpdate(bed);

    // Log activity
    await logActivity({
      resourceType: 'bed',
      resourceId: bed._id,
      oldStatus: null,
      newStatus: status,
      updatedBy: req.user.id
    });

    success(res, bed, 'Bed created successfully', 201);
  } catch (err) {
    console.error('Create bed error:', err);
    error(res, 'Failed to create bed', 500);
  }
};

const getBeds = async (req, res) => {
  try {
    const { ward } = req.query;
    
    let query = {};
    if (ward) {
      query.ward = ward;
    }

    const beds = await Bed.find(query).sort({ ward: 1, number: 1 });
    success(res, beds, 'Beds retrieved successfully');
  } catch (err) {
    console.error('Get beds error:', err);
    error(res, 'Failed to retrieve beds', 500);
  }
};

const getBedById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const bed = await Bed.findById(id);
    if (!bed) {
      return error(res, 'Bed not found', 404);
    }

    success(res, bed, 'Bed retrieved successfully');
  } catch (err) {
    console.error('Get bed by ID error:', err);
    error(res, 'Failed to retrieve bed', 500);
  }
};

const updateBedStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, patientId } = req.body;

    const bed = await Bed.findById(id);
    if (!bed) {
      return error(res, 'Bed not found', 404);
    }

    const oldStatus = bed.status;
    
    // Update bed
    bed.status = status;
    if (patientId !== undefined) {
      bed.patientId = patientId;
    }
    bed.lastUpdated = new Date();

    await bed.save();

    // Log activity
    await logChange({
      resourceType: 'bed',
      resourceId: bed._id.toString(),
      oldStatus,
      newStatus: status,
      updatedBy: req.user._id
    });

    // Emit socket event
    emitBedUpdate(bed);

    // Check for alerts
    const allBeds = await Bed.find({});
    checkBedAlerts(bed.ward, allBeds);

    success(res, bed, 'Bed status updated successfully');
  } catch (err) {
    console.error('Update bed status error:', err);
    error(res, 'Failed to update bed status', 500);
  }
};

module.exports = {
  createBed,
  getBeds,
  getBedById,
  updateBedStatus
};
