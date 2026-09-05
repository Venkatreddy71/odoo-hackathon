const express = require('express');
const router = express.Router();
const { getOutboxEmails, dispatchEmail } = require('../controllers/emailOutboxController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/', protect, authorize('ADMIN', 'PAYROLL_USER', 'HR_PAYROLL_MANAGER', 'HR_MANAGER'), getOutboxEmails);
router.post('/:id/dispatch', protect, authorize('ADMIN', 'PAYROLL_USER', 'HR_PAYROLL_MANAGER'), dispatchEmail);

module.exports = router;
