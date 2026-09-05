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

const rawEmployeeData = [
  { firstName: 'Arav', lastName: 'Mehta', gender: 'Male', deptCode: 'ENG', title: 'Senior Software Engineer', wage: 85000, type: 'Full-time', bank: { accountNumber: '918237465012', bankName: 'HDFC Bank', ifscCode: 'HDFC0001234', branch: 'Tech Park Branch' } },
  { firstName: 'Sara', lastName: 'Khan', gender: 'Female', deptCode: 'HR', title: 'HR Manager', wage: 92000, type: 'Full-time', bank: { accountNumber: '918237465013', bankName: 'ICICI Bank', ifscCode: 'ICIC0005678', branch: 'Main City Branch' } },
  { firstName: 'John', lastName: 'Dsouza', gender: 'Male', deptCode: 'FIN', title: 'Payroll Executive', wage: 68000, type: 'Full-time', bank: { accountNumber: '918237465014', bankName: 'Axis Bank', ifscCode: 'UTIB0009876', branch: 'Finance Plaza' } },
  { firstName: 'Alina', lastName: 'Patel', gender: 'Female', deptCode: 'ENG', title: 'Full Stack Developer', wage: 55000, type: 'Contractor', bank: { accountNumber: '', bankName: '', ifscCode: '', branch: '' } },
  { firstName: 'Vikram', lastName: 'Sharma', gender: 'Male', deptCode: 'ENG', title: 'Lead System Architect', wage: 135000, type: 'Full-time', bank: { accountNumber: '918237465015', bankName: 'SBI', ifscCode: 'SBIN0002468', branch: 'Cyber Hub' } },
  { firstName: 'Priya', lastName: 'Verma', gender: 'Female', deptCode: 'SLS', title: 'Sales Director', wage: 120000, type: 'Full-time', bank: { accountNumber: '918237465016', bankName: 'Kotak Bank', ifscCode: 'KKBK0001357', branch: 'Commercial Street' } },
  { firstName: 'Rahul', lastName: 'Nair', gender: 'Male', deptCode: 'SLS', title: 'Account Executive', wage: 45000, type: 'Part-time', bank: { accountNumber: '918237465017', bankName: 'HDFC Bank', ifscCode: 'HDFC0001234', branch: 'South Ext' } },
  { firstName: 'Sneha', lastName: 'Reddy', gender: 'Female', deptCode: 'FIN', title: 'Financial Analyst', wage: 75000, type: 'Full-time', bank: { accountNumber: '918237465018', bankName: 'ICICI Bank', ifscCode: 'ICIC0005678', branch: 'MG Road' } },
  { firstName: 'Rohan', lastName: 'Gupta', gender: 'Male', deptCode: 'ENG', title: 'Frontend Intern', wage: 28000, type: 'Intern', bank: { accountNumber: '918237465019', bankName: 'Yes Bank', ifscCode: 'YESB0004321', branch: 'Indiranagar' } },
  { firstName: 'Ananya', lastName: 'Roy', gender: 'Female', deptCode: 'OPS', title: 'Operations Lead', wage: 82000, type: 'Full-time', bank: { accountNumber: '918237465020', bankName: 'Axis Bank', ifscCode: 'UTIB0009876', branch: 'Koramangala' } },

  // 11-20
  { firstName: 'Karan', lastName: 'Joshi', gender: 'Male', deptCode: 'ENG', title: 'DevOps Engineer', wage: 95000, type: 'Full-time', bank: { accountNumber: '918237465021', bankName: 'HDFC Bank', ifscCode: 'HDFC0001234', branch: 'Whitefield' } },
  { firstName: 'Neha', lastName: 'Singhania', gender: 'Female', deptCode: 'HR', title: 'Talent Acquisition Lead', wage: 78000, type: 'Full-time', bank: { accountNumber: '918237465022', bankName: 'Standard Chartered', ifscCode: 'SCBL0001111', branch: 'Central Park' } },
  { firstName: 'Amitabh', lastName: 'Chowdhury', gender: 'Male', deptCode: 'FIN', title: 'Senior Accountant', wage: 88000, type: 'Full-time', bank: { accountNumber: '918237465023', bankName: 'SBI', ifscCode: 'SBIN0002468', branch: 'Park Street' } },
  { firstName: 'Divya', lastName: 'Deshmukh', gender: 'Female', deptCode: 'ENG', title: 'UI/UX Designer', wage: 62000, type: 'Full-time', bank: { accountNumber: '918237465024', bankName: 'Kotak Bank', ifscCode: 'KKBK0001357', branch: 'Bandra' } },
  { firstName: 'Manish', lastName: 'Kapur', gender: 'Male', deptCode: 'SLS', title: 'Regional Sales Manager', wage: 110000, type: 'Full-time', bank: { accountNumber: '918237465025', bankName: 'HDFC Bank', ifscCode: 'HDFC0001234', branch: 'Connaught Place' } },
  { firstName: 'Tanya', lastName: 'Malhotra', gender: 'Female', deptCode: 'OPS', title: 'Logistics Specialist', wage: 52000, type: 'Full-time', bank: { accountNumber: '918237465026', bankName: 'ICICI Bank', ifscCode: 'ICIC0005678', branch: 'Sector 18' } },
  { firstName: 'Siddharth', lastName: 'Rao', gender: 'Male', deptCode: 'ENG', title: 'Backend Software Engineer', wage: 78000, type: 'Full-time', bank: { accountNumber: '918237465027', bankName: 'Axis Bank', ifscCode: 'UTIB0009876', branch: 'Electronic City' } },
  { firstName: 'Kavya', lastName: 'Iyer', gender: 'Female', deptCode: 'ENG', title: 'QA Automation Engineer', wage: 66000, type: 'Full-time', bank: { accountNumber: '918237465028', bankName: 'SBI', ifscCode: 'SBIN0002468', branch: 'Adyar' } },
  { firstName: 'Rajesh', lastName: 'Kumar', gender: 'Male', deptCode: 'OPS', title: 'Facilities Manager', wage: 60000, type: 'Full-time', bank: { accountNumber: '918237465029', bankName: 'HDFC Bank', ifscCode: 'HDFC0001234', branch: 'Salt Lake' } },
  { firstName: 'Pooja', lastName: 'Bhatia', gender: 'Female', deptCode: 'HR', title: 'HR Generalist', wage: 58000, type: 'Full-time', bank: { accountNumber: '', bankName: '', ifscCode: '', branch: '' } },

  // 21-30
  { firstName: 'Deepak', lastName: 'Saxena', gender: 'Male', deptCode: 'ENG', title: 'Cloud Solutions Architect', wage: 140000, type: 'Full-time', bank: { accountNumber: '918237465031', bankName: 'ICICI Bank', ifscCode: 'ICIC0005678', branch: 'HITEC City' } },
  { firstName: 'Meera', lastName: 'Sen', gender: 'Female', deptCode: 'SLS', title: 'Growth Marketing Lead', wage: 95000, type: 'Full-time', bank: { accountNumber: '918237465032', bankName: 'Kotak Bank', ifscCode: 'KKBK0001357', branch: 'Juhu' } },
  { firstName: 'Varun', lastName: 'Chawla', gender: 'Male', deptCode: 'FIN', title: 'Compliance Auditor', wage: 82000, type: 'Full-time', bank: { accountNumber: '918237465033', bankName: 'Standard Chartered', ifscCode: 'SCBL0001111', branch: 'Fort' } },
  { firstName: 'Shreya', lastName: 'Banerjee', gender: 'Female', deptCode: 'ENG', title: 'Data Scientist', wage: 105000, type: 'Full-time', bank: { accountNumber: '918237465034', bankName: 'HDFC Bank', ifscCode: 'HDFC0001234', branch: 'New Town' } },
  { firstName: 'Arjun', lastName: 'Bhasin', gender: 'Male', deptCode: 'SLS', title: 'Sales Operations Manager', wage: 87000, type: 'Full-time', bank: { accountNumber: '918237465035', bankName: 'Axis Bank', ifscCode: 'UTIB0009876', branch: 'Aerocity' } },
  { firstName: 'Ritu', lastName: 'Hegde', gender: 'Female', deptCode: 'OPS', title: 'Customer Support Lead', wage: 58000, type: 'Full-time', bank: { accountNumber: '918237465036', bankName: 'SBI', ifscCode: 'SBIN0002468', branch: 'Hebbal' } },
  { firstName: 'Gaurav', lastName: 'Tripathi', gender: 'Male', deptCode: 'ENG', title: 'Full Stack Developer', wage: 72000, type: 'Full-time', bank: { accountNumber: '918237465037', bankName: 'Yes Bank', ifscCode: 'YESB0004321', branch: 'Gachibowli' } },
  { firstName: 'Bhavna', lastName: 'Dutta', gender: 'Female', deptCode: 'FIN', title: 'Tax & Treasury Analyst', wage: 79000, type: 'Full-time', bank: { accountNumber: '918237465038', bankName: 'ICICI Bank', ifscCode: 'ICIC0005678', branch: 'Ballygunge' } },
  { firstName: 'Suresh', lastName: 'Pillai', gender: 'Male', deptCode: 'OPS', title: 'Supply Chain Coordinator', wage: 48000, type: 'Contractor', bank: { accountNumber: '918237465039', bankName: 'HDFC Bank', ifscCode: 'HDFC0001234', branch: 'Kochi Techpark' } },
  { firstName: 'Isha', lastName: 'Kapoor', gender: 'Female', deptCode: 'HR', title: 'People Business Partner', wage: 85000, type: 'Full-time', bank: { accountNumber: '918237465040', bankName: 'Kotak Bank', ifscCode: 'KKBK0001357', branch: 'Powai' } },

  // 31-40
  { firstName: 'Nikhil', lastName: 'Mahajan', gender: 'Male', deptCode: 'ENG', title: 'Mobile App Developer', wage: 80000, type: 'Full-time', bank: { accountNumber: '918237465041', bankName: 'Axis Bank', ifscCode: 'UTIB0009876', branch: 'Cybercity' } },
  { firstName: 'Tarun', lastName: 'Shetty', gender: 'Male', deptCode: 'SLS', title: 'Business Development Manager', wage: 90000, type: 'Full-time', bank: { accountNumber: '918237465042', bankName: 'HDFC Bank', ifscCode: 'HDFC0001234', branch: 'Mangalore' } },
  { firstName: 'Swati', lastName: 'Kulkarni', gender: 'Female', deptCode: 'ENG', title: 'Database Administrator', wage: 86000, type: 'Full-time', bank: { accountNumber: '918237465043', bankName: 'SBI', ifscCode: 'SBIN0002468', branch: 'Shivajinagar' } },
  { firstName: 'Yash', lastName: 'Verma', gender: 'Male', deptCode: 'ENG', title: 'Security Engineer', wage: 98000, type: 'Full-time', bank: { accountNumber: '918237465044', bankName: 'ICICI Bank', ifscCode: 'ICIC0005678', branch: 'Viman Nagar' } },
  { firstName: 'Kinjal', lastName: 'Shah', gender: 'Female', deptCode: 'FIN', title: 'Accounts Payable Specialist', wage: 54000, type: 'Full-time', bank: { accountNumber: '918237465045', bankName: 'Kotak Bank', ifscCode: 'KKBK0001357', branch: 'Navrangpura' } },
  { firstName: 'Prateek', lastName: 'Garg', gender: 'Male', deptCode: 'SLS', title: 'Content Marketing Executive', wage: 46000, type: 'Part-time', bank: { accountNumber: '918237465046', bankName: 'Yes Bank', ifscCode: 'YESB0004321', branch: 'Noida Sec 62' } },
  { firstName: 'Aakanksha', lastName: 'Tiwari', gender: 'Female', deptCode: 'OPS', title: 'Vendor Relations Specialist', wage: 56000, type: 'Full-time', bank: { accountNumber: '918237465047', bankName: 'HDFC Bank', ifscCode: 'HDFC0001234', branch: 'Hazratganj' } },
  { firstName: 'Madhav', lastName: 'Solanki', gender: 'Male', deptCode: 'ENG', title: 'Frontend Developer', wage: 68000, type: 'Full-time', bank: { accountNumber: '918237465048', bankName: 'Axis Bank', ifscCode: 'UTIB0009876', branch: 'C-Scheme' } },
  { firstName: 'Simran', lastName: 'Ahluwalia', gender: 'Female', deptCode: 'HR', title: 'HR Analytics Specialist', wage: 72000, type: 'Full-time', bank: { accountNumber: '918237465049', bankName: 'SBI', ifscCode: 'SBIN0002468', branch: 'Model Town' } },
  { firstName: 'Harish', lastName: 'Ranganathan', gender: 'Male', deptCode: 'ENG', title: 'Site Reliability Engineer', wage: 112000, type: 'Full-time', bank: { accountNumber: '918237465050', bankName: 'ICICI Bank', ifscCode: 'ICIC0005678', branch: 'T Nagar' } },

  // 41-50
  { firstName: 'Vandana', lastName: 'Menon', gender: 'Female', deptCode: 'FIN', title: 'Financial Controller', wage: 130000, type: 'Full-time', bank: { accountNumber: '918237465051', bankName: 'Standard Chartered', ifscCode: 'SCBL0001111', branch: 'MG Road' } },
  { firstName: 'Abhinav', lastName: 'Sinha', gender: 'Male', deptCode: 'ENG', title: 'Product Manager', wage: 125000, type: 'Full-time', bank: { accountNumber: '918237465052', bankName: 'HDFC Bank', ifscCode: 'HDFC0001234', branch: 'Whitefield' } },
  { firstName: 'Kritika', lastName: 'Kaushik', gender: 'Female', deptCode: 'SLS', title: 'Enterprise Account Manager', wage: 98000, type: 'Full-time', bank: { accountNumber: '918237465053', bankName: 'Axis Bank', ifscCode: 'UTIB0009876', branch: 'DLF Phase 5' } },
  { firstName: 'Mohit', lastName: 'Puri', gender: 'Male', deptCode: 'OPS', title: 'Operations Analyst', wage: 52000, type: 'Full-time', bank: { accountNumber: '918237465054', bankName: 'Kotak Bank', ifscCode: 'KKBK0001357', branch: 'Chandigarh Sec 17' } },
  { firstName: 'Nisha', lastName: 'Agarwal', gender: 'Female', deptCode: 'ENG', title: 'Software Engineer Intern', wage: 30000, type: 'Intern', bank: { accountNumber: '918237465055', bankName: 'Yes Bank', ifscCode: 'YESB0004321', branch: 'Bhubaneswar' } },
  { firstName: 'Siddhesh', lastName: 'Kadam', gender: 'Male', deptCode: 'ENG', title: 'Systems Engineer', wage: 74000, type: 'Full-time', bank: { accountNumber: '918237465056', bankName: 'SBI', ifscCode: 'SBIN0002468', branch: 'Thane' } },
  { firstName: 'Charu', lastName: 'Lata', gender: 'Female', deptCode: 'HR', title: 'Training & Development Lead', wage: 76000, type: 'Full-time', bank: { accountNumber: '918237465057', bankName: 'HDFC Bank', ifscCode: 'HDFC0001234', branch: 'South Ex' } },
  { firstName: 'Vivek', lastName: 'Bhardwaj', gender: 'Male', deptCode: 'SLS', title: 'Digital Marketing Strategist', wage: 70000, type: 'Full-time', bank: { accountNumber: '918237465058', bankName: 'ICICI Bank', ifscCode: 'ICIC0005678', branch: 'Sector 62' } },
  { firstName: 'Pallavi', lastName: 'Gowda', gender: 'Female', deptCode: 'FIN', title: 'Payroll Accountant', wage: 64000, type: 'Full-time', bank: { accountNumber: '918237465059', bankName: 'Axis Bank', ifscCode: 'UTIB0009876', branch: 'Rajajinagar' } },
  { firstName: 'Sameer', lastName: 'Wagle', gender: 'Male', deptCode: 'OPS', title: 'Facilities Coordinator', wage: 42000, type: 'Full-time', bank: { accountNumber: '918237465060', bankName: 'SBI', ifscCode: 'SBIN0002468', branch: 'Dadar' } },
];

