const express = require('express');
const router = express.Router();
const {
  checkIn,
  checkOut,
  getAttendanceStatus,
  getAttendance,
  getAttendanceIssues,
  correctAttendance,
} = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.post('/check-in', protect, checkIn);
router.post('/check-out', protect, checkOut);
router.get('/status', protect, getAttendanceStatus);
router.get('/', protect, getAttendance);
router.get('/issues', protect, authorize('ADMIN', 'HR_MANAGER', 'PAYROLL_USER', 'HR_PAYROLL_MANAGER'), getAttendanceIssues);
router.put('/:id/correct', protect, authorize('ADMIN', 'HR_MANAGER', 'HR_PAYROLL_MANAGER'), correctAttendance);

module.exports = router;
