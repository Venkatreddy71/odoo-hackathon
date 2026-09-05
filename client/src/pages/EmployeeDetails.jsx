import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../services/api';
import {
  User,
  FileSignature,
  Clock,
  CalendarDays,
  Receipt,
  Building,
  CreditCard,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Briefcase,
  UserCheck,
  Mail,
  Phone,
  Calendar,
  Layers,
  FileText,
  DollarSign,
} from 'lucide-react';

export default function EmployeeDetails() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('work_info');

  useEffect(() => {
    fetchHubData();
  }, [id]);

  const fetchHubData = async () => {
    setLoading(true);
    try {
      const res = await API.get(`/employees/${id}`);
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!data) {
    return <div className="text-slate-400 text-center py-12">Employee profile not found.</div>;
  }

  const { employee, contracts = [], recentAttendance = [], allocations = [], recentLeaveRequests = [], payslips = [] } = data;

  const countContracts = contracts.length;
  const countAttendance = recentAttendance.length;
  const countAllocations = allocations.length;
  const countPayslips = payslips.length;
  const countLeaveRequests = recentLeaveRequests.length;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link to="/employees" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition">
        <ArrowLeft className="w-4 h-4" /> Back to Employee Directory
      </Link>

      {/* Hero Profile Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden backdrop-blur-md">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-black shadow-xl ring-2 ring-white/10 shrink-0">
              {employee.firstName[0]}
              {employee.lastName[0]}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-extrabold text-white">
                  {employee.firstName} {employee.lastName}
                </h1>
                <span className="font-mono text-xs px-2.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                  {employee.employeeId}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${employee.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'}`}>
                  {employee.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-3 font-medium">
                <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5 text-indigo-400" /> {employee.jobPosition?.title || 'Staff Position'}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><Building className="w-3.5 h-3.5 text-indigo-400" /> {employee.department?.name || 'General Department'}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><UserCheck className="w-3.5 h-3.5 text-indigo-400" /> Manager: {employee.manager ? `${employee.manager.firstName} ${employee.manager.lastName}` : 'N/A'}</span>
              </p>
            </div>
          </div>

          {/* Quick Banking Verification Widget */}
          <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl text-xs space-y-1 min-w-[220px]">
            <div className="flex items-center justify-between font-semibold text-slate-400">
              <span className="flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5 text-indigo-400" /> Bank Details
              </span>
              {employee.bankDetails?.accountNumber ? (
                <span className="text-emerald-400 text-[10px] font-bold flex items-center gap-0.5">
                  <CheckCircle className="w-3 h-3" /> Verified
                </span>
              ) : (
                <span className="text-amber-400 text-[10px] font-bold flex items-center gap-0.5">
                  <AlertCircle className="w-3 h-3" /> Missing
                </span>
              )}
            </div>
            <div className="text-white font-mono text-xs font-bold">{employee.bankDetails?.accountNumber || 'No Account Registered'}</div>
            <div className="text-slate-400 text-[10px]">
              {employee.bankDetails?.bankName} {employee.bankDetails?.ifscCode ? `(${employee.bankDetails.ifscCode})` : ''}
            </div>
          </div>
        </div>

        {/* Smart Buttons Row (Real Record Counts) */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-5 gap-3">
          <button
            onClick={() => setActiveTab('contracts')}
            className={`p-3 rounded-xl border flex flex-col items-center justify-center transition ${
              activeTab === 'contracts'
                ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold text-xs">
              <FileSignature className="w-4 h-4 text-indigo-400" /> Contracts
            </div>
            <span className="text-lg font-black text-white mt-1 font-mono">{countContracts}</span>
          </button>

          <button
            onClick={() => setActiveTab('attendance')}
            className={`p-3 rounded-xl border flex flex-col items-center justify-center transition ${
              activeTab === 'attendance'
                ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold text-xs">
              <Clock className="w-4 h-4 text-amber-400" /> Attendance
            </div>
            <span className="text-lg font-black text-white mt-1 font-mono">{countAttendance}</span>
          </button>

          <button
            onClick={() => setActiveTab('leave')}
            className={`p-3 rounded-xl border flex flex-col items-center justify-center transition ${
              activeTab === 'leave'
                ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold text-xs">
              <CalendarDays className="w-4 h-4 text-emerald-400" /> Time Off
            </div>
            <span className="text-lg font-black text-white mt-1 font-mono">{countLeaveRequests}</span>
          </button>

          <button
            onClick={() => setActiveTab('leave')}
            className={`p-3 rounded-xl border flex flex-col items-center justify-center transition ${
              activeTab === 'leave'
                ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold text-xs">
              <Layers className="w-4 h-4 text-purple-400" /> Allocations
            </div>
            <span className="text-lg font-black text-white mt-1 font-mono">{countAllocations}</span>
          </button>

          <button
            onClick={() => setActiveTab('payslips')}
            className={`p-3 rounded-xl border flex flex-col items-center justify-center transition ${
              activeTab === 'payslips'
                ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold text-xs">
              <Receipt className="w-4 h-4 text-blue-400" /> Payslips
            </div>
            <span className="text-lg font-black text-white mt-1 font-mono">{countPayslips}</span>
          </button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex border-b border-slate-800 space-x-2 overflow-x-auto">
        {[
          { id: 'work_info', label: 'Work Information' },
          { id: 'personal', label: 'Personal Information' },
          { id: 'banking', label: 'Banking' },
          { id: 'contracts', label: `Contracts (${countContracts})` },
          { id: 'attendance', label: `Attendance (${countAttendance})` },
          { id: 'leave', label: 'Time Off & Allocations' },
          { id: 'payslips', label: `Payslips (${countPayslips})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 text-xs font-semibold px-4 border-b-2 whitespace-nowrap transition ${
              activeTab === tab.id
                ? 'border-indigo-500 text-indigo-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: WORK INFORMATION */}
      {activeTab === 'work_info' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-6">
          <h3 className="text-base font-bold text-white">Work Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400 font-semibold block">Department</span>
              <p className="text-white text-sm font-bold">{employee.department?.name || 'Unassigned'}</p>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400 font-semibold block">Job Position</span>
              <p className="text-white text-sm font-bold">{employee.jobPosition?.title || 'Staff'}</p>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400 font-semibold block">Reporting Manager</span>
              <p className="text-white text-sm font-bold">{employee.manager ? `${employee.manager.firstName} ${employee.manager.lastName}` : 'N/A'}</p>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400 font-semibold block">Employment Type</span>
              <p className="text-indigo-400 text-sm font-bold">{employee.employeeType || 'Full-time'}</p>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400 font-semibold block">Joining Date</span>
              <p className="text-white text-sm font-bold">{new Date(employee.joiningDate).toLocaleDateString('en-IN')}</p>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400 font-semibold block">Employment Status</span>
              <p className="text-emerald-400 text-sm font-bold">{employee.status}</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PERSONAL INFORMATION */}
      {activeTab === 'personal' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-6">
          <h3 className="text-base font-bold text-white">Personal Contact & Identification</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400 font-semibold block flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-indigo-400" /> Work Email
              </span>
              <p className="text-white text-sm font-bold">{employee.email}</p>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400 font-semibold block flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-indigo-400" /> Phone Number
              </span>
              <p className="text-white text-sm font-bold">{employee.phone || 'Not Provided'}</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BANKING */}
      {activeTab === 'banking' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-6">
          <h3 className="text-base font-bold text-white">Banking Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400 font-semibold block">Account Number</span>
              <p className="text-white font-mono text-sm font-bold">{employee.bankDetails?.accountNumber || 'Missing'}</p>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400 font-semibold block">Bank Name</span>
              <p className="text-white text-sm font-bold">{employee.bankDetails?.bankName || 'Missing'}</p>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-slate-400 font-semibold block">IFSC Code</span>
              <p className="text-white font-mono text-sm font-bold">{employee.bankDetails?.ifscCode || 'Missing'}</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CONTRACTS */}
      {activeTab === 'contracts' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-white">Employment Contracts</h3>
              <p className="text-xs text-slate-400">Payroll automatically selects period-applicable contract matching the payrun start & end date.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contracts.map((contract) => (
              <div
                key={contract._id}
                className={`bg-slate-900/80 border p-5 rounded-2xl relative shadow-lg ${
                  contract.status === 'RUNNING'
                    ? 'border-indigo-500/50 ring-1 ring-indigo-500/20'
                    : 'border-slate-800 opacity-75'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-bold text-white text-base">{contract.contractName}</h4>
                    <span className="text-xs text-slate-400">
                      {new Date(contract.startDate).toLocaleDateString('en-IN')} -{' '}
                      {contract.endDate ? new Date(contract.endDate).toLocaleDateString('en-IN') : 'Ongoing'}
                    </span>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                      contract.status === 'RUNNING'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {contract.status}
                  </span>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-sm">
                  <span className="text-slate-400 font-semibold">Configured Base Wage:</span>
                  <span className="text-lg font-extrabold text-indigo-400 font-mono">₹{contract.wage.toLocaleString('en-IN')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: ATTENDANCE */}
      {activeTab === 'attendance' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 font-semibold uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-4">Date</th>
                <th className="p-4">Check In</th>
                <th className="p-4">Check Out</th>
                <th className="p-4">Worked Hours</th>
                <th className="p-4">Status / Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {recentAttendance.map((att) => (
                <tr key={att._id}>
                  <td className="p-4 font-mono font-bold text-white">{att.date}</td>
                  <td className="p-4">{new Date(att.checkIn).toLocaleTimeString('en-IN')}</td>
                  <td className="p-4">{att.checkOut ? new Date(att.checkOut).toLocaleTimeString('en-IN') : '--:--'}</td>
                  <td className="p-4 font-bold text-white font-mono">{att.workedHours} hrs</td>
                  <td className="p-4">
                    {att.isManuallyEdited ? (
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                        Edited: {att.correctionReason}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                        Verified Punch
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 6: TIME OFF */}
      {activeTab === 'leave' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {allocations.map((alloc) => (
              <div key={alloc._id} className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-lg">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  {alloc.type?.name} ({alloc.policyYear})
                </div>
                <div className="text-3xl font-black text-white mb-2">{alloc.remainingDays} Days Remaining</div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden mb-3">
                  <div
                    className="bg-indigo-500 h-full rounded-full"
                    style={{ width: `${(alloc.usedDays / (alloc.allocatedDays || 1)) * 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-slate-400 font-medium">
                  <span>Allocated: {alloc.allocatedDays}</span>
                  <span>Used: {alloc.usedDays}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: PAYSLIPS */}
      {activeTab === 'payslips' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 font-semibold uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-4">Pay Period</th>
                <th className="p-4">Gross Earnings</th>
                <th className="p-4">Deductions</th>
                <th className="p-4">Net Salary Paid</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {payslips.map((ps) => (
                <tr key={ps._id}>
                  <td className="p-4 font-semibold text-white">
                    {new Date(ps.periodStart).toLocaleDateString('en-IN')} - {new Date(ps.periodEnd).toLocaleDateString('en-IN')}
                  </td>
                  <td className="p-4 font-mono text-emerald-400">₹{ps.grossSalary?.toLocaleString('en-IN')}</td>
                  <td className="p-4 font-mono text-rose-400">₹{ps.totalDeduction?.toLocaleString('en-IN')}</td>
                  <td className="p-4 font-mono font-bold text-white text-base">₹{ps.netSalary?.toLocaleString('en-IN')}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {ps.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <Link
                      to={`/payslips/${ps._id}`}
                      className="px-3 py-1 bg-slate-800 hover:bg-indigo-600 text-white rounded-lg text-xs font-semibold transition"
                    >
                      View Statement
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
