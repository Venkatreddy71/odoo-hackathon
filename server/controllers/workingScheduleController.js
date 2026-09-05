const WorkingSchedule = require('../models/WorkingSchedule');

// Calculate total weekly hours from days configuration
const calculateWeeklyHours = (days) => {
  if (!days || !Array.isArray(days)) return 40;
  return days.reduce((total, dayItem) => {
    if (!dayItem.isWorkingDay) return total;
    const [startH, startM] = dayItem.startTime.split(':').map(Number);
    const [endH, endM] = dayItem.endTime.split(':').map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    const workedMinutes = Math.max(0, endMinutes - startMinutes - (dayItem.breakHours || 0) * 60);
    return total + workedMinutes / 60;
  }, 0);
};

// GET /api/working-schedules
exports.getAllSchedules = async (req, res) => {
  try {
    const schedules = await WorkingSchedule.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, schedules });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/working-schedules
exports.createSchedule = async (req, res) => {
  try {
    const { name, days, status } = req.body;
    const weeklyHours = calculateWeeklyHours(days);

    const schedule = await WorkingSchedule.create({
      name,
      weeklyHours,
      days: days || [
        { day: 'Monday', startTime: '09:00', endTime: '17:00', breakHours: 1, isWorkingDay: true },
        { day: 'Tuesday', startTime: '09:00', endTime: '17:00', breakHours: 1, isWorkingDay: true },
        { day: 'Wednesday', startTime: '09:00', endTime: '17:00', breakHours: 1, isWorkingDay: true },
        { day: 'Thursday', startTime: '09:00', endTime: '17:00', breakHours: 1, isWorkingDay: true },
        { day: 'Friday', startTime: '09:00', endTime: '17:00', breakHours: 1, isWorkingDay: true },
        { day: 'Saturday', startTime: '09:00', endTime: '13:00', breakHours: 0, isWorkingDay: false },
        { day: 'Sunday', startTime: '09:00', endTime: '13:00', breakHours: 0, isWorkingDay: false },
      ],
      status: status || 'ACTIVE',
    });

    return res.status(201).json({ success: true, schedule });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

// PUT /api/working-schedules/:id
exports.updateSchedule = async (req, res) => {
  try {
    const { name, days, status } = req.body;
    const weeklyHours = calculateWeeklyHours(days);

    const schedule = await WorkingSchedule.findByIdAndUpdate(
      req.params.id,
      { name, days, weeklyHours, status },
      { new: true, runValidators: true }
    );

    if (!schedule) {
      return res.status(404).json({ success: false, message: 'Schedule not found' });
    }

    return res.status(200).json({ success: true, schedule });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
