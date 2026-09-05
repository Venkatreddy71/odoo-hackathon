const mongoose = require('mongoose');

const emailOutboxSchema = new mongoose.Schema(
  {
    recipient: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    payslip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payslip',
    },
    attachmentName: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['PENDING', 'DISPATCHED', 'FAILED'],
      default: 'DISPATCHED',
    },
    sentTime: {
      type: Date,
      default: Date.now,
    },
    errorDetails: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('EmailOutbox', emailOutboxSchema);
