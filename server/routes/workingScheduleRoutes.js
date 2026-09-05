const express = require('express');
const router = express.Router();
const workingScheduleController = require('../controllers/workingScheduleController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.use(protect);

router
  .route('/')
  .get(workingScheduleController.getAllSchedules)
  .post(authorize('ADMIN', 'HR_MANAGER', 'HR_PAYROLL_MANAGER'), workingScheduleController.createSchedule);

router
  .route('/:id')
  .put(authorize('ADMIN', 'HR_MANAGER', 'HR_PAYROLL_MANAGER'), workingScheduleController.updateSchedule);

module.exports = router;
