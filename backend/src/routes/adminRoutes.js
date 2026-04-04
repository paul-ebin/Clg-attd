const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');

// Protect all admin routes
router.use(authMiddleware, roleMiddleware(['ADMIN']));

// Dashboard Stats
router.get('/stats', adminController.getStats);

// Departments
router.post('/departments', adminController.createDepartment);
router.get('/departments', adminController.getDepartments);

// Classes
router.post('/classes', adminController.createClass);
router.get('/classes', adminController.getClasses);

// Teachers
router.post('/teachers', adminController.createTeacher);
router.get('/teachers', adminController.getTeachers);
router.put('/teachers/:id', adminController.updateTeacher);

// Students
router.post('/students', adminController.createStudent);
router.get('/students', adminController.getStudents);
router.put('/students/:id', adminController.updateStudent);

// Reports
router.get('/attendance-reports', adminController.getAttendanceReports);

module.exports = router;
