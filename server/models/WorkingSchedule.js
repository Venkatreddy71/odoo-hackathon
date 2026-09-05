const mongoose = require('mongoose');

const scheduleDaySchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    required: true,
  },
  startTime: { type: String, default: '09:00' },
  endTime: { type: String, default: '17:00' },
  breakHours: { type: Number, default: 1 },
  isWorkingDay: { type: Boolean, default: true },
});

const workingScheduleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Working schedule name is required'],
      trim: true,
    },
    weeklyHours: {
      type: Number,
      default: 40,
    },
    days: [scheduleDaySchema],
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
      default: 'ACTIVE',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('WorkingSchedule', workingScheduleSchema);
