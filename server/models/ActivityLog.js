const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      enum: [
        'EMPLOYEE_CREATED',
        'EMPLOYEE_UPDATED',
        'CONTRACT_CREATED',
        'ATTENDANCE_CORRECTED',
        'TIME_OFF_APPROVED',
        'TIME_OFF_REFUSED',
        'PAYRUN_CREATED',
        'PAYRUN_COMPUTED',
        'PAYRUN_VALIDATED',
        'PAYRUN_PAID',
        'PAYSLIPS_DISPATCHED',
      ],
    },
    description: {
      type: String,
      required: true,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    targetModel: {
      type: String,
      default: '',
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ActivityLog', activityLogSchema);
