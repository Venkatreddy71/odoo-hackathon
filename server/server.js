const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Register all Mongoose models upfront
require('./models/User');
require('./models/Department');
require('./models/JobPosition');
require('./models/WorkingSchedule');
require('./models/Employee');
require('./models/Contract');
require('./models/Attendance');
require('./models/TimeOffType');
require('./models/TimeOffAllocation');
require('./models/TimeOffRequest');
require('./models/SalaryRule');
require('./models/SalaryStructure');
require('./models/Payslip');
require('./models/Payrun');
require('./models/PayrollAlert');

// Connect to MongoDB
connectDB();

const app = express();

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS setup
app.use(
  cors({
    origin: process.env.CLIENT_URL || '*',
    credentials: true,
  })
);

// Route Mounting
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/employees', require('./routes/employeeRoutes'));
app.use('/api/contracts', require('./routes/contractRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/timeoff', require('./routes/timeOffRoutes'));
app.use('/api/payroll', require('./routes/payrollRoutes'));
app.use('/api/payruns', require('./routes/payrunRoutes'));
app.use('/api/payslips', require('./routes/payslipRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/email-outbox', require('./routes/emailOutboxRoutes'));
app.use('/api/working-schedules', require('./routes/workingScheduleRoutes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', system: 'PeoplePay360 Backend', timestamp: new Date() });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[PeoplePay360 Server running]: http://localhost:${PORT}`);
  });
}

module.exports = app;
