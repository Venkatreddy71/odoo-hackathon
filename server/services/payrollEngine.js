const Contract = require('../models/Contract');
const Attendance = require('../models/Attendance');
const TimeOffRequest = require('../models/TimeOffRequest');
const SalaryStructure = require('../models/SalaryStructure');
const Payslip = require('../models/Payslip');
const PayrollAlert = require('../models/PayrollAlert');
const { evaluateFormula } = require('../utils/expressionParser');

/**
 * Main Payroll Calculation Engine
 */
async function calculateEmployeePayslip(employeeId, payrun, session = null) {
  const { periodStart, periodEnd, salaryStructure: globalStructureId } = payrun;
  const pStart = new Date(periodStart);
  const pEnd = new Date(periodEnd);

  // 1. Contract Identification Logic for the Period
  // Find RUNNING contracts overlapping with [periodStart, periodEnd]
  const runningContracts = await Contract.find({
    employee: employeeId,
    status: 'RUNNING',
    startDate: { $lte: pEnd },
    $or: [{ endDate: null }, { endDate: { $gte: pStart } }],
  }).populate('salaryStructure workingSchedule');

  let contract = null;
  let alertError = null;

  if (runningContracts.length === 0) {
    alertError = {
      type: 'MISSING_CONTRACT',
      severity: 'CRITICAL',
      message: `No active running contract found covering period ${pStart.toISOString().substring(0, 10)} to ${pEnd.toISOString().substring(0, 10)}`,
    };
  } else if (runningContracts.length > 1) {
    alertError = {
      type: 'CONFLICTING_CONTRACT',
      severity: 'CRITICAL',
      message: `Multiple (${runningContracts.length}) running contracts found overlapping for the period`,
    };
  } else {
    contract = runningContracts[0];
  }

  if (alertError || !contract) {
    await PayrollAlert.create({
      payrun: payrun._id,
      employee: employeeId,
      severity: alertError ? alertError.severity : 'CRITICAL',
      type: alertError ? alertError.type : 'MISSING_CONTRACT',
      message: alertError ? alertError.message : 'Contract error',
    });
    throw new Error(alertError ? alertError.message : 'Applicable contract resolution failed');
  }

  // 2. Fetch Salary Structure from Contract (or fallback to global payrun structure)
  const structureId = contract.salaryStructure ? contract.salaryStructure._id : globalStructureId;
  const structure = await SalaryStructure.findById(structureId).populate('rules');

  if (!structure || !structure.rules || structure.rules.length === 0) {
    await PayrollAlert.create({
      payrun: payrun._id,
      employee: employeeId,
      severity: 'CRITICAL',
      type: 'MISSING_SALARY_STRUCTURE',
      message: 'No salary rules configured in the assigned salary structure',
    });
    throw new Error('Salary structure rules missing');
  }

  // Sort rules by sequence ascending (1, 2, 3...)
  const sortedRules = [...structure.rules].sort((a, b) => a.sequence - b.sequence);

  // 3. Compute Attendance & Worked Days for Period
  const attendanceRecords = await Attendance.find({
    employee: employeeId,
    checkIn: { $gte: pStart, $lte: pEnd },
  });

  const workedDays = attendanceRecords.length;
  const missingCheckouts = attendanceRecords.filter((a) => a.issue === 'MISSING_CHECKOUT').length;

  if (missingCheckouts > 0) {
    await PayrollAlert.create({
      payrun: payrun._id,
      employee: employeeId,
      severity: 'WARNING',
      type: 'MISSING_CHECKOUT',
      message: `Employee has ${missingCheckouts} unclosed attendance session(s) in this pay period`,
    });
  }

  // 4. Compute Approved Time Off Days for Period
  const approvedRequests = await TimeOffRequest.find({
    employee: employeeId,
    status: 'APPROVED',
    startDate: { $lte: pEnd },
    endDate: { $gte: pStart },
  }).populate('type');

  let paidLeaveDays = 0;
  let unpaidLeaveDays = 0;

  approvedRequests.forEach((req) => {
    if (req.type && req.type.isPaid) {
      paidLeaveDays += req.numberOfDays;
    } else {
      unpaidLeaveDays += req.numberOfDays;
    }
  });

  // 5. Initialize Context for Rule Calculation
  const context = {
    WAGE: contract.wage,
    BASIC: contract.wage, // Default base wage
    WORKED_DAYS: workedDays,
    PAID_LEAVE_DAYS: paidLeaveDays,
    UNPAID_DAYS: unpaidLeaveDays,
    GROSS: 0,
    DEDUCTIONS: 0,
    NET: 0,
  };

  const lineItems = [];
  let grossSalary = 0;
  let totalDeduction = 0;

  // 6. Sequential Rule Engine Execution
  for (const rule of sortedRules) {
    if (rule.status === 'INACTIVE') continue;

    let calculatedAmount = 0;

    if (rule.type === 'FIXED') {
      calculatedAmount = rule.amount || 0;
    } else if (rule.type === 'PERCENTAGE') {
      const baseCode = rule.percentageBaseCode || 'BASIC';
      const baseValue = context[baseCode] !== undefined ? context[baseCode] : context.BASIC;
      calculatedAmount = ((rule.percentage || 0) / 100) * baseValue;
    } else if (rule.type === 'FORMULA') {
      calculatedAmount = evaluateFormula(rule.formula, context);
    }

    calculatedAmount = Math.round(calculatedAmount * 100) / 100;

    // Store in context under rule code so subsequent rules can reference it
    context[rule.code] = calculatedAmount;

    lineItems.push({
      ruleCode: rule.code,
      name: rule.name,
      category: rule.category,
      amount: calculatedAmount,
    });

    if (rule.category === 'BASIC' || rule.category === 'ALLOWANCE' || rule.category === 'GROSS') {
      if (rule.category !== 'GROSS') {
        grossSalary += calculatedAmount;
      }
    } else if (rule.category === 'DEDUCTION') {
      totalDeduction += calculatedAmount;
    }
  }

  // Calculate or override Gross & Net if not explicitly calculated by GROSS/NET rules
  if (context.GROSS) {
    grossSalary = context.GROSS;
  }
  let netSalary = context.NET ? context.NET : grossSalary - totalDeduction;
  netSalary = Math.max(0, Math.round(netSalary * 100) / 100);

  // 7. Create or Update Payslip
  let payslip = await Payslip.findOne({
    payrun: payrun._id,
    employee: employeeId,
  });

  if (payslip) {
    payslip.contract = contract._id;
    payslip.periodStart = pStart;
    payslip.periodEnd = pEnd;
    payslip.salaryStructure = structure._id;
    payslip.lineItems = lineItems;
    payslip.workedDays = workedDays;
    payslip.unpaidLeaveDays = unpaidLeaveDays;
    payslip.paidLeaveDays = paidLeaveDays;
    payslip.grossSalary = grossSalary;
    payslip.totalDeduction = totalDeduction;
    payslip.netSalary = netSalary;
    payslip.status = 'COMPUTED';
    await payslip.save();
  } else {
    payslip = await Payslip.create({
      payrun: payrun._id,
      employee: employeeId,
      contract: contract._id,
      periodStart: pStart,
      periodEnd: pEnd,
      salaryStructure: structure._id,
      lineItems,
      workedDays,
      unpaidLeaveDays,
      paidLeaveDays,
      grossSalary,
      totalDeduction,
      netSalary,
      status: 'COMPUTED',
    });
  }

  return payslip;
}

module.exports = { calculateEmployeePayslip };
