const User = require('../models/User');
const Employee = require('../models/Employee');
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

// @desc    Create new user (Admin only)
// @route   POST /api/auth/users
// @access  Private/Admin
const createUser = async (req, res, next) => {
  try {
    const { email, password, role, employeeId } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    let employee = null;
    if (employeeId) {
      employee = await Employee.findById(employeeId);
    }

    const user = await User.create({
      email,
      password,
      role: role || 'EMPLOYEE',
      employee: employee ? employee._id : null,
    });

    if (employee) {
      employee.user = user._id;
      await employee.save();
    }

    res.status(201).json({
      success: true,
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

module.exports = {
  login,
  getMe,
  createUser,
  getUsers,
};
