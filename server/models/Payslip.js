const mongoose = require('mongoose');

const payslipLineItemSchema = new mongoose.Schema({
  ruleCode: { type: String, required: true },
  name: { type: String, required: true },
  category: { type: String, enum: ['BASIC', 'ALLOWANCE', 'DEDUCTION', 'GROSS', 'NET'], required: true },
  amount: { type: Number, required: true },
});

const payslipSchema = new mongoose.Schema(
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
    contract: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contract',
      required: true,
    },
    periodStart: { type: Date, required: true },
    periodEnd: { type: Date, required: true },
    salaryStructure: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SalaryStructure',
      required: true,
    },
    lineItems: [payslipLineItemSchema],
    workedDays: { type: Number, default: 0 },
    unpaidLeaveDays: { type: Number, default: 0 },
    paidLeaveDays: { type: Number, default: 0 },
    grossSalary: { type: Number, default: 0 },
    totalDeduction: { type: Number, default: 0 },
    netSalary: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['DRAFT', 'COMPUTED', 'VALIDATED', 'PAID'],
      default: 'DRAFT',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payslip', payslipSchema);
