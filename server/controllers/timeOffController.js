const TimeOffType = require('../models/TimeOffType');
const TimeOffAllocation = require('../models/TimeOffAllocation');
const TimeOffRequest = require('../models/TimeOffRequest');
const Employee = require('../models/Employee');

// @desc    Get all time off types
// @route   GET /api/timeoff/types
// @access  Private
const getTimeOffTypes = async (req, res, next) => {
  try {
    const types = await TimeOffType.find().sort({ name: 1 });
    res.json({ success: true, count: types.length, types });
  } catch (error) {
    next(error);
  }
};

// @desc    Create time off type
// @route   POST /api/timeoff/types
// @access  Private (ADMIN, HR_MANAGER)
const createTimeOffType = async (req, res, next) => {
  try {
    const type = await TimeOffType.create(req.body);
    res.status(201).json({ success: true, type });
  } catch (error) {
    next(error);
  }
};

// @desc    Get leave allocations
// @route   GET /api/timeoff/allocations
// @access  Private
const getAllocations = async (req, res, next) => {
  try {
    const { employee, policyYear } = req.query;
    const query = {};

    if (req.user.role === 'EMPLOYEE') {
      query.employee = req.user.employee ? req.user.employee._id : null;
    } else if (employee) {
      query.employee = employee;
    }

    if (policyYear) query.policyYear = Number(policyYear);

    const allocations = await TimeOffAllocation.find(query)
      .populate('employee', 'firstName lastName employeeId department')
      .populate('type', 'name code isPaid')
      .sort({ policyYear: -1 });

    res.json({ success: true, count: allocations.length, allocations });
  } catch (error) {
    next(error);
  }
};

// @desc    Create / update leave allocation for employee
// @route   POST /api/timeoff/allocations
// @access  Private (ADMIN, HR_MANAGER)
const createAllocation = async (req, res, next) => {
  try {
    const { employee, type, policyYear, allocatedDays } = req.body;

    const year = policyYear || new Date().getFullYear();

    let allocation = await TimeOffAllocation.findOne({ employee, type, policyYear: year });

    if (allocation) {
      allocation.allocatedDays = allocatedDays;
      allocation.remainingDays = allocation.allocatedDays - allocation.usedDays;
      await allocation.save();
    } else {
      allocation = await TimeOffAllocation.create({
        employee,
        type,
        policyYear: year,
        allocatedDays,
        usedDays: 0,
        remainingDays: allocatedDays,
      });
    }

    const populated = await TimeOffAllocation.findById(allocation._id).populate('employee').populate('type');
    res.status(201).json({ success: true, allocation: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Get time off requests
// @route   GET /api/timeoff/requests
// @access  Private
const getRequests = async (req, res, next) => {
  try {
    const { employee, status } = req.query;
    const query = {};

    if (req.user.role === 'EMPLOYEE') {
      query.employee = req.user.employee ? req.user.employee._id : null;
    } else if (employee) {
      query.employee = employee;
    }

    if (status) query.status = status;

    const requests = await TimeOffRequest.find(query)
      .populate('employee', 'firstName lastName employeeId department')
      .populate('type', 'name code isPaid')
      .populate('approvedBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: requests.length, requests });
  } catch (error) {
    next(error);
  }
};

// @desc    Create leave request
// @route   POST /api/timeoff/requests
// @access  Private
const createRequest = async (req, res, next) => {
  try {
    const { employee, type, startDate, endDate, numberOfDays, reason } = req.body;

    // Scope to logged-in employee if employee role
    const empId = req.user.role === 'EMPLOYEE' ? req.user.employee._id : employee;

    const request = await TimeOffRequest.create({
      employee: empId,
      type,
      startDate,
      endDate,
      numberOfDays,
      reason,
      status: 'SUBMITTED',
    });

    const populated = await TimeOffRequest.findById(request._id).populate('employee').populate('type');
    res.status(201).json({ success: true, request: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve time off request (UPDATES REMAINING ALLOCATION BALANCE!)
// @route   PUT /api/timeoff/requests/:id/approve
// @access  Private (ADMIN, HR_MANAGER)
const approveRequest = async (req, res, next) => {
  try {
    const request = await TimeOffRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    if (request.status === 'APPROVED') {
      return res.status(400).json({ success: false, message: 'Request is already approved' });
    }

    const year = new Date(request.startDate).getFullYear();
    let allocation = await TimeOffAllocation.findOne({
      employee: request.employee,
      type: request.type,
      policyYear: year,
    });

    if (!allocation) {
      // Create fallback allocation if missing
      allocation = await TimeOffAllocation.create({
        employee: request.employee,
        type: request.type,
        policyYear: year,
        allocatedDays: 20,
        usedDays: 0,
        remainingDays: 20,
      });
    }

    // Update used and remaining balance
    allocation.usedDays += request.numberOfDays;
    allocation.remainingDays = Math.max(0, allocation.allocatedDays - allocation.usedDays);
    await allocation.save();

    request.status = 'APPROVED';
    request.approvedBy = req.user.employee ? req.user.employee._id : null;
    await request.save();

    res.json({ success: true, request, updatedAllocation: allocation });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject time off request
// @route   PUT /api/timeoff/requests/:id/reject
// @access  Private (ADMIN, HR_MANAGER)
const rejectRequest = async (req, res, next) => {
  try {
    const request = await TimeOffRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    request.status = 'REJECTED';
    await request.save();

    res.json({ success: true, request });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTimeOffTypes,
  createTimeOffType,
  getAllocations,
  createAllocation,
  getRequests,
  createRequest,
  approveRequest,
  rejectRequest,
};
