const mongoose = require('mongoose');

const salaryRuleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Salary rule name is required'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Rule code is required'],
      uppercase: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ['BASIC', 'ALLOWANCE', 'DEDUCTION', 'GROSS', 'NET'],
      required: true,
    },
    sequence: {
      type: Number,
      required: true,
      default: 1,
    },
    type: {
      type: String,
      enum: ['FIXED', 'PERCENTAGE', 'FORMULA'],
      required: true,
    },
    amount: {
      type: Number,
      default: 0,
    },
    percentage: {
      type: Number,
      default: 0,
    },
    percentageBaseCode: {
      type: String,
      default: 'BASIC',
    },
    formula: {
      type: String,
      default: '',
    },
    description: { type: String, default: '' },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
      default: 'ACTIVE',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SalaryRule', salaryRuleSchema);
