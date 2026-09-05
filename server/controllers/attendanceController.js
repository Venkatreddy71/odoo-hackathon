const Attendance = require('../models/Attendance');
const Employee = require('../models/Employee');

// @desc    Check-in active session for logged in employee
// @route   POST /api/attendance/check-in
// @access  Private
const checkIn = async (req, res, next) => {
  try {
    const employeeId = req.user.employee ? req.user.employee._id : req.body.employeeId;

    if (!employeeId) {
      return res.status(400).json({ success: false, message: 'User is not linked to an employee profile' });
    }

    const todayStr = new Date().toISOString().substring(0, 10);

    // Check if open session exists (checkIn exists but checkOut is null)
    const existingSession = await Attendance.findOne({
      employee: employeeId,
      checkOut: null,
    });

    if (existingSession) {
      return res.status(400).json({
        success: false,
        message: 'Already checked in! Please check out before starting a new session.',
        session: existingSession,
      });
    }

    const attendance = await Attendance.create({
      employee: employeeId,
      date: todayStr,
      checkIn: new Date(),
      status: 'PRESENT',
      issue: 'NONE',
    });

    res.status(201).json({ success: true, attendance });
  } catch (error) {
    next(error);
  }
};

// @desc    Check-out active session for logged in employee
// @route   POST /api/attendance/check-out
// @access  Private
const checkOut = async (req, res, next) => {
  try {
    const employeeId = req.user.employee ? req.user.employee._id : req.body.employeeId;

    if (!employeeId) {
      return res.status(400).json({ success: false, message: 'User is not linked to an employee profile' });
    }

    const openSession = await Attendance.findOne({
      employee: employeeId,
      checkOut: null,
    });

    if (!openSession) {
      return res.status(404).json({ success: false, message: 'No active check-in session found to check out' });
    }

    const checkOutTime = new Date();
    const diffMs = checkOutTime.getTime() - new Date(openSession.checkIn).getTime();
    const workedHours = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;

    openSession.checkOut = checkOutTime;
    openSession.workedHours = workedHours;
    openSession.issue = workedHours < 4 ? 'LOW_HOURS' : 'NONE';
    await openSession.save();

    res.json({ success: true, attendance: openSession });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current check-in status for logged in employee
// @route   GET /api/attendance/status
// @access  Private
const getAttendanceStatus = async (req, res, next) => {
  try {
    const employeeId = req.user.employee ? req.user.employee._id : req.query.employeeId;

    if (!employeeId) {
      return res.json({ success: true, isWorking: false, activeSession: null });
    }

    const activeSession = await Attendance.findOne({
      employee: employeeId,
      checkOut: null,
    });

    res.json({
      success: true,
      isWorking: !!activeSession,
      activeSession,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get attendance history
// @route   GET /api/attendance
// @access  Private
const getAttendance = async (req, res, next) => {
  try {
    const { employee, startDate, endDate, issue } = req.query;
    const query = {};

    // Security Scoping: Employee users can only see their own attendance
    if (req.user.role === 'EMPLOYEE') {
      query.employee = req.user.employee ? req.user.employee._id : null;
    } else if (employee) {
      query.employee = employee;
    }

    if (issue) query.issue = issue;

    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    }

    const records = await Attendance.find(query)
      .populate('employee', 'firstName lastName employeeId department')
      .sort({ checkIn: -1 });

    res.json({ success: true, count: records.length, attendance: records });
  } catch (error) {
    next(error);
  }
};

// @desc    Get attendance issues (missing check-outs, low hours)
// @route   GET /api/attendance/issues
// @access  Private (ADMIN, HR_MANAGER, PAYROLL_USER)
const getAttendanceIssues = async (req, res, next) => {
  try {
    // Also auto-flag sessions where checkIn was more than 16 hours ago and checkOut is null as MISSING_CHECKOUT
    const sixteenHoursAgo = new Date(Date.now() - 16 * 60 * 60 * 1000);
    await Attendance.updateMany(
      { checkOut: null, checkIn: { $lt: sixteenHoursAgo }, issue: 'NONE' },
      { issue: 'MISSING_CHECKOUT', status: 'MISSING_CHECKOUT' }
    );

    const issues = await Attendance.find({ issue: { $ne: 'NONE' } })
      .populate('employee', 'firstName lastName employeeId department')
      .sort({ checkIn: -1 });

    res.json({ success: true, count: issues.length, issues });
  } catch (error) {
    next(error);
  }
};

const ActivityLog = require('../models/ActivityLog');

// @desc    HR Attendance Correction (Requires authorization & mandatory correction reason)
// @route   PUT /api/attendance/:id/correct
// @access  Private (ADMIN, HR_MANAGER, HR_PAYROLL_MANAGER)
const correctAttendance = async (req, res, next) => {
  try {
    const { newCheckIn, newCheckOut, correctionReason } = req.body;

    if (!correctionReason || typeof correctionReason !== 'string' || correctionReason.trim() === '') {
      return res.status(400).json({ success: false, message: 'A valid correction reason is required for attendance edits' });
    }

    let record = await Attendance.findById(req.params.id).populate('employee');

    if (!record) {
      return res.status(404).json({ success: false, message: 'Attendance record not found' });
    }

    const cIn = new Date(newCheckIn || record.checkIn);
    const cOut = newCheckOut ? new Date(newCheckOut) : record.checkOut;

    let workedHours = 0;
    if (cIn && cOut) {
      const diffMs = cOut.getTime() - cIn.getTime();
      workedHours = Math.max(0, Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100);
    }

    record.originalCheckIn = record.originalCheckIn || record.checkIn;
    record.originalCheckOut = record.originalCheckOut || record.checkOut;
    record.checkIn = cIn;
    record.checkOut = cOut;
    record.workedHours = workedHours;
    record.status = workedHours > 8 ? 'OVERTIME' : workedHours >= 4 ? 'PRESENT' : 'HALF_DAY';
    record.issue = workedHours < 4 ? 'LOW_HOURS' : 'NONE';
    record.isManuallyEdited = true;
    record.editedBy = req.user._id;
    record.editedAt = new Date();
    record.correctionReason = correctionReason;
    await record.save();

    await ActivityLog.create({
      action: 'ATTENDANCE_CORRECTED',
      description: `Attendance corrected for ${record.employee?.firstName} ${record.employee?.lastName} (${record.date}): ${correctionReason}`,
      performedBy: req.user._id,
      targetModel: 'Attendance',
      targetId: record._id,
    });

    res.json({ success: true, attendance: record });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  checkIn,
  checkOut,
  getAttendanceStatus,
  getAttendance,
  getAttendanceIssues,
  correctAttendance,
};
