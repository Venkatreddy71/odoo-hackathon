const express = require('express');
const router = express.Router();
const {
  previewPayrun,
  createPayrun,
  getPayruns,
  getPayrunById,
  computePayrun,
  validatePayrun,
  markPaidPayrun,
  sendPayslips,
} = require('../controllers/payrunController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.post('/preview', protect, authorize('ADMIN', 'PAYROLL_USER', 'HR_PAYROLL_MANAGER'), previewPayrun);
router.post('/', protect, authorize('ADMIN', 'PAYROLL_USER', 'HR_PAYROLL_MANAGER'), createPayrun);
router.get('/', protect, authorize('ADMIN', 'PAYROLL_USER', 'HR_MANAGER', 'HR_PAYROLL_MANAGER'), getPayruns);
router.get('/:id', protect, authorize('ADMIN', 'PAYROLL_USER', 'HR_MANAGER', 'HR_PAYROLL_MANAGER'), getPayrunById);
router.post('/:id/compute', protect, authorize('ADMIN', 'PAYROLL_USER', 'HR_PAYROLL_MANAGER'), computePayrun);
router.post('/:id/validate', protect, authorize('ADMIN', 'PAYROLL_USER', 'HR_PAYROLL_MANAGER'), validatePayrun);
router.post('/:id/mark-paid', protect, authorize('ADMIN', 'PAYROLL_USER', 'HR_PAYROLL_MANAGER'), markPaidPayrun);
router.post('/:id/send-payslips', protect, authorize('ADMIN', 'PAYROLL_USER', 'HR_PAYROLL_MANAGER'), sendPayslips);

module.exports = router;
