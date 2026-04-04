const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');

router.use(authMiddleware, roleMiddleware(['STUDENT']));

router.get('/dashboard', studentController.getDashboardData);
router.get('/attendance', studentController.getAttendanceHistory);
router.get('/notifications', studentController.getNotifications);
router.put('/notifications/:id/read', studentController.markNotificationRead);

module.exports = router;
