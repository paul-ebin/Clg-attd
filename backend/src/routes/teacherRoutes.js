const express = require('express');
const router = express.Router();
const teacherController = require('../controllers/teacherController');
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');

router.use(authMiddleware, roleMiddleware(['TEACHER']));

router.get('/classes', teacherController.getAssignedClasses);
router.get('/classes/:classId/students', teacherController.getClassStudents);
router.post('/attendance', teacherController.markAttendance);
router.get('/attendance', teacherController.getAttendanceRecords);

module.exports = router;
