const express = require('express');
const controller = require('./notification.controller');
const authenticateToken = require('../../middleware/auth.middleware');

const router = express.Router();

router.use(authenticateToken);

router.get('/', controller.getNotifications);
router.get('/count', controller.getUnreadCount);
router.patch('/read-all', controller.markAllAsRead);
router.patch('/:id/read', controller.markAsRead);

module.exports = router;
