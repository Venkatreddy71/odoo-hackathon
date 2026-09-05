const express = require('express');
const router = express.Router();
const { login, register, getMe, createUser, getUsers, assignUserRole, deleteUser } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.post('/login', login);
router.post('/register', register);
router.get('/me', protect, getMe);
router.post('/users', protect, authorize('ADMIN', 'HR_MANAGER', 'PAYROLL_USER', 'HR_PAYROLL_MANAGER'), createUser);
router.get('/users', protect, authorize('ADMIN', 'HR_MANAGER', 'PAYROLL_USER', 'HR_PAYROLL_MANAGER'), getUsers);
router.put('/users/:id/role', protect, authorize('ADMIN', 'HR_MANAGER', 'PAYROLL_USER', 'HR_PAYROLL_MANAGER'), assignUserRole);
router.delete('/users/:id', protect, authorize('ADMIN', 'HR_MANAGER', 'PAYROLL_USER', 'HR_PAYROLL_MANAGER'), deleteUser);



module.exports = router;
