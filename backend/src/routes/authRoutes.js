const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.post('/login', authController.login);
router.post('/setup-admin', authController.setupAdmin); // Initial admin creation
router.get('/me', authMiddleware, authController.getMe);

module.exports = router;
