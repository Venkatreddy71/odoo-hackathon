const User = require('../models/User');
const Employee = require('../models/Employee');
const EmailOutbox = require('../models/EmailOutbox');
const ActivityLog = require('../models/ActivityLog');
const { sendCredentialsEmail } = require('../services/emailService');
const jwt = require('jsonwebtoken');


const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'peoplepay360_super_secret_jwt_key_2026_hackathon', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password').populate({
      path: 'employee',
      populate: ['department', 'jobPosition'],
    });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (user.status !== 'ACTIVE') {
      return res.status(403).json({ success: false, message: 'User account is inactive' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        employee: user.employee,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'employee',
      populate: ['department', 'jobPosition', 'workingSchedule'],
    });

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new user & email credentials to personal email (Admin / HR Manager)
// @route   POST /api/auth/users
// @access  Private (ADMIN, HR_MANAGER)
const createUser = async (req, res, next) => {
  try {
    const { email, password, role, employeeId, personalEmail } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Work email and password are required' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    let employee = null;
    if (employeeId) {
      employee = await Employee.findById(employeeId);
    }

    const user = await User.create({
      email: email.toLowerCase(),
      password,
      role: role || 'EMPLOYEE',
      status: 'ACTIVE',
      employee: employee ? employee._id : null,
    });

    if (employee) {
      employee.user = user._id;
      await employee.save();
    }

    // Determine target email for credentials (Personal Mail preferred, fallback to work email)
    const targetEmail = personalEmail || (employee && employee.email) || email;

    // Send real email via SMTP (falls back to console log if SMTP not configured)
    const emailResult = await sendCredentialsEmail({
      to: targetEmail,
      workEmail: email.toLowerCase(),
      password: password,
      role: role || 'EMPLOYEE',
      employeeName: employee ? `${employee.firstName} ${employee.lastName}` : null,
    });

    // Record dispatch in EmailOutbox for audit trail
    const mailRecord = await EmailOutbox.create({
      recipient: targetEmail,
      subject: 'Welcome to PeoplePay360 - Your Account Login Credentials',
      employee: employee ? employee._id : null,
      attachmentName: 'Login_Credentials.txt',
      status: emailResult.success ? 'DISPATCHED' : 'FAILED',
      sentTime: new Date(),
    });

    // Record Activity Log
    await ActivityLog.create({
      action: 'USER_CREATED_AND_MAILED',
      description: `Created user account (${user.email}) and dispatched login credentials to ${targetEmail}`,
      performedBy: req.user._id,
      targetModel: 'User',
      targetId: user._id,
    });

    res.status(201).json({
      success: true,
      message: `User account created successfully! Login credentials mailed to ${targetEmail}.`,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        employee: user.employee,
      },
      mailedTo: targetEmail,
    });
  } catch (error) {
    next(error);
  }
};


// @desc    List all users (Admin only)
// @route   GET /api/auth/users
// @access  Private/Admin
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().populate('employee').sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, users });
  } catch (error) {
    next(error);
  }
};

// @desc    Register new user account & auto login
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email address already exists' });
    }

    let employee = null;
    if (firstName || lastName) {
      const count = await Employee.countDocuments();
      const empNum = String(count + 1).padStart(3, '0');
      employee = await Employee.create({
        employeeId: `EMP${empNum}`,
        firstName: firstName || 'New',
        lastName: lastName || 'User',
        email: email.toLowerCase(),
        status: 'ACTIVE',
        employeeType: 'Full-time',
        joiningDate: new Date(),
      });
    }

    // REGISTRATION POLICY: New public signups are created with UNASSIGNED role & PENDING_APPROVAL status.
    // Higher-rank personnel (Admin / HR Manager) must approve and assign their official role via User Management.
    const user = await User.create({
      email: email.toLowerCase(),
      password,
      role: 'UNASSIGNED',
      status: 'PENDING_APPROVAL',
      employee: employee ? employee._id : null,
    });

    if (employee) {
      employee.user = user._id;
      await employee.save();
    }

    const token = generateToken(user._id);

    const populatedUser = await User.findById(user._id).populate({
      path: 'employee',
      populate: ['department', 'jobPosition'],
    });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: populatedUser._id,
        email: populatedUser.email,
        role: populatedUser.role,
        status: populatedUser.status,
        employee: populatedUser.employee,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign role and approve user account (Higher rank HR Manager / Admin)
// @route   PUT /api/auth/users/:id/role
// @access  Private (ADMIN, HR_MANAGER)
const assignUserRole = async (req, res, next) => {
  try {
    const { role, employeeId, status } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found' });
    }

    if (role) user.role = role;
    user.status = status || 'ACTIVE';

    if (employeeId !== undefined) {
      if (employeeId) {
        const emp = await Employee.findById(employeeId);
        if (emp) {
          user.employee = emp._id;
          emp.user = user._id;
          await emp.save();
        }
      } else {
        user.employee = null;
      }
    }

    await user.save();

    const updatedUser = await User.findById(user._id).populate('employee');

    res.json({
      success: true,
      message: `User ${user.email} assigned role '${user.role}' successfully!`,
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user account (Admin / HR Manager only)
// @route   DELETE /api/auth/users/:id
// @access  Private (ADMIN, HR_MANAGER)
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found' });
    }

    // Prevent user from deleting their own active account
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own active account' });
    }

    // Unlink employee document if attached
    if (user.employee) {
      await Employee.findByIdAndUpdate(user.employee, { user: null });
    }

    await User.findByIdAndDelete(user._id);

    res.json({
      success: true,
      message: `User account ${user.email} deleted successfully!`,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  register,
  getMe,
  createUser,
  getUsers,
  assignUserRole,
  deleteUser,
};