const seedData = async () => {
  try {
    await connectDB();
    console.log('[Seeder]: Clearing old database collections...');

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

    console.log('[Seeder]: Creating Departments...');
    const deptMap = {
      ENG: await Department.create({ name: 'Engineering', code: 'ENG', description: 'Software Development & Systems Architecture' }),
      HR: await Department.create({ name: 'Human Resources', code: 'HR', description: 'People Operations & Talent Acquisition' }),
      FIN: await Department.create({ name: 'Finance', code: 'FIN', description: 'Accounting, Compliance & Payroll' }),
      SLS: await Department.create({ name: 'Sales & Marketing', code: 'SLS', description: 'Enterprise Sales & Product Marketing' }),
      OPS: await Department.create({ name: 'Operations', code: 'OPS', description: 'Business Operations & Infrastructure Support' }),
    };

    console.log('[Seeder]: Creating Working Schedules...');
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

    const flexSchedule = await WorkingSchedule.create({
      name: 'Flexible Tech Shift',
      weeklyHours: 40,
      days: [
        { day: 'Monday', startTime: '10:00', endTime: '18:00', breakHours: 1, isWorkingDay: true },
        { day: 'Tuesday', startTime: '10:00', endTime: '18:00', breakHours: 1, isWorkingDay: true },
        { day: 'Wednesday', startTime: '10:00', endTime: '18:00', breakHours: 1, isWorkingDay: true },
        { day: 'Thursday', startTime: '10:00', endTime: '18:00', breakHours: 1, isWorkingDay: true },
        { day: 'Friday', startTime: '10:00', endTime: '18:00', breakHours: 1, isWorkingDay: true },
      ],
    });

    console.log('[Seeder]: Creating Job Positions dynamically...');
    const jobPositionMap = {};
    for (const emp of rawEmployeeData) {
      const key = `${emp.deptCode}_${emp.title}`;
      if (!jobPositionMap[key]) {
        const job = await JobPosition.create({
          title: emp.title,
          department: deptMap[emp.deptCode]._id,
        });
        jobPositionMap[key] = job;
      }
    }

    console.log('[Seeder]: Creating 50 Employees...');
    const createdEmployees = [];
    for (let i = 0; i < rawEmployeeData.length; i++) {
      const data = rawEmployeeData[i];
      const empNum = String(i + 1).padStart(3, '0');
      const email = `${data.firstName.toLowerCase()}.${data.lastName.toLowerCase()}@peoplepay360.com`;

      const emp = await Employee.create({
        employeeId: `EMP${empNum}`,
        firstName: data.firstName,
        lastName: data.lastName,
        email: i === 0 ? 'arav@peoplepay360.com' : i === 1 ? 'sara@peoplepay360.com' : i === 2 ? 'john@peoplepay360.com' : email,
        phone: `+91 987${String(i).padStart(2, '0')} 432${String(i).padStart(2, '0')}`,
        dateOfBirth: new Date(`199${(i % 8) + 2}-0${(i % 9) + 1}-15`),
        gender: data.gender,
        department: deptMap[data.deptCode]._id,
        jobPosition: jobPositionMap[`${data.deptCode}_${data.title}`]._id,
        joiningDate: new Date(`202${(i % 3) + 3}-0${(i % 9) + 1}-01`),
        employeeType: data.type,
        status: 'ACTIVE',
        workingSchedule: data.deptCode === 'ENG' && i % 2 === 1 ? flexSchedule._id : defaultSchedule._id,
        bankDetails: data.bank,
      });

      createdEmployees.push({ emp, wage: data.wage });
    }

    console.log('[Seeder]: Creating User Accounts with Roles...');
    const sara = createdEmployees[1].emp;
    const john = createdEmployees[2].emp;
    const arav = createdEmployees[0].emp;

    const adminUser = await User.create({ email: 'admin@peoplepay360.com', password: 'admin123', role: 'ADMIN' });
    const hrUser = await User.create({ email: 'hr@peoplepay360.com', password: 'hr123', role: 'HR_MANAGER', employee: sara._id });
    const payrollUser = await User.create({ email: 'payroll@peoplepay360.com', password: 'payroll123', role: 'PAYROLL_USER', employee: john._id });
    const hrPayrollUser = await User.create({ email: 'hrpayroll@peoplepay360.com', password: 'hrpayroll123', role: 'HR_PAYROLL_MANAGER', employee: john._id });
    const aravUser = await User.create({ email: 'arav@peoplepay360.com', password: 'employee123', role: 'EMPLOYEE', employee: arav._id });

    sara.user = hrUser._id; await sara.save();
    john.user = payrollUser._id; await john.save();
    arav.user = aravUser._id; await arav.save();

    console.log('[Seeder]: Creating Statutory Salary Rules & Structure (Including PF & Gratuity)...');
    const ruleBasic = await SalaryRule.create({ name: 'Basic Salary', code: 'BASIC', category: 'BASIC', sequence: 1, type: 'PERCENTAGE', percentage: 60, percentageBaseCode: 'WAGE' });
    const ruleHRA = await SalaryRule.create({ name: 'House Rent Allowance (HRA)', code: 'HRA', category: 'ALLOWANCE', sequence: 2, type: 'PERCENTAGE', percentage: 20, percentageBaseCode: 'BASIC' });
    const ruleMeal = await SalaryRule.create({ name: 'Meal Allowance', code: 'MEAL_ALLOWANCE', category: 'ALLOWANCE', sequence: 3, type: 'FIXED', amount: 2500 });
    const ruleGratuity = await SalaryRule.create({ name: 'Gratuity Provision', code: 'GRATUITY', category: 'ALLOWANCE', sequence: 4, type: 'PERCENTAGE', percentage: 4.81, percentageBaseCode: 'BASIC' });
    const ruleGross = await SalaryRule.create({ name: 'Gross Salary', code: 'GROSS', category: 'GROSS', sequence: 5, type: 'FORMULA', formula: 'BASIC + HRA + MEAL_ALLOWANCE + GRATUITY' });
    const rulePF = await SalaryRule.create({ name: 'Employee Provident Fund (PF 12%)', code: 'PF', category: 'DEDUCTION', sequence: 6, type: 'PERCENTAGE', percentage: 12, percentageBaseCode: 'BASIC' });
    const ruleUnpaid = await SalaryRule.create({ name: 'Unpaid Leave Deduction', code: 'UNPAID_DEDUCTION', category: 'DEDUCTION', sequence: 7, type: 'FORMULA', formula: 'UNPAID_DAYS * (BASIC / 30)' });
    const ruleNet = await SalaryRule.create({ name: 'Net Payable Salary', code: 'NET', category: 'NET', sequence: 8, type: 'FORMULA', formula: 'GROSS - PF - UNPAID_DEDUCTION' });

    const salaryStructure = await SalaryStructure.create({
      name: 'Regular Executive Salary Structure 2026',
      code: 'REG_SAL_2026',
      description: 'Standard statutory salary structure for enterprise employees including PF & Gratuity',
      rules: [ruleBasic._id, ruleHRA._id, ruleMeal._id, ruleGratuity._id, ruleGross._id, rulePF._id, ruleUnpaid._id, ruleNet._id],
    });

    console.log('[Seeder]: Creating Running Contracts for all 50 employees...');
    const contractsMap = {};
    for (const item of createdEmployees) {
      const c = await Contract.create({
        employee: item.emp._id,
        contractName: `${item.emp.firstName} ${item.emp.lastName} Contract 2026`,
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-12-31'),
        wage: item.wage,
        salaryStructure: salaryStructure._id,
        workingSchedule: item.emp.workingSchedule,
        status: 'RUNNING',
      });
      contractsMap[item.emp._id.toString()] = c;
    }

    console.log('[Seeder]: Creating Time Off Allocations & Requests...');
    const ptoType = await TimeOffType.create({ name: 'Paid Time Off', code: 'PTO', isPaid: true });
    const sickType = await TimeOffType.create({ name: 'Sick Leave', code: 'SICK', isPaid: true });
    const unpaidType = await TimeOffType.create({ name: 'Unpaid Leave', code: 'UNPAID', isPaid: false });

    for (const item of createdEmployees) {
      await TimeOffAllocation.create({
        employee: item.emp._id,
        type: ptoType._id,
        policyYear: 2026,
        allocatedDays: 20,
        usedDays: item.emp._id.toString() === arav._id.toString() ? 3 : 0,
        remainingDays: item.emp._id.toString() === arav._id.toString() ? 17 : 20,
      });

      await TimeOffAllocation.create({
        employee: item.emp._id,
        type: sickType._id,
        policyYear: 2026,
        allocatedDays: 10,
        usedDays: 0,
        remainingDays: 10,
      });
    }

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

    await TimeOffRequest.create({
      employee: createdEmployees[5].emp._id,
      type: ptoType._id,
      startDate: new Date('2026-05-02'),
      endDate: new Date('2026-05-03'),
      numberOfDays: 2,
      reason: 'Family Gathering',
      status: 'APPROVED',
      approvedBy: sara._id,
    });

    await TimeOffRequest.create({
      employee: createdEmployees[3].emp._id,
      type: sickType._id,
      startDate: new Date('2026-09-10'),
      endDate: new Date('2026-09-11'),
      numberOfDays: 2,
      reason: 'Medical Checkup',
      status: 'SUBMITTED',
    });

    console.log('[Seeder]: Creating Multi-Month Attendance Records...');
    const attendanceDates = [
      '2026-08-03', '2026-08-04', '2026-08-05', '2026-08-06', '2026-08-07',
      '2026-09-01', '2026-09-02', '2026-09-03', '2026-09-04', '2026-09-05'
    ];

    for (const d of attendanceDates) {
      for (const item of createdEmployees.slice(0, 25)) {
        await Attendance.create({
          employee: item.emp._id,
          date: d,
          checkIn: new Date(`${d}T09:00:00`),
          checkOut: new Date(`${d}T17:00:00`),
          workedHours: 8,
          status: 'PRESENT',
          issue: 'NONE',
        });
      }
    }

    // Missing checkout example for Arav
    await Attendance.create({
      employee: arav._id,
      date: '2026-09-04',
      checkIn: new Date('2026-09-04T09:15:00'),
      checkOut: null,
      workedHours: 0,
      status: 'MISSING_CHECKOUT',
      issue: 'MISSING_CHECKOUT',
      notes: 'Unclosed punch session',
    });

    console.log('[Seeder]: Creating Paid Monthly Payruns & Payslips for 50 Employees (Apr 2026 - Aug 2026)...');
    const months = [
      { name: 'April 2026 Monthly Payroll', start: '2026-04-01', end: '2026-04-30' },
      { name: 'May 2026 Monthly Payroll', start: '2026-05-01', end: '2026-05-31' },
      { name: 'June 2026 Monthly Payroll', start: '2026-06-01', end: '2026-06-30' },
      { name: 'July 2026 Monthly Payroll', start: '2026-07-01', end: '2026-07-31' },
      { name: 'August 2026 Monthly Payroll', start: '2026-08-01', end: '2026-08-31' },
    ];

    let lastPayrun = null;
    for (const m of months) {
      const payrun = await Payrun.create({
        name: m.name,
        periodStart: new Date(m.start),
        periodEnd: new Date(m.end),
        salaryStructure: salaryStructure._id,
        status: 'PAID',
        paidDate: new Date(m.end),
        totalGross: 0,
        totalDeductions: 0,
        totalNet: 0,
      });
      lastPayrun = payrun;

      let prGross = 0;
      let prDeductions = 0;
      let prNet = 0;

      for (const item of createdEmployees) {
        const wage = item.wage;
        const basic = Math.round(wage * 0.6);
        const hra = Math.round(basic * 0.2);
        const meal = 2500;
        const gratuity = Math.round(basic * 0.0481);
        const gross = basic + hra + meal + gratuity;
        const pf = Math.round(basic * 0.12);
        const unpaid = item.emp._id.toString() === arav._id.toString() && m.name.includes('April') ? Math.round((3 * basic) / 30) : 0;
        const totalDeduction = pf + unpaid;
        const net = gross - totalDeduction;

        const payslip = await Payslip.create({
          payrun: payrun._id,
          employee: item.emp._id,
          contract: contractsMap[item.emp._id.toString()]._id,
          periodStart: new Date(m.start),
          periodEnd: new Date(m.end),
          salaryStructure: salaryStructure._id,
          workedDays: 22,
          grossSalary: gross,
          totalDeduction: totalDeduction,
          netSalary: net,
          status: 'PAID',
          lineItems: [
            { ruleCode: 'BASIC', name: 'Basic Salary', category: 'BASIC', amount: basic },
            { ruleCode: 'HRA', name: 'House Rent Allowance', category: 'ALLOWANCE', amount: hra },
            { ruleCode: 'MEAL', name: 'Meal Allowance', category: 'ALLOWANCE', amount: meal },
            { ruleCode: 'GRATUITY', name: 'Gratuity Provision (4.81%)', category: 'ALLOWANCE', amount: gratuity },
            { ruleCode: 'GROSS', name: 'Gross Salary', category: 'GROSS', amount: gross },
            { ruleCode: 'PF', name: 'Employee Provident Fund (PF 12%)', category: 'DEDUCTION', amount: pf },
            { ruleCode: 'UNPAID', name: 'Unpaid Deduction', category: 'DEDUCTION', amount: unpaid },
            { ruleCode: 'NET', name: 'Net Salary', category: 'NET', amount: net },
          ],
        });

        prGross += gross;
        prDeductions += totalDeduction;
        prNet += net;

        // Seed email outbox records
        await EmailOutbox.create({
          recipient: item.emp.email,
          employee: item.emp._id,
          subject: `Payslip Statement for ${m.name}`,
          attachmentName: `payslip_${item.emp.employeeId}_${m.start}.pdf`,
          status: 'DISPATCHED',
          sentTime: new Date(m.end),
          payslip: payslip._id,
        });
      }

      payrun.totalGross = prGross;
      payrun.totalDeductions = prDeductions;
      payrun.totalNet = prNet;
      await payrun.save();
    }

    console.log('[Seeder]: Creating Operational Payroll Alerts...');
    const alina = createdEmployees[3].emp;
    const pooja = createdEmployees[19].emp;

    await PayrollAlert.create({
      payrun: lastPayrun._id,
      employee: alina._id,
      severity: 'WARNING',
      type: 'MISSING_BANK_ACCOUNT',
      message: 'Missing bank details (Account Number) for direct salary transfer.',
      isResolved: false,
    });

    await PayrollAlert.create({
      payrun: lastPayrun._id,
      employee: pooja._id,
      severity: 'WARNING',
      type: 'MISSING_BANK_ACCOUNT',
      message: 'Missing bank details (Account Number) for direct salary transfer.',
      isResolved: false,
    });

    await PayrollAlert.create({
      payrun: lastPayrun._id,
      employee: arav._id,
      severity: 'CRITICAL',
      type: 'MISSING_CHECKOUT',
      message: 'Unclosed attendance session detected on 2026-09-04.',
      isResolved: false,
    });

    console.log('[Seeder]: Seeding Activity Logs...');
    await ActivityLog.create({
      action: 'PAYRUN_PAID',
      description: `August 2026 Monthly Payroll batch (₹${Math.round(lastPayrun.totalNet / 1000)}k) finalized and marked as PAID for 50 employees`,
      performedBy: hrPayrollUser._id,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4),
    });

    await ActivityLog.create({
      action: 'PAYSLIPS_DISPATCHED',
      description: '50 Payslip statements dispatched to employee emails for August 2026',
      performedBy: hrPayrollUser._id,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3),
    });

    await ActivityLog.create({
      action: 'EMPLOYEE_CREATED',
      description: '50 Enterprise Employee Profiles created across 5 Departments',
      performedBy: adminUser._id,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    });

    await ActivityLog.create({
      action: 'TIME_OFF_APPROVED',
      description: 'Vacation leave request (3 Days) approved for Arav Mehta',
      performedBy: hrUser._id,
      createdAt: new Date(Date.now() - 1000 * 60 * 30),
    });

    console.log('\n==================================================');
    console.log('PEOPLEPAY360 50-MEMBER ENTERPRISE SEEDING COMPLETED!');
    console.log('==================================================');
    console.log(`Total Employees Created: ${createdEmployees.length}`);
    console.log('DEMO ACCOUNTS:');
    console.log('1. Admin: admin@peoplepay360.com / admin123');
    console.log('2. HR Manager: hr@peoplepay360.com / hr123');
    console.log('3. Payroll User: payroll@peoplepay360.com / payroll123');
    console.log('4. HR Payroll Manager: hrpayroll@peoplepay360.com / hrpayroll123');
    console.log('5. Employee (Arav): arav@peoplepay360.com / employee123');
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
