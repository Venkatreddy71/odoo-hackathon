const mongoose = require('mongoose');

const bankDetailsSchema = new mongoose.Schema({
  accountNumber: { type: String, default: '' },
  bankName: { type: String, default: '' },
  ifscCode: { type: String, default: '' },
  branch: { type: String, default: '' },
});

const employeeSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: [true, 'Employee ID is required'],
      unique: true,
      trim: true,
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: { type: String, default: '' },
    dateOfBirth: { type: Date },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other', 'Prefer not to say'],
      default: 'Male',
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
    },
    jobPosition: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'JobPosition',
    },
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      default: null,
    },
    company: { type: String, default: 'PeoplePay360 Inc.' },
    joiningDate: { type: Date, default: Date.now },
    employeeType: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Contractor', 'Intern'],
      default: 'Full-time',
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE', 'ON_LEAVE'],
      default: 'ACTIVE',
    },
    profilePhoto: { type: String, default: '' },
    bankDetails: bankDetailsSchema,
    workingSchedule: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WorkingSchedule',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Employee', employeeSchema);
