const express = require('express');
const router = express.Router();
const { login, getMe, createUser, getUsers } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/users', protect, authorize('ADMIN'), createUser);
router.get('/users', protect, authorize('ADMIN'), getUsers);

module.exports = router;
