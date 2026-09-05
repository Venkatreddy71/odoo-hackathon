import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { PlayCircle, Plus, Eye, IndianRupee, Calendar } from 'lucide-react';

export default function Payruns() {
  const [payruns, setPayruns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayruns();
  }, []);

  const fetchPayruns = async () => {
    try {
      const res = await API.get('/payruns');
      if (res.data.success) {
        setPayruns(res.data.payruns);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <PlayCircle className="w-6 h-6 text-indigo-400" /> Payruns & Execution Workflow
          </h1>
          <p className="text-sm text-slate-400 mt-1">Manage payroll execution cycles from Draft $\rightarrow$ Compute $\rightarrow$ Validate $\rightarrow$ Paid.</p>
        </div>
        <Link
          to="/payruns/create"
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition shadow-lg shadow-indigo-600/20"
        >
          <Plus className="w-4 h-4" /> Start New Payrun Wizard
        </Link>
      </div>

      {/* Payruns List */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-4">Payrun Name</th>
                <th className="p-4">Period</th>
                <th className="p-4">Structure</th>
                <th className="p-4">Employees</th>
                <th className="p-4">Total Net Salary</th>
                <th className="p-4">Workflow Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {payruns.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-500">
                    No payruns created yet. Use the Wizard above to start a new payrun.
                  </td>
                </tr>
              ) : (
                payruns.map((payrun) => (
                  <tr key={payrun._id} className="hover:bg-slate-800/40 transition">
                    <td className="p-4 font-bold text-white">{payrun.name}</td>
                    <td className="p-4 text-xs font-mono">
                      {new Date(payrun.periodStart).toLocaleDateString('en-IN')} - {new Date(payrun.periodEnd).toLocaleDateString('en-IN')}
                    </td>
                    <td className="p-4">{payrun.salaryStructure?.name}</td>
                    <td className="p-4 font-mono font-bold text-white">{payrun.employees?.length || 0} Staff</td>
                    <td className="p-4 font-mono font-bold text-indigo-400 text-base">₹{(payrun.totalNet || 0).toLocaleString('en-IN')}</td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                          payrun.status === 'PAID'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : payrun.status === 'VALIDATE'
                            ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                            : payrun.status === 'COMPUTE'
                            ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {payrun.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        to={`/payruns/${payrun._id}`}
                        className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white rounded-xl text-xs font-semibold transition"
                      >
                        <Eye className="w-3.5 h-3.5" /> Open Command Center
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
