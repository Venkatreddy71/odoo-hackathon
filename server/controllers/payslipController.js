const Payslip = require('../models/Payslip');
const Contract = require('../models/Contract');
const Employee = require('../models/Employee');
const { generatePayslipPDF } = require('../services/pdfService');

// @desc    Get payslips (scoped by role)
// @route   GET /api/payslips
// @access  Private
const getPayslips = async (req, res, next) => {
  try {
    const { employee, payrun, status } = req.query;
    const query = {};

    // Security Scoping: Employee can ONLY view their own payslips!
    if (req.user.role === 'EMPLOYEE') {
      query.employee = req.user.employee ? req.user.employee._id : null;
    } else if (employee) {
      query.employee = employee;
    }

    if (payrun) query.payrun = payrun;
    if (status) query.status = status;

    const payslips = await Payslip.find(query)
      .populate('employee', 'firstName lastName employeeId department')
      .populate('payrun', 'name periodStart periodEnd status')
      .populate('contract', 'contractName wage')
      .sort({ periodEnd: -1 });

    res.json({ success: true, count: payslips.length, payslips });
  } catch (error) {
    next(error);
  }
};

// @desc    Get payslip by ID
// @route   GET /api/payslips/:id
// @access  Private
const getPayslipById = async (req, res, next) => {
  try {
    const payslip = await Payslip.findById(req.params.id)
      .populate('employee')
      .populate('payrun')
      .populate('contract')
      .populate('salaryStructure');

    if (!payslip) {
      return res.status(404).json({ success: false, message: 'Payslip not found' });
    }

    // Security Check: Employee role can ONLY view their own payslip!
    if (req.user.role === 'EMPLOYEE') {
      if (!req.user.employee || req.user.employee._id.toString() !== payslip.employee._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized to view another employee payslip' });
      }
    }

    res.json({ success: true, payslip });
  } catch (error) {
    next(error);
  }
};

// @desc    Download PDF Payslip
// @route   GET /api/payslips/:id/pdf
// @access  Private
const downloadPayslipPDF = async (req, res, next) => {
  try {
    const payslip = await Payslip.findById(req.params.id)
      .populate({ path: 'employee', populate: ['department', 'jobPosition'] })
      .populate('contract')
      .populate('salaryStructure');

    if (!payslip) {
      return res.status(404).json({ success: false, message: 'Payslip not found' });
    }

    // Security Check
    if (req.user.role === 'EMPLOYEE') {
      if (!req.user.employee || req.user.employee._id.toString() !== payslip.employee._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized to download another employee payslip' });
      }
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="Payslip_${payslip.employee.employeeId}_${payslip._id.toString().substring(18)}.pdf"`
    );

    generatePayslipPDF(payslip, payslip.employee, payslip.contract, res);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPayslips,
  getPayslipById,
  downloadPayslipPDF,
};
