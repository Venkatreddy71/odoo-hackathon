const mongoose = require('mongoose');

const salaryStructureSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Structure name is required'],
      trim: true,
    },
    code: {
      type: String,
      required: true,
      uppercase: true,
      unique: true,
      trim: true,
    },
    description: { type: String, default: '' },
    rules: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SalaryRule',
      },
    ],
    status: {
      type: String,
      enum: ['ACTIVE', 'ARCHIVED'],
      default: 'ACTIVE',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SalaryStructure', salaryStructureSchema);
