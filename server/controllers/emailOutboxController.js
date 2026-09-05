const EmailOutbox = require('../models/EmailOutbox');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get all email outbox logs
// @route   GET /api/email-outbox
// @access  Private (ADMIN, HR_MANAGER, PAYROLL_USER, HR_PAYROLL_MANAGER)
const getOutboxEmails = async (req, res, next) => {
  try {
    const { status, employee } = req.query;
    const query = {};

    if (status) query.status = status;
    if (employee) query.employee = employee;

    const emails = await EmailOutbox.find(query)
      .populate('employee', 'firstName lastName employeeId email department')
      .populate('payslip', 'netSalary periodStart periodEnd')
      .sort({ sentTime: -1 });

    res.json({ success: true, count: emails.length, emails });
  } catch (error) {
    next(error);
  }
};

// @desc    Dispatch single outbox email manually
// @route   POST /api/email-outbox/:id/dispatch
// @access  Private (ADMIN, PAYROLL_USER, HR_PAYROLL_MANAGER)
const dispatchEmail = async (req, res, next) => {
  try {
    const email = await EmailOutbox.findById(req.params.id);

    if (!email) {
      return res.status(404).json({ success: false, message: 'Email record not found' });
    }

    email.status = 'DISPATCHED';
    email.sentTime = new Date();
    await email.save();

    await ActivityLog.create({
      action: 'PAYSLIPS_DISPATCHED',
      description: `Manual payslip email dispatched to ${email.recipient}`,
      performedBy: req.user._id,
      targetModel: 'EmailOutbox',
      targetId: email._id,
    });

    res.json({ success: true, email });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOutboxEmails,
  dispatchEmail,
};
