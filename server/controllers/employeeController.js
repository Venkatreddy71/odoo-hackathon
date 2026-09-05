const Employee = require('../models/Employee');
const Department = require('../models/Department');
const JobPosition = require('../models/JobPosition');
const Contract = require('../models/Contract');
const Attendance = require('../models/Attendance');
const TimeOffAllocation = require('../models/TimeOffAllocation');
const TimeOffRequest = require('../models/TimeOffRequest');
const Payslip = require('../models/Payslip');
const User = require('../models/User');

const ActivityLog = require('../models/ActivityLog');

// @desc    Get all employees (supports filtering & contract status)
// @route   GET /api/employees
// @access  Private
const getEmployees = async (req, res, next) => {
  try {
    const { department, search, status, employeeType, sortBy } = req.query;

    const query = {};
    if (department) query.department = department;
    if (status) query.status = status;
    if (employeeType) query.employeeType = employeeType;

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    // Security Scoping: EMPLOYEE role can only list themselves
    if (req.user.role === 'EMPLOYEE') {
      query._id = req.user.employee ? req.user.employee._id : null;
    }

    let sortOption = { employeeId: 1 };
    if (sortBy === 'name') sortOption = { firstName: 1 };
    if (sortBy === 'date') sortOption = { joiningDate: -1 };

    const employees = await Employee.find(query)
      .populate('department', 'name code')
      .populate('jobPosition', 'title')
      .populate('manager', 'firstName lastName employeeId')
      .populate('workingSchedule', 'name weeklyHours')
      .sort(sortOption)
      .lean();

    // Populate active running contract status for each employee
    for (let emp of employees) {
      const runningContract = await Contract.findOne({ employee: emp._id, status: 'RUNNING' });
      emp.runningContract = runningContract || null;
      emp.hasMissingBankDetails = !emp.bankDetails || !emp.bankDetails.accountNumber;
    }

    res.json({ success: true, count: employees.length, employees });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single employee hub details (Profile 360 with counts)
// @route   GET /api/employees/:id
// @access  Private
const getEmployeeById = async (req, res, next) => {
  try {
    const employeeId = req.params.id;

    // Security check: Employee user can only view their own profile
    if (req.user.role === 'EMPLOYEE') {
      if (!req.user.employee || req.user.employee._id.toString() !== employeeId) {
        return res.status(403).json({ success: false, message: 'Not authorized to view other employee profiles' });
      }
    }

    const employee = await Employee.findById(employeeId)
      .populate('department')
      .populate('jobPosition')
      .populate('manager', 'firstName lastName employeeId')
      .populate('workingSchedule')
      .populate('user', 'email role status');

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    // Fetch Hub Data & Dynamic Counts
    const contracts = await Contract.find({ employee: employeeId }).populate('salaryStructure workingSchedule').sort({ startDate: -1 });
    const attendance = await Attendance.find({ employee: employeeId }).sort({ date: -1 });
    const allocations = await TimeOffAllocation.find({ employee: employeeId }).populate('type');
    const leaveRequests = await TimeOffRequest.find({ employee: employeeId }).populate('type').sort({ createdAt: -1 });
    const payslips = await Payslip.find({ employee: employeeId }).populate('payrun', 'name periodStart periodEnd').sort({ periodEnd: -1 });

    res.json({
      success: true,
      employee,
      counts: {
        contractsCount: contracts.length,
        attendanceCount: attendance.length,
        allocationsCount: allocations.length,
        leaveRequestsCount: leaveRequests.length,
        payslipsCount: payslips.length,
      },
      contracts,
      recentAttendance: attendance.slice(0, 15),
      allocations,
      recentLeaveRequests: leaveRequests.slice(0, 15),
      payslips,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new employee
// @route   POST /api/employees
// @access  Private (ADMIN, HR_MANAGER, HR_PAYROLL_MANAGER)
const createEmployee = async (req, res, next) => {
  try {
    const { employeeId, firstName, lastName, email } = req.body;

    const existingEmp = await Employee.findOne({ $or: [{ employeeId }, { email: email.toLowerCase() }] });
    if (existingEmp) {
      return res.status(400).json({ success: false, message: 'Employee with this ID or Email already exists' });
    }

    const employee = await Employee.create(req.body);

    await ActivityLog.create({
      action: 'EMPLOYEE_CREATED',
      description: `New employee ${employee.firstName} ${employee.lastName} (${employee.employeeId}) created`,
      performedBy: req.user._id,
      targetModel: 'Employee',
      targetId: employee._id,
    });

    res.status(201).json({ success: true, employee });
  } catch (error) {
    next(error);
  }
};

// @desc    Update employee profile
// @route   PUT /api/employees/:id
// @access  Private (ADMIN, HR_MANAGER)
const updateEmployee = async (req, res, next) => {
  try {
    let employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    // Employees cannot update their own salary/role or other employee data
    if (req.user.role === 'EMPLOYEE') {
      return res.status(403).json({ success: false, message: 'Employees cannot modify profile data' });
    }

    employee = await Employee.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('department jobPosition');

    res.json({ success: true, employee });
  } catch (error) {
    next(error);
  }
};

// @desc    Get departments
// @route   GET /api/departments
// @access  Private
const getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find().populate('manager', 'firstName lastName').sort({ name: 1 });
    res.json({ success: true, departments });
  } catch (error) {
    next(error);
  }
};

// @desc    Create department
// @route   POST /api/departments
// @access  Private (ADMIN, HR_MANAGER)
const createDepartment = async (req, res, next) => {
  try {
    const department = await Department.create(req.body);
    res.status(201).json({ success: true, department });
  } catch (error) {
    next(error);
  }
};

// @desc    Get job positions
// @route   GET /api/job-positions
// @access  Private
const getJobPositions = async (req, res, next) => {
  try {
    const jobPositions = await JobPosition.find().populate('department', 'name').sort({ title: 1 });
    res.json({ success: true, jobPositions });
  } catch (error) {
    next(error);
  }
};

// @desc    Create job position
// @route   POST /api/job-positions
// @access  Private (ADMIN, HR_MANAGER)
const createJobPosition = async (req, res, next) => {
  try {
    const jobPosition = await JobPosition.create(req.body);
    res.status(201).json({ success: true, jobPosition });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  getDepartments,
  createDepartment,
  getJobPositions,
  createJobPosition,
};
