const express = require('express');
const router = express.Router();
const { getContracts, createContract, updateContract } = require('../controllers/contractController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/', protect, authorize('ADMIN', 'HR_MANAGER', 'PAYROLL_USER'), getContracts);
router.post('/', protect, authorize('ADMIN', 'HR_MANAGER'), createContract);
router.put('/:id', protect, authorize('ADMIN', 'HR_MANAGER'), updateContract);

module.exports = router;
