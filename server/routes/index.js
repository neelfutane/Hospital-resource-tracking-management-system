const express = require('express');
const authRoutes = require('./auth.routes');
const bedRoutes = require('./bed.routes');
const equipmentRoutes = require('./equipment.routes');
const roomRoutes = require('./room.routes');
const activityLogRoutes = require('./activityLog.routes');
const statsRoutes = require('./stats.routes');

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Mount all routers
router.use('/auth', authRoutes);
router.use('/beds', bedRoutes);
router.use('/equipment', equipmentRoutes);
router.use('/rooms', roomRoutes);
router.use('/logs', activityLogRoutes);
router.use('/stats', statsRoutes);

module.exports = router;
