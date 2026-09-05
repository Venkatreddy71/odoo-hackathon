const mongoose = require('mongoose');

const contractSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Employee is required'],
    },
    contractName: {
      type: String,
      required: [true, 'Contract name is required'],
      trim: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      default: null,
    },
    wage: {
      type: Number,
      required: [true, 'Wage is required'],
      min: [0, 'Wage must be positive'],
    },
    salaryStructure: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SalaryStructure',
      required: [true, 'Salary Structure is required'],
    },
    workingSchedule: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WorkingSchedule',
    },
    status: {
      type: String,
      enum: ['RUNNING', 'EXPIRED', 'DRAFT'],
      default: 'RUNNING',
    },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

// Pre-save validation helper for overlapping RUNNING contracts
contractSchema.statics.checkOverlap = async function (employeeId, startDate, endDate, excludeContractId = null) {
  const query = {
    employee: employeeId,
    status: 'RUNNING',
  };

  if (excludeContractId) {
    query._id = { $ne: excludeContractId };
  }

  const runningContracts = await this.find(query);

  const newStart = new Date(startDate).getTime();
  const newEnd = endDate ? new Date(endDate).getTime() : Infinity;

  for (const contract of runningContracts) {
    const existingStart = new Date(contract.startDate).getTime();
    const existingEnd = contract.endDate ? new Date(contract.endDate).getTime() : Infinity;

    // Check overlap: (StartA <= EndB) and (EndA >= StartB)
    if (newStart <= existingEnd && newEnd >= existingStart) {
      return {
        hasOverlap: true,
        conflictingContract: contract,
      };
    }
  }

  return { hasOverlap: false };
};

module.exports = mongoose.model('Contract', contractSchema);
