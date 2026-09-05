import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CardSkeleton, TableSkeleton } from '../components/common/Skeleton';
import {
  Users,
  UserCheck,
  IndianRupee,
  FileCheck,
  TrendingUp,
  Clock,
  CalendarCheck,
  CalendarDays,
  AlertTriangle,
  Building,
  CheckCircle,
  Receipt,
  Download,
  Filter,
  ArrowRight,
  Activity,
  UserX,
  CreditCard,
  Briefcase,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Filters State
  const [period, setPeriod] = useState('all');
  const [department, setDepartment] = useState('all');
  const [employeeType, setEmployeeType] = useState('all');

  const [data, setData] = useState(null);
  const [departmentsList, setDepartmentsList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [period, department, employeeType]);

  const fetchDepartments = async () => {
    try {
      const res = await API.get('/employees/departments');
      if (res.data.success) {
        setDepartmentsList(res.data.departments || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (period) params.append('period', period);
      if (department) params.append('department', department);
      if (employeeType) params.append('employeeType', employeeType);

      const res = await API.get(`/dashboard/summary?${params.toString()}`);
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="h-8 w-64 bg-slate-800 rounded animate-pulse"></div>
          <div className="h-10 w-48 bg-slate-800 rounded-xl animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton />
          <CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton />
        </div>
        <TableSkeleton rows={4} cols={4} />
      </div>
    );
  }

  const {
    isEmployeeDashboard,
    kpi,
    salaryByDepartment,
    monthlyTrend,
    headcountTrend,
    deptHeadcount,
    attendanceOverview,
    leaveUsage,
    alertsCounts,
    recentAlerts,
    recentActivities,
    recentPayslips,
    allocations,
  } = data || {};

  // -------------------------------------------------------------
  // RENDER 1: EMPLOYEE PERSONAL SELF-SERVICE DASHBOARD
  // -------------------------------------------------------------
  if (isEmployeeDashboard) {
    return (
      <div className="space-y-8">
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              My Employee Dashboard
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Personal earnings history, leave allocations, and payslip downloads.
            </p>
          </div>
          <span className="px-3.5 py-1.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 text-xs font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
            Personal Employee Portal
          </span>
        </div>

        {/* Employee KPI Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Net Earnings</p>
                <h3 className="text-2xl font-black text-white mt-1">
                  ₹{(kpi?.myTotalSalaryEarned || 0).toLocaleString('en-IN')}
                </h3>
                <p className="text-xs text-emerald-400 mt-1 font-medium">{kpi?.myPaidCount || 0} Paid Statements</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                <IndianRupee className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Base Monthly Wage</p>
                <h3 className="text-2xl font-black text-white mt-1">
                  ₹{(kpi?.myBaseWage || 0).toLocaleString('en-IN')}
                </h3>
                <p className="text-xs text-indigo-400 mt-1 font-medium">Active Contract Rate</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Payslips Issued</p>
                <h3 className="text-2xl font-black text-white mt-1">{kpi?.myTotalPayslips || 0}</h3>
                <p className="text-xs text-slate-400 mt-1 font-medium">{kpi?.myPaidCount || 0} Disbursed</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
                <Receipt className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Leave Balance</p>
                <h3 className="text-2xl font-black text-white mt-1">{kpi?.myTotalRemainingLeave || 0} Days</h3>
                <p className="text-xs text-amber-400 mt-1 font-medium">Remaining Paid Days</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                <CalendarDays className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Allocations & Recent Payslips */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
            <h3 className="text-base font-bold text-white">Leave Allocation Balances</h3>
            <div className="space-y-3">
              {allocations?.map((alloc) => (
                <div key={alloc._id} className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="font-semibold text-white text-xs">{alloc.type?.name}</span>
                    <span className="font-bold text-indigo-400 text-sm font-mono">{alloc.remainingDays} Days Remaining</span>
                  </div>
                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-500 h-full rounded-full"
                      style={{ width: `${Math.min(100, (alloc.usedDays / (alloc.allocatedDays || 1)) * 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400 mt-2">
                    <span>Allocated: {alloc.allocatedDays} days</span>
                    <span>Used: {alloc.usedDays} days</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-white">Recent Statements</h3>
              <Link to="/payslips" className="text-xs text-indigo-400 font-semibold hover:underline">
                View All
              </Link>
            </div>
            <div className="border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 font-semibold uppercase text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-3">Period</th>
                    <th className="p-3">Net Salary</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {recentPayslips && recentPayslips.length > 0 ? (
                    recentPayslips.map((ps) => (
                      <tr key={ps._id} className="hover:bg-slate-800/40">
                        <td className="p-3 font-semibold text-white font-mono">
                          {new Date(ps.periodStart).toLocaleDateString()} - {new Date(ps.periodEnd).toLocaleDateString()}
                        </td>
                        <td className="p-3 font-bold text-emerald-400 font-mono">₹{ps.netSalary?.toLocaleString('en-IN')}</td>
                        <td className="p-3 text-right">
                          <Link
                            to={`/payslips/${ps._id}`}
                            className="px-3 py-1 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white rounded-lg font-semibold transition"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="p-6 text-center text-slate-500">
                        No payslips issued yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER 2: EXECUTIVE HR & PAYROLL COMMAND CENTER
  // -------------------------------------------------------------
  const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#10b981', '#f59e0b', '#3b82f6'];

  return (
    <div className="space-y-8">
      {/* Header & Filter Controls Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl backdrop-blur-md">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            HR Command Center
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold">
              Live DB Aggregation
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">Real-time metrics connected across HR records, attendance, leave, and payroll engine.</p>
        </div>

        {/* Global Dashboard Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <Filter className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Filters</span>
          </div>

          {/* Period Filter */}
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="current_month">Current Month</option>
            <option value="previous_month">Previous Month</option>
            <option value="last_90_days">Last 90 Days</option>
            <option value="all">All Time</option>
          </select>

          {/* Department Filter */}
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="all">All Departments</option>
            {departmentsList.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name}
              </option>
            ))}
          </select>

          {/* Employee Type Filter */}
          <select
            value={employeeType}
            onChange={(e) => setEmployeeType(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3 py-2 font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
          >
            <option value="all">All Employment Types</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contractor">Contractor</option>
            <option value="Intern">Intern</option>
          </select>
        </div>
      </div>

      {/* 8 KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI 1: Total Employees */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg hover:border-slate-700 transition">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Employees</p>
              <h3 className="text-2xl font-black text-white mt-1">{kpi?.totalEmployees || 0}</h3>
              <p className="text-xs text-slate-400 mt-1 font-medium">Headcount in scope</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <Users className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* KPI 2: Active Employees */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg hover:border-slate-700 transition">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Employees</p>
              <h3 className="text-2xl font-black text-emerald-400 mt-1">{kpi?.activeEmployees || 0}</h3>
              <p className="text-xs text-emerald-500/80 mt-1 font-medium">Currently Employed</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* KPI 3: Net Salary Paid */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg hover:border-slate-700 transition">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Net Salary Paid</p>
              <h3 className="text-2xl font-black text-white mt-1">
                ₹{(kpi?.totalNetPaid || 0).toLocaleString('en-IN')}
              </h3>
              <p className="text-xs text-emerald-400 mt-1 font-medium">Total Disbursement</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* KPI 4: Payslips Generated */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg hover:border-slate-700 transition">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Payslips Generated</p>
              <h3 className="text-2xl font-black text-white mt-1">{kpi?.totalPayslipsProcessed || 0}</h3>
              <p className="text-xs text-purple-400 mt-1 font-medium">{kpi?.paidCount || 0} Paid • {kpi?.pendingCount || 0} Draft</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20">
              <FileCheck className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* KPI 5: Average Salary */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg hover:border-slate-700 transition">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Average Salary</p>
              <h3 className="text-2xl font-black text-white mt-1">
                ₹{(kpi?.avgSalary || 0).toLocaleString('en-IN')}
              </h3>
              <p className="text-xs text-slate-400 mt-1 font-medium">Avg Net Per Employee</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* KPI 6: Attendance Health */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg hover:border-slate-700 transition">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Attendance Health</p>
              <h3 className="text-2xl font-black text-white mt-1">{kpi?.attendanceQuality || 100}%</h3>
              <p className="text-xs text-amber-400 mt-1 font-medium">Present & On-time ratio</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* KPI 7: Approved Time Off */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg hover:border-slate-700 transition">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Approved Time Off</p>
              <h3 className="text-2xl font-black text-emerald-400 mt-1">{kpi?.approvedLeaveDays || 0} Days</h3>
              <p className="text-xs text-slate-400 mt-1 font-medium">Deducted from balance</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center border border-teal-500/20">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* KPI 8: Pending Time Off */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg hover:border-slate-700 transition">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pending Time Off</p>
              <h3 className="text-2xl font-black text-amber-400 mt-1">{kpi?.pendingLeaveRequests || 0} Requests</h3>
              <p className="text-xs text-amber-500/80 mt-1 font-medium">Awaiting HR Approval</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
              <CalendarDays className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Actionable Operational Alerts Grid */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
          Operational Alerts & Action Center
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Alert 1: Missing Bank Details */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Missing Bank Details</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold">
                  {alertsCounts?.missingBankCount || 0} Employees
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Bank account information incomplete for direct payroll transfers.</p>
            </div>
            <button
              onClick={() => navigate('/employees?filter=missing_bank')}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition"
            >
              <span>Review Employees</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Alert 2: Missing Check-outs */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">Missing Check-outs</span>
                <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-mono font-bold">
                  {alertsCounts?.missingCheckoutsCount || 0} Records
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Attendance logs missing check-out timestamps requiring edit.</p>
            </div>
            <button
              onClick={() => navigate('/attendance?status=missing_checkout')}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition"
            >
              <span>Review Attendance</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Alert 3: Duplicate Payslips */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Duplicate Payslips</span>
                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-mono font-bold">
                  {alertsCounts?.duplicatePayslipsCount || 0} Warnings
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Multiple payslips generated for the same employee in a period.</p>
            </div>
            <button
              onClick={() => navigate('/payslips')}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition"
            >
              <span>Review Payslips</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Alert 4: Contract Issues / Expiring */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Contract Issues</span>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-mono font-bold">
                  {alertsCounts?.expiringContractsCount || 0} Expiring / Missing
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Employees with expiring or unassigned employment contracts.</p>
            </div>
            <button
              onClick={() => navigate('/contracts')}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition"
            >
              <span>Review Contracts</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Alert 5: Pending Time Off */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Pending Time Off</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold">
                  {alertsCounts?.pendingTimeOffCount || 0} Requests
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Leave applications waiting for managerial sign-off.</p>
            </div>
            <button
              onClick={() => navigate('/timeoff')}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition"
            >
              <span>Review Time Off</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Alert 6: Payroll Validation Warnings */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">Payroll Validation Warnings</span>
                <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-mono font-bold">
                  {alertsCounts?.payrollWarningsCount || 0} Warnings
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Pre-validation checks flag missing wages or structure mismatches.</p>
            </div>
            <button
              onClick={() => navigate('/payruns')}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition"
            >
              <span>Review Payruns</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 6 Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Monthly Net Salary Trend */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-base font-bold text-white">Monthly Net Salary Trend</h3>
              <p className="text-xs text-slate-400">Payroll disbursement trajectory across recent periods</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrend && monthlyTrend.length > 0 ? monthlyTrend : [{ month: 'Apr 2026', netSalary: 120000 }]}>
                <defs>
                  <linearGradient id="colorNetMain" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                  formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Net Disbursed']}
                />
                <Area type="monotone" dataKey="netSalary" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorNetMain)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Salary Cost by Department */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-base font-bold text-white">Salary Cost by Department</h3>
              <p className="text-xs text-slate-400">Net payroll expense allocated per department</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salaryByDepartment && salaryByDepartment.length > 0 ? salaryByDepartment : [{ departmentName: 'Engineering', totalNet: 150000 }]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="departmentName" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                  formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Net Expense']}
                />
                <Bar dataKey="totalNet" fill="#818cf8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Headcount Trend */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-base font-bold text-white">Headcount Trend</h3>
              <p className="text-xs text-slate-400">Total active employee growth over time</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={headcountTrend && headcountTrend.length > 0 ? headcountTrend : [{ month: 'Apr 2026', count: 12 }]}>
                <defs>
                  <linearGradient id="colorHC" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                <Area type="monotone" dataKey="count" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorHC)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Employees by Department */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-base font-bold text-white">Employees by Department</h3>
              <p className="text-xs text-slate-400">Distribution of workforce across team structures</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptHeadcount && deptHeadcount.length > 0 ? deptHeadcount : [{ name: 'Engineering', count: 5 }]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                <Bar dataKey="count" fill="#c084fc" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 5: Weekly Attendance Overview */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-base font-bold text-white">Weekly Attendance Overview</h3>
              <p className="text-xs text-slate-400">Workforce breakdown by status category</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceOverview && attendanceOverview.length > 0 ? attendanceOverview : [{ name: 'Mon', Present: 8, Late: 1, Absent: 0 }]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                <Bar dataKey="Present" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Late" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Absent" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 6: Leave Usage */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-base font-bold text-white">Leave Requests & Usage</h3>
              <p className="text-xs text-slate-400">Breakdown of Approved, Pending, and Refused Time Off</p>
            </div>
          </div>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={leaveUsage && leaveUsage.length > 0 ? leaveUsage : [{ name: 'Approved', value: 12 }]}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {leaveUsage?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity Feed */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-400" />
              Recent HR & Payroll Activity Feed
            </h3>
            <p className="text-xs text-slate-400">Real-time audit log recorded across the platform</p>
          </div>
        </div>

        <div className="space-y-3">
          {recentActivities && recentActivities.length > 0 ? (
            recentActivities.map((act) => (
              <div key={act._id} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-400"></div>
                  <div>
                    <p className="text-xs font-semibold text-white">{act.text || act.description}</p>
                    <p className="text-[11px] text-slate-400">
                      By <span className="text-indigo-300">{act.user?.email || 'System'}</span> • {act.category || 'General'}
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-slate-500">
                  {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))
          ) : (
            <p className="text-center text-xs text-slate-500 py-4">No recent activity logs recorded.</p>
          )}
        </div>
      </div>
    </div>
  );
}
