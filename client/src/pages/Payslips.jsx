import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { Receipt, Download, Eye, IndianRupee } from 'lucide-react';

export default function Payslips() {
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayslips();
  }, []);

  const fetchPayslips = async () => {
    try {
      const res = await API.get('/payslips');
      if (res.data.success) {
        setPayslips(res.data.payslips);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (id, empId) => {
    try {
      const response = await API.get(`/payslips/${id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Payslip_${empId || 'EMP'}_${id.substring(18)}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF download error:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Receipt className="w-6 h-6 text-indigo-400" /> Payslips & Salary Statements
        </h1>
        <p className="text-sm text-slate-400 mt-1">View detailed salary statements and download official computer-generated PDF payslips.</p>
      </div>

      {/* Payslips Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-4">Employee</th>
                <th className="p-4">Pay Period</th>
                <th className="p-4">Worked Days</th>
                <th className="p-4">Gross Earnings</th>
                <th className="p-4">Deductions</th>
                <th className="p-4">Net Salary Paid</th>
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
                  <td className="p-4 text-xs font-mono">
                    {new Date(ps.periodStart).toLocaleDateString('en-IN')} - {new Date(ps.periodEnd).toLocaleDateString('en-IN')}
                  </td>
                  <td className="p-4 font-mono font-bold text-white">{ps.workedDays} Days</td>
                  <td className="p-4 font-mono text-emerald-400">₹{ps.grossSalary?.toLocaleString('en-IN')}</td>
                  <td className="p-4 font-mono text-rose-400">₹{ps.totalDeduction?.toLocaleString('en-IN')}</td>
                  <td className="p-4 font-mono font-black text-white text-base">₹{ps.netSalary?.toLocaleString('en-IN')}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {ps.status}
                    </span>
                  </td>
                  <td className="p-4 text-right flex justify-end items-center gap-2">
                    <Link
                      to={`/payslips/${ps._id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition"
                    >
                      <Eye className="w-3.5 h-3.5" /> View Breakdown
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDownloadPDF(ps._id, ps.employee?.employeeId)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition shadow-lg shadow-indigo-600/20"
                    >
                      <Download className="w-3.5 h-3.5" /> PDF
                    </button>
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
