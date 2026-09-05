const mongoose = require('mongoose');

const timeOffTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Time off type name is required'],
      unique: true,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    isPaid: {
      type: Boolean,
      default: true,
    },
    description: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('TimeOffType', timeOffTypeSchema);
