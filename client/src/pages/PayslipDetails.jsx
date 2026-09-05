import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../services/api';
import { Receipt, Download, ArrowLeft, Building2, User, CheckCircle, Calendar } from 'lucide-react';

export default function PayslipDetails() {
  const { id } = useParams();
  const [payslip, setPayslip] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayslip();
  }, [id]);

  const fetchPayslip = async () => {
    try {
      const res = await API.get(`/payslips/${id}`);
      if (res.data.success) {
        setPayslip(res.data.payslip);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    const token = localStorage.getItem('peoplepay_token');
    window.open(`/api/payslips/${id}/pdf?token=${token}`, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!payslip) {
    return <div className="text-slate-400 text-center py-12">Payslip record not found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link to="/payslips" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition">
        <ArrowLeft className="w-4 h-4" /> Back to Payslips List
      </Link>

      {/* Payslip Paper Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Top Action Bar */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-6">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-400">PeoplePay360 Salary Statement</span>
            <h1 className="text-2xl font-extrabold text-white mt-1">Official Employee Payslip</h1>
          </div>
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-indigo-600/30"
          >
            <Download className="w-4 h-4" /> DOWNLOAD PDF PAYSLIP
          </button>
        </div>

        {/* Employee & Pay Period Information */}
        <div className="grid grid-cols-2 gap-6 bg-slate-950 p-6 rounded-2xl border border-slate-800/80 text-xs">
          <div className="space-y-2">
            <div>
              <span className="text-slate-500 font-semibold block uppercase tracking-wider">Employee Name</span>
              <span className="text-white font-bold text-sm">{payslip.employee?.firstName} {payslip.employee?.lastName}</span>
            </div>
            <div>
              <span className="text-slate-500 font-semibold block uppercase tracking-wider">Employee ID</span>
              <span className="font-mono text-indigo-400 font-bold">{payslip.employee?.employeeId}</span>
            </div>
            <div>
              <span className="text-slate-500 font-semibold block uppercase tracking-wider">Department</span>
              <span className="text-slate-300">{payslip.employee?.department?.name || 'General'}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div>
              <span className="text-slate-500 font-semibold block uppercase tracking-wider">Pay Period</span>
              <span className="text-white font-mono font-bold">
                {new Date(payslip.periodStart).toLocaleDateString('en-IN')} - {new Date(payslip.periodEnd).toLocaleDateString('en-IN')}
              </span>
            </div>
            <div>
              <span className="text-slate-500 font-semibold block uppercase tracking-wider">Base Contract Wage</span>
              <span className="font-mono text-white font-bold">₹{payslip.contract?.wage?.toLocaleString('en-IN')}</span>
            </div>
            <div>
              <span className="text-slate-500 font-semibold block uppercase tracking-wider">Worked Days</span>
              <span className="text-emerald-400 font-bold">{payslip.workedDays} Days Worked</span>
            </div>
          </div>
        </div>

        {/* Salary Rules Breakdown Table */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Salary Rules Execution Breakdown</h3>
          <div className="border border-slate-800 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 font-semibold uppercase text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Component Rule Name</th>
                  <th className="p-3.5">Rule Code</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {payslip.lineItems?.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40">
                    <td className="p-3.5 font-bold text-white">{item.name}</td>
                    <td className="p-3.5 font-mono text-indigo-300">{item.ruleCode}</td>
                    <td className="p-3.5">{item.category}</td>
                    <td className="p-3.5 text-right font-mono font-bold text-sm">
                      {item.category === 'DEDUCTION' ? (
                        <span className="text-rose-400">- ₹{item.amount?.toLocaleString('en-IN')}</span>
                      ) : (
                        <span className="text-emerald-400">₹{item.amount?.toLocaleString('en-IN')}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Footer */}
        <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex justify-between items-center">
          <div className="space-y-1 text-xs">
            <div className="text-slate-400">Gross Salary: <span className="font-mono text-emerald-400 font-bold">₹{payslip.grossSalary?.toLocaleString('en-IN')}</span></div>
            <div className="text-slate-400">Total Deductions: <span className="font-mono text-rose-400 font-bold">₹{payslip.totalDeduction?.toLocaleString('en-IN')}</span></div>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">NET SALARY DISBURSED</span>
            <span className="text-3xl font-black text-white font-mono">₹{payslip.netSalary?.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
