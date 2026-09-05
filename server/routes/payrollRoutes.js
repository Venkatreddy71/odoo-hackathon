const express = require('express');
const router = express.Router();
const {
  getStructures,
  createStructure,
  getRules,
  createRule,
  updateRule,
} = require('../controllers/payrollController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/structures', protect, authorize('ADMIN', 'PAYROLL_USER', 'HR_MANAGER'), getStructures);
router.post('/structures', protect, authorize('ADMIN', 'PAYROLL_USER'), createStructure);
router.get('/rules', protect, authorize('ADMIN', 'PAYROLL_USER', 'HR_MANAGER'), getRules);
router.post('/rules', protect, authorize('ADMIN', 'PAYROLL_USER'), createRule);
router.put('/rules/:id', protect, authorize('ADMIN', 'PAYROLL_USER'), updateRule);

module.exports = router;
