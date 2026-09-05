const mongoose = require('mongoose');

const jobPositionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Job position title is required'],
      trim: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('JobPosition', jobPositionSchema);
