const express = require('express');
const router = express.Router();
const notifController = require('../controllers/notificationController');

router.get('/user/:email', notifController.getUserNotifications);
router.get('/unread/:email', notifController.getUnreadCount);
router.patch('/:notificationId/read', notifController.markAsRead);
router.post('/read-all', notifController.markAllAsRead);

module.exports = router;