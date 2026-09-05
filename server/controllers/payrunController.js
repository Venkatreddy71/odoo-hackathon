const Payrun = require('../models/Payrun');
const Payslip = require('../models/Payslip');
const Contract = require('../models/Contract');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const PayrollAlert = require('../models/PayrollAlert');
const { calculateEmployeePayslip } = require('../services/payrollEngine');

// @desc    STEP 1: Preview eligible employees and contract matching for period (DOES NOT SAVE PAYRUN)
// @route   POST /api/payruns/preview
// @access  Private (ADMIN, PAYROLL_USER)
const previewPayrun = async (req, res, next) => {
  try {
    const { periodStart, periodEnd, salaryStructure } = req.body;

    if (!periodStart || !periodEnd || !salaryStructure) {
      return res.status(400).json({ success: false, message: 'Period start, end date, and salary structure are required' });
    }

    const pStart = new Date(periodStart);
    const pEnd = new Date(periodEnd);

    // Fetch all active employees
    const employees = await Employee.find({ status: 'ACTIVE' })
      .populate('department', 'name')
      .populate('jobPosition', 'title')
      .populate('workingSchedule', 'name weeklyHours');

    const previewList = [];

    for (const emp of employees) {
      // Find RUNNING contracts for period
      const runningContracts = await Contract.find({
        employee: emp._id,
        status: 'RUNNING',
        startDate: { $lte: pEnd },
        $or: [{ endDate: null }, { endDate: { $gte: pStart } }],
      }).populate('salaryStructure workingSchedule');

      // Count attendance hours in period
      const attendance = await Attendance.find({
        employee: emp._id,
        checkIn: { $gte: pStart, $lte: pEnd },
      });

      const totalWorkedHours = attendance.reduce((acc, curr) => acc + (curr.workedHours || 0), 0);

      let applicableContract = null;
      let contractStatus = 'VALID';
      let issueMessage = null;

      if (runningContracts.length === 0) {
        contractStatus = 'MISSING_CONTRACT';
        issueMessage = 'No active RUNNING contract for this period';
      } else if (runningContracts.length > 1) {
        contractStatus = 'CONFLICTING_CONTRACT';
        issueMessage = `Multiple (${runningContracts.length}) running contracts overlap`;
      } else {
        applicableContract = runningContracts[0];
      }

      previewList.push({
        employee: emp,
        applicableContract,
        contractStatus,
        issueMessage,
        wage: applicableContract ? applicableContract.wage : 0,
        workingHours: totalWorkedHours,
        startDate: emp.joiningDate,
      });
    }

    res.json({
      success: true,
      periodStart,
      periodEnd,
      salaryStructure,
      previewList,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    STEP 2: Create Payrun with selected employees (Saves DRAFT payrun)
// @route   POST /api/payruns
// @access  Private (ADMIN, PAYROLL_USER)
const createPayrun = async (req, res, next) => {
  try {
    const { name, periodStart, periodEnd, salaryStructure, employeeIds } = req.body;

    if (!employeeIds || employeeIds.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one employee must be selected' });
    }

    const payrun = await Payrun.create({
      name: name || `Payrun ${new Date(periodStart).toLocaleString('default', { month: 'short', year: 'numeric' })}`,
      periodStart,
      periodEnd,
      salaryStructure,
      employees: employeeIds,
      status: 'DRAFT',
      createdBy: req.user._id,
    });

    res.status(201).json({ success: true, payrun });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all payruns
// @route   GET /api/payruns
// @access  Private (ADMIN, PAYROLL_USER, HR_MANAGER)
const getPayruns = async (req, res, next) => {
  try {
    const payruns = await Payrun.find()
      .populate('salaryStructure', 'name code')
      .populate('createdBy', 'email')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: payruns.length, payruns });
  } catch (error) {
    next(error);
  }
};

// @desc    Get payrun details by ID
// @route   GET /api/payruns/:id
// @access  Private (ADMIN, PAYROLL_USER, HR_MANAGER)
const getPayrunById = async (req, res, next) => {
  try {
    const payrun = await Payrun.findById(req.params.id)
      .populate('salaryStructure')
      .populate('employees', 'firstName lastName employeeId department bankDetails')
      .populate('createdBy', 'email')
      .populate('validatedBy', 'email');

    if (!payrun) {
      return res.status(404).json({ success: false, message: 'Payrun not found' });
    }

    const payslips = await Payslip.find({ payrun: payrun._id })
      .populate('employee', 'firstName lastName employeeId department bankDetails')
      .populate('contract', 'contractName wage');

    const alerts = await PayrollAlert.find({ payrun: payrun._id }).populate('employee', 'firstName lastName employeeId');

    res.json({ success: true, payrun, payslips, alerts });
  } catch (error) {
    next(error);
  }
};

// @desc    Compute payroll calculations for all selected employees in payrun
// @route   POST /api/payruns/:id/compute
// @access  Private (ADMIN, PAYROLL_USER)
const computePayrun = async (req, res, next) => {
  try {
    const payrun = await Payrun.findById(req.params.id);

    if (!payrun) {
      return res.status(404).json({ success: false, message: 'Payrun not found' });
    }

    if (payrun.status === 'PAID') {
      return res.status(400).json({ success: false, message: 'Cannot recompute a PAID payrun' });
    }

    // Clear previous alerts for this payrun
    await PayrollAlert.deleteMany({ payrun: payrun._id });

    const computedPayslips = [];
    let totalGross = 0;
    let totalDeductions = 0;
    let totalNet = 0;

    for (const empId of payrun.employees) {
      try {
        const payslip = await calculateEmployeePayslip(empId, payrun);
        computedPayslips.push(payslip._id);
        totalGross += payslip.grossSalary;
        totalDeductions += payslip.totalDeduction;
        totalNet += payslip.netSalary;
      } catch (err) {
        console.error(`[Payrun Compute Error] Employee ${empId}: ${err.message}`);
      }
    }

    payrun.payslips = computedPayslips;
    payrun.totalGross = Math.round(totalGross * 100) / 100;
    payrun.totalDeductions = Math.round(totalDeductions * 100) / 100;
    payrun.totalNet = Math.round(totalNet * 100) / 100;
    payrun.status = 'COMPUTE';
    await payrun.save();

    res.json({ success: true, payrun, processedCount: computedPayslips.length });
  } catch (error) {
    next(error);
  }
};

// @desc    Validate payrun & run automated alerts audit
// @route   POST /api/payruns/:id/validate
// @access  Private (ADMIN, PAYROLL_USER)
const validatePayrun = async (req, res, next) => {
  try {
    const payrun = await Payrun.findById(req.params.id).populate({
      path: 'employees',
      populate: 'bankDetails',
    });

    if (!payrun) {
      return res.status(404).json({ success: false, message: 'Payrun not found' });
    }

    // Audit check 1: Bank accounts
    for (const emp of payrun.employees) {
      if (!emp.bankDetails || !emp.bankDetails.accountNumber) {
        await PayrollAlert.create({
          payrun: payrun._id,
          employee: emp._id,
          severity: 'WARNING',
          type: 'MISSING_BANK_ACCOUNT',
          message: `Employee ${emp.firstName} ${emp.lastName} has missing bank account details`,
        });
      }
    }

    payrun.status = 'VALIDATE';
    payrun.validatedBy = req.user._id;
    await payrun.save();

    await Payslip.updateMany({ payrun: payrun._id }, { status: 'VALIDATED' });

    const alerts = await PayrollAlert.find({ payrun: payrun._id }).populate('employee', 'firstName lastName employeeId');

    res.json({ success: true, payrun, alerts });
  } catch (error) {
    next(error);
  }
};

const EmailOutbox = require('../models/EmailOutbox');
const ActivityLog = require('../models/ActivityLog');

// @desc    Mark payrun as PAID (Finalize & Lock)
// @route   POST /api/payruns/:id/mark-paid
// @access  Private (ADMIN, PAYROLL_USER, HR_PAYROLL_MANAGER)
const markPaidPayrun = async (req, res, next) => {
  try {
    const payrun = await Payrun.findById(req.params.id);

    if (!payrun) {
      return res.status(404).json({ success: false, message: 'Payrun not found' });
    }

    if (payrun.status === 'PAID' || payrun.status === 'DISPATCHED') {
      return res.status(400).json({ success: false, message: 'Payrun is already marked as PAID' });
    }

    payrun.status = 'PAID';
    payrun.paidDate = new Date();
    await payrun.save();

    await Payslip.updateMany({ payrun: payrun._id }, { status: 'PAID' });

    await ActivityLog.create({
      action: 'PAYRUN_PAID',
      description: `Payrun '${payrun.name}' marked as PAID (Disbursement: ₹${payrun.totalNet})`,
      performedBy: req.user._id,
      targetModel: 'Payrun',
      targetId: payrun._id,
    });

    res.json({ success: true, payrun });
  } catch (error) {
    next(error);
  }
};

// @desc    Send / Dispatch Payslips via Email Outbox
// @route   POST /api/payruns/:id/send-payslips
// @access  Private (ADMIN, PAYROLL_USER, HR_PAYROLL_MANAGER)
const sendPayslips = async (req, res, next) => {
  try {
    const payrun = await Payrun.findById(req.params.id);

    if (!payrun) {
      return res.status(404).json({ success: false, message: 'Payrun not found' });
    }

    const payslips = await Payslip.find({ payrun: payrun._id }).populate('employee');

    const createdOutboxRecords = [];

    for (const ps of payslips) {
      if (ps.employee && ps.employee.email) {
        const outboxItem = await EmailOutbox.create({
          recipient: ps.employee.email,
          subject: `Official Salary Payslip - ${payrun.name}`,
          employee: ps.employee._id,
          payslip: ps._id,
          attachmentName: `Payslip_${ps.employee.employeeId}_${new Date(ps.periodEnd).toISOString().substring(0, 7)}.pdf`,
          status: 'DISPATCHED',
          sentTime: new Date(),
        });
        createdOutboxRecords.push(outboxItem);
      }
    }

    payrun.status = 'DISPATCHED';
    await payrun.save();

    await ActivityLog.create({
      action: 'PAYSLIPS_DISPATCHED',
      description: `Dispatched ${createdOutboxRecords.length} email payslips for '${payrun.name}'`,
      performedBy: req.user._id,
      targetModel: 'Payrun',
      targetId: payrun._id,
    });

    res.json({
      success: true,
      message: `Successfully generated ${createdOutboxRecords.length} email delivery records in Email Outbox`,
      dispatchedCount: createdOutboxRecords.length,
      payrun,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  previewPayrun,
  createPayrun,
  getPayruns,
  getPayrunById,
  computePayrun,
  validatePayrun,
  markPaidPayrun,
  sendPayslips,
};
