import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../services/api';
import { useToast } from '../context/ToastContext';
import ConfettiEffect from '../components/common/ConfettiEffect';
import {
  PlayCircle,
  Calculator,
  CheckCircle2,
  Lock,
  AlertTriangle,
  FileText,
  IndianRupee,
  ArrowLeft,
  Download,
  Eye,
  Mail,
  Send,
  Sparkles,
} from 'lucide-react';

export default function PayrunDetails() {
  const { id } = useParams();
  const { addToast } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    fetchPayrun();
  }, [id]);

  const fetchPayrun = async () => {
    try {
      const res = await API.get(`/payruns/${id}`);
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCompute = async () => {
    setActionLoading(true);
    try {
      const res = await API.post(`/payruns/${id}/compute`);
      if (res.data.success) {
        addToast('Payroll Engine executed! Payslips computed dynamically.', 'success');
        fetchPayrun();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Compute failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleValidate = async () => {
    setActionLoading(true);
    try {
      const res = await API.post(`/payruns/${id}/validate`);
      if (res.data.success) {
        addToast('Payrun validated! Pre-payroll audit alerts generated.', 'success');
        fetchPayrun();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Validation failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkPaid = async () => {
    setActionLoading(true);
    try {
      const res = await API.post(`/payruns/${id}/mark-paid`);
      if (res.data.success) {
        setShowConfetti(true);
        addToast('Payroll batch finalized successfully!', 'success');
        fetchPayrun();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Mark Paid failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendPayslips = async () => {
    setActionLoading(true);
    try {
      const res = await API.post(`/payruns/${id}/send-payslips`);
      if (res.data.success) {
        addToast(`Payslips dispatched! ${res.data.outboxCount || 0} Email Outbox records created.`, 'success');
        fetchPayrun();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to dispatch payslips', 'error');
    } finally {
      setActionLoading(false);
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
    return <div className="text-slate-400 text-center py-12">Payrun not found.</div>;
  }

  const { payrun, payslips = [], alerts = [] } = data;

  const currentStatus = payrun.status; // DRAFT, COMPUTED (or COMPUTE), VALIDATED (or VALIDATE), PAID, DISPATCHED

  const stages = [
    { key: 'DRAFT', label: 'DRAFT' },
    { key: 'COMPUTE', label: 'COMPUTED' },
    { key: 'VALIDATE', label: 'VALIDATED' },
    { key: 'PAID', label: 'PAID' },
    { key: 'DISPATCHED', label: 'DISPATCHED' },
  ];

  const getStageIndex = (s) => {
    if (s === 'DRAFT') return 0;
    if (s === 'COMPUTE' || s === 'COMPUTED') return 1;
    if (s === 'VALIDATE' || s === 'VALIDATED') return 2;
    if (s === 'PAID') return 3;
    if (s === 'DISPATCHED') return 4;
    return 0;
  };

  const activeIdx = getStageIndex(currentStatus);

  return (
    <div className="space-y-6">
      {/* Confetti Animation */}
      {showConfetti && <ConfettiEffect onComplete={() => setShowConfetti(false)} />}

      <Link to="/payruns" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition">
        <ArrowLeft className="w-4 h-4" /> Back to Payruns List
      </Link>

      {/* Hero Header & Workflow State Machine Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6 backdrop-blur-md">
        {/* Title & Actions */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-extrabold text-white">{payrun.name}</h1>
              <span
                className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                  payrun.status === 'DISPATCHED'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : payrun.status === 'PAID'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : payrun.status === 'VALIDATE' || payrun.status === 'VALIDATED'
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : payrun.status === 'COMPUTE' || payrun.status === 'COMPUTED'
                    ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}
              >
                {payrun.status}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              Period: {new Date(payrun.periodStart).toLocaleDateString('en-IN')} to {new Date(payrun.periodEnd).toLocaleDateString('en-IN')} • Salary Structure: {payrun.salaryStructure?.name}
            </p>
          </div>

          {/* Action Buttons Bar */}
          <div className="flex flex-wrap items-center gap-3">
            {payrun.status === 'DRAFT' && (
              <button
                onClick={handleCompute}
                disabled={actionLoading}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-indigo-600/30 flex items-center gap-2"
              >
                <Calculator className="w-4 h-4" /> Compute Payroll
              </button>
            )}

            {(payrun.status === 'COMPUTE' || payrun.status === 'COMPUTED') && (
              <button
                onClick={handleValidate}
                disabled={actionLoading}
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-purple-600/30 flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" /> Validate Payroll
              </button>
            )}

            {(payrun.status === 'VALIDATE' || payrun.status === 'VALIDATED') && (
              <button
                onClick={handleMarkPaid}
                disabled={actionLoading}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-emerald-600/30 flex items-center gap-2"
              >
                <Lock className="w-4 h-4" /> Mark as Paid
              </button>
            )}

            {payrun.status === 'PAID' && (
              <button
                onClick={handleSendPayslips}
                disabled={actionLoading}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-indigo-600/30 flex items-center gap-2"
              >
                <Send className="w-4 h-4" /> Send Payslips
              </button>
            )}

            {payrun.status === 'DISPATCHED' && (
              <Link
                to="/email-outbox"
                className="px-4 py-2 bg-purple-950 text-purple-300 border border-purple-800 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-purple-900 transition"
              >
                <Mail className="w-4 h-4" /> View Email Outbox
              </Link>
            )}
          </div>
        </div>

        {/* WORKFLOW STAGE PROGRESS BAR */}
        <div className="pt-4 border-t border-slate-800">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3">Payroll Workflow Pipeline</p>
          <div className="flex items-center justify-between">
            {stages.map((stg, index) => {
              const isPassed = index <= activeIdx;
              const isCurrent = index === activeIdx;

              return (
                <React.Fragment key={stg.key}>
                  <div className="flex flex-col items-center gap-1.5">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs transition ${
                        isCurrent
                          ? 'bg-indigo-600 text-white shadow-lg ring-4 ring-indigo-500/20'
                          : isPassed
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'bg-slate-950 text-slate-500 border border-slate-800'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <span className={`text-[10px] font-bold tracking-wider uppercase ${isCurrent ? 'text-indigo-400' : isPassed ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {stg.label}
                    </span>
                  </div>
                  {index < stages.length - 1 && (
                    <div className={`flex-1 h-1 mx-2 rounded ${index < activeIdx ? 'bg-emerald-500' : 'bg-slate-800'}`}></div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Totals KPI Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-slate-800/80 text-xs">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="text-slate-400 font-semibold block mb-1">Employees Included</span>
            <span className="text-xl font-mono font-black text-white">{payslips.length} Staff</span>
          </div>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="text-slate-400 font-semibold block mb-1">Total Gross Salary</span>
            <span className="text-xl font-mono font-bold text-emerald-400">₹{(payrun.totalGross || 0).toLocaleString('en-IN')}</span>
          </div>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="text-slate-400 font-semibold block mb-1">Total Deductions</span>
            <span className="text-xl font-mono font-bold text-rose-400">₹{(payrun.totalDeductions || 0).toLocaleString('en-IN')}</span>
          </div>
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="text-slate-400 font-semibold block mb-1">Total Net Disbursement</span>
            <span className="text-xl font-mono font-black text-white">₹{(payrun.totalNet || 0).toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* Pre-Payroll Validation Alerts Callout */}
      {alerts && alerts.length > 0 && (
        <div className="bg-amber-950/40 border border-amber-500/30 rounded-2xl p-5 backdrop-blur-md space-y-3">
          <div className="flex items-center gap-2 font-bold text-amber-300 text-sm">
            <AlertTriangle className="w-5 h-5 text-amber-400" /> Pre-Payroll Validation Warnings ({alerts.length})
          </div>
          <div className="space-y-2">
            {alerts.map((a) => (
              <div key={a._id} className="p-3 bg-slate-950/80 rounded-xl border border-amber-500/20 text-xs flex items-center justify-between">
                <div>
                  <span className="font-bold text-white">{a.employee?.firstName} {a.employee?.lastName}: </span>
                  <span className="text-slate-300">{a.message}</span>
                </div>
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 uppercase">{a.type}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Computed Payslips Table */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-white">Generated Employee Payslips ({payslips.length})</h3>
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-4">Employee</th>
                <th className="p-4">Applicable Contract</th>
                <th className="p-4">Worked Days</th>
                <th className="p-4">Gross Salary</th>
                <th className="p-4">Deduction</th>
                <th className="p-4">Net Salary</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {payslips.map((ps) => (
                <tr key={ps._id} className="hover:bg-slate-800/40 transition">
                  <td className="p-4 font-bold text-white">
                    {ps.employee?.firstName} {ps.employee?.lastName}{' '}
                    <span className="text-xs font-mono text-indigo-400">({ps.employee?.employeeId})</span>
                  </td>
                  <td className="p-4 font-medium">{ps.contract?.contractName || 'Resolved Contract'}</td>
                  <td className="p-4 font-mono font-bold">{ps.workedDays} Days</td>
                  <td className="p-4 font-mono text-emerald-400">₹{ps.grossSalary?.toLocaleString('en-IN')}</td>
                  <td className="p-4 font-mono text-rose-400">₹{ps.totalDeduction?.toLocaleString('en-IN')}</td>
                  <td className="p-4 font-mono font-bold text-white text-base">₹{ps.netSalary?.toLocaleString('en-IN')}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {ps.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <Link
                      to={`/payslips/${ps._id}`}
                      className="px-3 py-1.5 bg-indigo-600/15 hover:bg-indigo-600 text-indigo-300 hover:text-white rounded-lg text-xs font-semibold transition"
                    >
                      View Statement
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
