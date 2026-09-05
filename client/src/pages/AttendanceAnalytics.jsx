import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { Clock, CheckCircle2, AlertCircle, Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AttendanceAnalytics() {
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

  const { kpi, attendanceOverview = [] } = data || {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Clock className="w-6 h-6 text-indigo-400" /> Attendance & Punctuality Analytics
        </h1>
        <p className="text-xs text-slate-400 mt-1">Detailed reporting on workforce attendance compliance, missing check-outs, and punctuality.</p>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-lg">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Attendance Health Score</p>
          <h3 className="text-2xl font-black text-emerald-400 mt-1">{kpi?.attendanceQuality || 100}%</h3>
          <p className="text-xs text-slate-400 mt-1 font-medium">On-time & verified punches</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-lg">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Approved Leave Impact</p>
          <h3 className="text-2xl font-black text-indigo-400 mt-1">{kpi?.approvedLeaveDays || 0} Days</h3>
          <p className="text-xs text-slate-400 mt-1 font-medium">Authorised Time Off</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-lg">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Staff</p>
          <h3 className="text-2xl font-black text-purple-400 mt-1">{kpi?.activeEmployees || 0}</h3>
          <p className="text-xs text-slate-400 mt-1 font-medium">In tracking system</p>
        </div>
      </div>

      {/* Weekly Attendance Breakdown Chart */}
      <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl shadow-lg">
        <h3 className="text-base font-bold text-white mb-1">Weekly Workforce Attendance Distribution</h3>
        <p className="text-xs text-slate-400 mb-4">Breakdown of Present, Late, and Absent logs per workday</p>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={attendanceOverview}>
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
    </div>
  );
}
