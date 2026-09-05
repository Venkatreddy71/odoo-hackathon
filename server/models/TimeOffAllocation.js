const mongoose = require('mongoose');

const timeOffAllocationSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    type: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TimeOffType',
      required: true,
    },
    policyYear: {
      type: Number,
      default: () => new Date().getFullYear(),
    },
    allocatedDays: {
      type: Number,
      required: true,
      min: 0,
    },
    usedDays: {
      type: Number,
      default: 0,
      min: 0,
    },
    remainingDays: {
      type: Number,
      default: function () {
        return this.allocatedDays - this.usedDays;
      },
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'EXPIRED'],
      default: 'ACTIVE',
    },
  },
  { timestamps: true }
);

timeOffAllocationSchema.index({ employee: 1, type: 1, policyYear: 1 }, { unique: true });

module.exports = mongoose.model('TimeOffAllocation', timeOffAllocationSchema);
