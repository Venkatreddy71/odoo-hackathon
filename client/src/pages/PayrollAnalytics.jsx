import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { BarChart3, TrendingUp, IndianRupee, Building, FileText } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function PayrollAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await API.get('/dashboard/summary');
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const { kpi, monthlyTrend = [], salaryByDepartment = [] } = data || {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-indigo-400" /> Payroll Analytics & Expenditure Report
        </h1>
        <p className="text-xs text-slate-400 mt-1">Deep analysis of company salary expenses, department cost breakdown, and payroll trends.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-lg">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Net Disbursement</p>
          <h3 className="text-2xl font-black text-white mt-1">
            ₹{(kpi?.totalNetPaid || 0).toLocaleString('en-IN')}
          </h3>
          <p className="text-xs text-emerald-400 mt-1 font-medium">Cumulative Total Settled</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-lg">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Average Monthly Net Wage</p>
          <h3 className="text-2xl font-black text-indigo-400 mt-1">
            ₹{(kpi?.avgSalary || 0).toLocaleString('en-IN')}
          </h3>
          <p className="text-xs text-slate-400 mt-1 font-medium">Per Active Staff Member</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-lg">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Statements Issued</p>
          <h3 className="text-2xl font-black text-purple-400 mt-1">{kpi?.totalPayslipsProcessed || 0}</h3>
          <p className="text-xs text-slate-400 mt-1 font-medium">Calculated by Rule Engine</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl shadow-lg">
          <h3 className="text-base font-bold text-white mb-1">Monthly Payroll Trend</h3>
          <p className="text-xs text-slate-400 mb-4">Historical disbursement progression</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                <Area type="monotone" dataKey="netSalary" stroke="#6366f1" strokeWidth={3} fill="#6366f1" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl shadow-lg">
          <h3 className="text-base font-bold text-white mb-1">Department Salary Expense Distribution</h3>
          <p className="text-xs text-slate-400 mb-4">Net salary expense grouped by department</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salaryByDepartment}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="departmentName" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                <Bar dataKey="totalNet" fill="#818cf8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
