const mongoose = require('mongoose');

const payrollAlertSchema = new mongoose.Schema(
  {
    payrun: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payrun',
      required: true,
    },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    severity: {
      type: String,
      enum: ['WARNING', 'CRITICAL'],
      default: 'WARNING',
    },
    type: {
      type: String,
      enum: [
        'MISSING_BANK_ACCOUNT',
        'MISSING_CHECKOUT',
        'DUPLICATE_PAYSLIP',
        'MISSING_CONTRACT',
        'CONFLICTING_CONTRACT',
        'CONTRACT_EXPIRING_SOON',
        'CALCULATION_ERROR',
        'UNVALIDATED_PAYROLL',
      ],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    isResolved: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PayrollAlert', payrollAlertSchema);
