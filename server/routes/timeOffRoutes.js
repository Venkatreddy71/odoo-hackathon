const express = require('express');
const router = express.Router();
const {
  getTimeOffTypes,
  createTimeOffType,
  getAllocations,
  createAllocation,
  getRequests,
  createRequest,
  approveRequest,
  rejectRequest,
} = require('../controllers/timeOffController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/types', protect, getTimeOffTypes);
router.post('/types', protect, authorize('ADMIN', 'HR_MANAGER'), createTimeOffType);
router.get('/allocations', protect, getAllocations);
router.post('/allocations', protect, authorize('ADMIN', 'HR_MANAGER'), createAllocation);
router.get('/requests', protect, getRequests);
router.post('/requests', protect, createRequest);
router.put('/requests/:id/approve', protect, authorize('ADMIN', 'HR_MANAGER'), approveRequest);
router.put('/requests/:id/reject', protect, authorize('ADMIN', 'HR_MANAGER'), rejectRequest);

module.exports = router;
