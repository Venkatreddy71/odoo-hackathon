const express = require('express');
const router = express.Router();
const {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  getDepartments,
  createDepartment,
  getJobPositions,
  createJobPosition,
} = require('../controllers/employeeController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/', protect, getEmployees);
router.post('/', protect, authorize('ADMIN', 'HR_MANAGER'), createEmployee);
router.get('/departments', protect, getDepartments);
router.post('/departments', protect, authorize('ADMIN', 'HR_MANAGER'), createDepartment);
router.get('/job-positions', protect, getJobPositions);
router.post('/job-positions', protect, authorize('ADMIN', 'HR_MANAGER'), createJobPosition);
router.get('/:id', protect, getEmployeeById);
router.put('/:id', protect, authorize('ADMIN', 'HR_MANAGER'), updateEmployee);

module.exports = router;
