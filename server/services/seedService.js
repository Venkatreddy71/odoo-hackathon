const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('../config/db');

// Models
const User = require('../models/User');
const Employee = require('../models/Employee');
const Department = require('../models/Department');
const JobPosition = require('../models/JobPosition');
const WorkingSchedule = require('../models/WorkingSchedule');
const Contract = require('../models/Contract');
const Attendance = require('../models/Attendance');
const TimeOffType = require('../models/TimeOffType');
const TimeOffAllocation = require('../models/TimeOffAllocation');
const TimeOffRequest = require('../models/TimeOffRequest');
const SalaryStructure = require('../models/SalaryStructure');
const SalaryRule = require('../models/SalaryRule');
const Payrun = require('../models/Payrun');
const Payslip = require('../models/Payslip');
const PayrollAlert = require('../models/PayrollAlert');

const ActivityLog = require('../models/ActivityLog');
const EmailOutbox = require('../models/EmailOutbox');

const seedData = async () => {
  try {
    await connectDB();
    console.log('[Seeder]: Clearing old database data...');

    await User.deleteMany({});
    await Employee.deleteMany({});
    await Department.deleteMany({});
    await JobPosition.deleteMany({});
    await WorkingSchedule.deleteMany({});
    await Contract.deleteMany({});
    await Attendance.deleteMany({});
    await TimeOffType.deleteMany({});
    await TimeOffAllocation.deleteMany({});
    await TimeOffRequest.deleteMany({});
    await SalaryStructure.deleteMany({});
    await SalaryRule.deleteMany({});
    await Payrun.deleteMany({});
    await Payslip.deleteMany({});
    await PayrollAlert.deleteMany({});
    await ActivityLog.deleteMany({});
    await EmailOutbox.deleteMany({});

    console.log('[Seeder]: Creating Departments & Job Positions...');
    const deptEngineering = await Department.create({ name: 'Engineering', code: 'ENG', description: 'Software Development' });
    const deptHR = await Department.create({ name: 'Human Resources', code: 'HR', description: 'HR & Personnel' });
    const deptFinance = await Department.create({ name: 'Finance', code: 'FIN', description: 'Accounting & Payroll' });

    const jobSeniorDev = await JobPosition.create({ title: 'Senior Software Engineer', department: deptEngineering._id });
    const jobDev = await JobPosition.create({ title: 'Full Stack Developer', department: deptEngineering._id });
    const jobHRMgr = await JobPosition.create({ title: 'HR Manager', department: deptHR._id });
    const jobPayrollExec = await JobPosition.create({ title: 'Payroll Executive', department: deptFinance._id });

    console.log('[Seeder]: Creating Working Schedule...');
    const defaultSchedule = await WorkingSchedule.create({
      name: 'Standard 40-Hour Week',
      weeklyHours: 40,
      days: [
        { day: 'Monday', startTime: '09:00', endTime: '17:00', breakHours: 1, isWorkingDay: true },
        { day: 'Tuesday', startTime: '09:00', endTime: '17:00', breakHours: 1, isWorkingDay: true },
        { day: 'Wednesday', startTime: '09:00', endTime: '17:00', breakHours: 1, isWorkingDay: true },
        { day: 'Thursday', startTime: '09:00', endTime: '17:00', breakHours: 1, isWorkingDay: true },
        { day: 'Friday', startTime: '09:00', endTime: '17:00', breakHours: 1, isWorkingDay: true },
      ],
    });

    console.log('[Seeder]: Creating Employees...');
    const arav = await Employee.create({
      employeeId: 'EMP001',
      firstName: 'Arav',
      lastName: 'Mehta',
      email: 'arav@peoplepay360.com',
      phone: '+91 98765 43210',
      dateOfBirth: new Date('1995-06-15'),
      gender: 'Male',
      department: deptEngineering._id,
      jobPosition: jobSeniorDev._id,
      company: 'PeoplePay360 Inc.',
      joiningDate: new Date('2025-01-01'),
      employeeType: 'Full-time',
      status: 'ACTIVE',
      workingSchedule: defaultSchedule._id,
      bankDetails: {
        accountNumber: '918237465012',
        bankName: 'HDFC Bank',
        ifscCode: 'HDFC0001234',
        branch: 'Tech Park Branch',
      },
    });

    const sara = await Employee.create({
      employeeId: 'EMP002',
      firstName: 'Sara',
      lastName: 'Khan',
      email: 'sara@peoplepay360.com',
      phone: '+91 98765 43211',
      gender: 'Female',
      department: deptHR._id,
      jobPosition: jobHRMgr._id,
      joiningDate: new Date('2025-02-01'),
      employeeType: 'Full-time',
      workingSchedule: defaultSchedule._id,
      bankDetails: {
        accountNumber: '918237465013',
        bankName: 'ICICI Bank',
        ifscCode: 'ICIC0005678',
        branch: 'Main City Branch',
      },
    });

    const john = await Employee.create({
      employeeId: 'EMP003',
      firstName: 'John',
      lastName: 'Dsouza',
      email: 'john@peoplepay360.com',
      phone: '+91 98765 43212',
      gender: 'Male',
      department: deptFinance._id,
      jobPosition: jobPayrollExec._id,
      joiningDate: new Date('2025-03-01'),
      employeeType: 'Full-time',
      workingSchedule: defaultSchedule._id,
      bankDetails: {
        accountNumber: '918237465014',
        bankName: 'Axis Bank',
        ifscCode: 'UTIB0009876',
        branch: 'Finance Plaza',
      },
    });

    const alina = await Employee.create({
      employeeId: 'EMP004',
      firstName: 'Alina',
      lastName: 'Patel',
      email: 'alina@peoplepay360.com',
      phone: '+91 98765 43213',
      gender: 'Female',
      department: deptEngineering._id,
      jobPosition: jobDev._id,
      joiningDate: new Date('2025-04-01'),
      employeeType: 'Contractor',
      workingSchedule: defaultSchedule._id,
      bankDetails: {
        accountNumber: '',
        bankName: '',
        ifscCode: '',
        branch: '',
      },
    });

    console.log('[Seeder]: Creating User Accounts with Roles...');
    const adminUser = await User.create({ email: 'admin@peoplepay360.com', password: 'admin123', role: 'ADMIN' });
    const hrUser = await User.create({ email: 'hr@peoplepay360.com', password: 'hr123', role: 'HR_MANAGER', employee: sara._id });
    const payrollUser = await User.create({ email: 'payroll@peoplepay360.com', password: 'payroll123', role: 'PAYROLL_USER', employee: john._id });
    const hrPayrollUser = await User.create({ email: 'hrpayroll@peoplepay360.com', password: 'hrpayroll123', role: 'HR_PAYROLL_MANAGER', employee: john._id });
    const aravUser = await User.create({ email: 'arav@peoplepay360.com', password: 'employee123', role: 'EMPLOYEE', employee: arav._id });

    sara.user = hrUser._id; await sara.save();
    john.user = payrollUser._id; await john.save();
    arav.user = aravUser._id; await arav.save();

    console.log('[Seeder]: Seeding Initial Activity Logs...');
    await ActivityLog.create({
      action: 'EMPLOYEE_CREATED',
      description: 'Employee Arav Mehta (EMP001) added to Engineering department',
      performedBy: adminUser._id,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    });

    await ActivityLog.create({
      action: 'CONTRACT_CREATED',
      description: 'Contract Q2 Revised Senior Contract issued to Arav Mehta (₹35,000 / mo)',
      performedBy: hrUser._id,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 1.5),
    });

    await ActivityLog.create({
      action: 'TIME_OFF_APPROVED',
      description: 'Paid Time Off (3 Days) approved for Arav Mehta by HR Manager',
      performedBy: hrUser._id,
      createdAt: new Date(Date.now() - 1000 * 60 * 30),
    });

    console.log('[Seeder]: Creating Salary Rules & Salary Structure...');
    const ruleBasic = await SalaryRule.create({
      name: 'Basic Salary',
      code: 'BASIC',
      category: 'BASIC',
      sequence: 1,
      type: 'FIXED',
      amount: 30000,
    });

    const ruleHRA = await SalaryRule.create({
      name: 'House Rent Allowance (HRA)',
      code: 'HRA',
      category: 'ALLOWANCE',
      sequence: 2,
      type: 'PERCENTAGE',
      percentage: 20,
      percentageBaseCode: 'BASIC',
    });

    const ruleMeal = await SalaryRule.create({
      name: 'Meal Allowance',
      code: 'MEAL_ALLOWANCE',
      category: 'ALLOWANCE',
      sequence: 3,
      type: 'FIXED',
      amount: 2000,
    });

    const ruleGross = await SalaryRule.create({
      name: 'Gross Salary',
      code: 'GROSS',
      category: 'GROSS',
      sequence: 4,
      type: 'FORMULA',
      formula: 'BASIC + HRA + MEAL_ALLOWANCE',
    });

    const ruleUnpaid = await SalaryRule.create({
      name: 'Unpaid Leave Deduction',
      code: 'UNPAID_DEDUCTION',
      category: 'DEDUCTION',
      sequence: 5,
      type: 'FORMULA',
      formula: 'UNPAID_DAYS * (BASIC / 30)',
    });

    const ruleNet = await SalaryRule.create({
      name: 'Net Payable Salary',
      code: 'NET',
      category: 'NET',
      sequence: 6,
      type: 'FORMULA',
      formula: 'GROSS - UNPAID_DEDUCTION',
    });

    const salaryStructure = await SalaryStructure.create({
      name: 'Regular Executive Salary Structure',
      code: 'REG_SAL_2026',
      description: 'Standard salary structure for full-time employees',
      rules: [ruleBasic._id, ruleHRA._id, ruleMeal._id, ruleGross._id, ruleUnpaid._id, ruleNet._id],
    });

    console.log('[Seeder]: Creating Contracts for Arav Mehta & Employees...');
    // Arav Mehta Historical Expired Contract
    await Contract.create({
      employee: arav._id,
      contractName: 'Arav Q1 Initial Contract',
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-03-31'),
      wage: 30000,
      salaryStructure: salaryStructure._id,
      workingSchedule: defaultSchedule._id,
      status: 'EXPIRED',
      notes: 'Initial probationary contract',
    });

    // Arav Mehta Running Current Contract (Revised wage ₹35,000)
    await Contract.create({
      employee: arav._id,
      contractName: 'Arav Q2 Revised Senior Contract',
      startDate: new Date('2026-04-01'),
      endDate: new Date('2026-12-31'),
      wage: 35000,
      salaryStructure: salaryStructure._id,
      workingSchedule: defaultSchedule._id,
      status: 'RUNNING',
      notes: 'Confirmed Senior Engineer Contract',
    });

    // Contracts for other employees
    await Contract.create({
      employee: sara._id,
      contractName: 'Sara HR Manager Contract',
      startDate: new Date('2026-01-01'),
      wage: 42000,
      salaryStructure: salaryStructure._id,
      workingSchedule: defaultSchedule._id,
      status: 'RUNNING',
    });

    await Contract.create({
      employee: john._id,
      contractName: 'John Finance Executive Contract',
      startDate: new Date('2026-01-01'),
      wage: 38000,
      salaryStructure: salaryStructure._id,
      workingSchedule: defaultSchedule._id,
      status: 'RUNNING',
    });

    await Contract.create({
      employee: alina._id,
      contractName: 'Alina Engineer Contract',
      startDate: new Date('2026-04-01'),
      wage: 32000,
      salaryStructure: salaryStructure._id,
      workingSchedule: defaultSchedule._id,
      status: 'RUNNING',
    });

    console.log('[Seeder]: Creating Time Off Types, Allocations & Requests...');
    const ptoType = await TimeOffType.create({ name: 'Paid Time Off', code: 'PTO', isPaid: true });
    const sickType = await TimeOffType.create({ name: 'Sick Leave', code: 'SICK', isPaid: true });
    const unpaidType = await TimeOffType.create({ name: 'Unpaid Leave', code: 'UNPAID', isPaid: false });

    // Arav Allocation: 20 days total, 3 approved used, 17 remaining
    await TimeOffAllocation.create({
      employee: arav._id,
      type: ptoType._id,
      policyYear: 2026,
      allocatedDays: 20,
      usedDays: 3,
      remainingDays: 17,
    });

    // Approved leave request for Arav
    await TimeOffRequest.create({
      employee: arav._id,
      type: ptoType._id,
      startDate: new Date('2026-04-10'),
      endDate: new Date('2026-04-12'),
      numberOfDays: 3,
      reason: 'Personal Vacation',
      status: 'APPROVED',
      approvedBy: sara._id,
    });

    console.log('[Seeder]: Creating Attendance Records...');
    // Attendance history for Arav
    const dates = ['2026-04-01', '2026-04-02', '2026-04-03', '2026-04-06', '2026-04-07'];
    for (const d of dates) {
      await Attendance.create({
        employee: arav._id,
        date: d,
        checkIn: new Date(`${d}T09:00:00`),
        checkOut: new Date(`${d}T17:00:00`),
        workedHours: 8,
        status: 'PRESENT',
        issue: 'NONE',
      });
    }

    // Missing Checkout record example
    await Attendance.create({
      employee: arav._id,
      date: '2026-04-08',
      checkIn: new Date('2026-04-08T09:15:00'),
      checkOut: null,
      workedHours: 0,
      status: 'MISSING_CHECKOUT',
      issue: 'MISSING_CHECKOUT',
      notes: 'Unclosed evening session',
    });

    console.log('\n==================================================');
    console.log('PEOPLEPAY360 DEMO SEEDING COMPLETED SUCCESSFULLY!');
    console.log('==================================================');
    console.log('DEMO CREDENTIALS:');
    console.log('1. Admin: admin@peoplepay360.com / admin123');
    console.log('2. HR Manager: hr@peoplepay360.com / hr123');
    console.log('3. Payroll User: payroll@peoplepay360.com / payroll123');
    console.log('4. Employee (Arav): arav@peoplepay360.com / employee123');
    console.log('==================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('[Seeder Error]:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  seedData();
}

module.exports = seedData;
