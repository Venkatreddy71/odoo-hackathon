const express = require('express');
const router = express.Router();
const { getPayslips, getPayslipById, downloadPayslipPDF } = require('../controllers/payslipController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getPayslips);
router.get('/:id', protect, getPayslipById);
router.get('/:id/pdf', protect, downloadPayslipPDF);

module.exports = router;
