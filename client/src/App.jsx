import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import EmployeeDetails from './pages/EmployeeDetails';
import Contracts from './pages/Contracts';
import WorkingSchedules from './pages/WorkingSchedules';
import Attendance from './pages/Attendance';
import TimeOff from './pages/TimeOff';
import SalaryStructures from './pages/SalaryStructures';
import SalaryRules from './pages/SalaryRules';
import Payruns from './pages/Payruns';
import CreatePayrunWizard from './pages/CreatePayrunWizard';
import PayrunDetails from './pages/PayrunDetails';
import Payslips from './pages/Payslips';
import PayslipDetails from './pages/PayslipDetails';
import EmailOutbox from './pages/EmailOutbox';
import PayrollAnalytics from './pages/PayrollAnalytics';
import AttendanceAnalytics from './pages/AttendanceAnalytics';
import Users from './pages/Users';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Protected Main Routes - Accessible by All Authenticated Users */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/employees" element={<Employees />} />
        <Route path="/employees/:id" element={<EmployeeDetails />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/timeoff" element={<TimeOff />} />
        <Route path="/payslips" element={<Payslips />} />
        <Route path="/payslips/:id" element={<PayslipDetails />} />
      </Route>

      {/* HR & Payroll Operational Routes */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'HR_MANAGER', 'PAYROLL_USER', 'HR_PAYROLL_MANAGER']} />}>
        <Route path="/contracts" element={<Contracts />} />
        <Route path="/working-schedules" element={<WorkingSchedules />} />
        <Route path="/email-outbox" element={<EmailOutbox />} />
        <Route path="/reports/payroll" element={<PayrollAnalytics />} />
        <Route path="/reports/attendance" element={<AttendanceAnalytics />} />
      </Route>

      {/* Payroll Management Routes */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'PAYROLL_USER', 'HR_PAYROLL_MANAGER', 'HR_MANAGER']} />}>
        <Route path="/salary-structures" element={<SalaryStructures />} />
        <Route path="/salary-rules" element={<SalaryRules />} />
        <Route path="/payruns" element={<Payruns />} />
        <Route path="/payruns/create" element={<CreatePayrunWizard />} />
        <Route path="/payruns/:id" element={<PayrunDetails />} />
      </Route>

      {/* Admin Only Routes */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
        <Route path="/users" element={<Users />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
