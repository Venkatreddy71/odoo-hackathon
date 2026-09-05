
const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true,
    },
    date: {
      type: String, // YYYY-MM-DD format for easy querying per day
      required: true,
    },
    checkIn: {
      type: Date,
      required: true,
    },
    checkOut: {
      type: Date,
      default: null,
    },
    workedHours: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['PRESENT', 'ABSENT', 'HALF_DAY', 'LATE', 'MISSING_CHECKOUT'],
      default: 'PRESENT',
    },
    issue: {
      type: String,
      enum: ['NONE', 'MISSING_CHECKOUT', 'LOW_HOURS'],
      default: 'NONE',
    },
    isManuallyEdited: { type: Boolean, default: false },
    originalCheckIn: { type: Date, default: null },
    originalCheckOut: { type: Date, default: null },
    editedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    editedAt: { type: Date, default: null },
    correctionReason: { type: String, default: '' },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

// Index employee and date
attendanceSchema.index({ employee: 1, date: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
