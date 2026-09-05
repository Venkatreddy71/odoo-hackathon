import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import { LogOut, Clock, Play, Square, ShieldCheck, User, UserCheck } from 'lucide-react';


export default function Header() {
  const { user, logout } = useAuth();
  const [attendanceStatus, setAttendanceStatus] = useState(null);
  const [elapsedTime, setElapsedTime] = useState('00:00:00');
  const [loading, setLoading] = useState(false);

  const hasEmployeeProfile = Boolean(user?.employee);

  useEffect(() => {
    if (hasEmployeeProfile) {
      fetchAttendanceStatus();
      const interval = setInterval(fetchAttendanceStatus, 15000);
      return () => clearInterval(interval);
    }
  }, [hasEmployeeProfile]);

  // Timer tick for active working session
  useEffect(() => {
    let timer;
    if (attendanceStatus?.isWorking && attendanceStatus?.activeSession?.checkIn) {
      timer = setInterval(() => {
        const start = new Date(attendanceStatus.activeSession.checkIn).getTime();
        const now = new Date().getTime();
        const diff = Math.max(0, now - start);

        const hrs = String(Math.floor(diff / (1000 * 60 * 60))).padStart(2, '0');
        const mins = String(Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
        const secs = String(Math.floor((diff % (1000 * 60)) / 1000)).padStart(2, '0');

        setElapsedTime(`${hrs}:${mins}:${secs}`);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [attendanceStatus]);

  const fetchAttendanceStatus = async () => {
    try {
      const res = await API.get('/attendance/status');
      if (res.data.success) {
        setAttendanceStatus(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCheckIn = async () => {
    setLoading(true);
    try {
      await API.post('/attendance/check-in');
      await fetchAttendanceStatus();
    } catch (err) {
      alert(err.response?.data?.message || 'Check-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setLoading(true);
    try {
      await API.post('/attendance/check-out');
      await fetchAttendanceStatus();
    } catch (err) {
      alert(err.response?.data?.message || 'Check-out failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <header className="h-16 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <h2 className="text-sm font-semibold text-slate-300">
          Welcome back,{' '}
          <span className="text-white font-bold">
            {user?.employee ? `${user.employee.firstName} ${user.employee.lastName}` : user?.email}
          </span>
        </h2>
      </div>

      {/* Attendance Clock Widget for Employees vs Admin Badge */}
      <div className="flex items-center gap-4">
        {hasEmployeeProfile ? (
          <div className="flex items-center gap-3 bg-slate-900/90 px-4 py-1.5 rounded-full border border-slate-800 shadow-inner">
            {attendanceStatus?.isWorking ? (
              <>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-xs font-semibold text-emerald-400">Working</span>
                </div>
                <span className="text-xs font-mono font-bold text-slate-200 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                  {elapsedTime}
                </span>
                <button
                  onClick={handleCheckOut}
                  disabled={loading}
                  className="flex items-center gap-1 px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-full text-xs font-semibold transition shadow-md shadow-rose-600/20"
                >
                  <Square className="w-3 h-3 fill-white" /> Check Out
                </button>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span>
                  <span className="text-xs font-semibold text-slate-400">Not Clocked In</span>
                </div>
                <button
                  onClick={handleCheckIn}
                  disabled={loading}
                  className="flex items-center gap-1 px-3.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full text-xs font-semibold transition shadow-md shadow-emerald-600/20"
                >
                  <Play className="w-3 h-3 fill-white" /> Check In
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-indigo-950/60 border border-indigo-800/60 px-3.5 py-1.5 rounded-full text-xs font-semibold text-indigo-300">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span>System Management Account</span>
          </div>
        )}

        {['ADMIN', 'HR_MANAGER', 'PAYROLL_USER', 'HR_PAYROLL_MANAGER'].includes(user?.role) && (
          <Link
            to="/users"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white rounded-xl border border-indigo-500/30 text-xs font-bold transition shadow-sm"
            title="Manage Users & Roles"
          >
            <UserCheck className="w-4 h-4 text-indigo-400" />
            <span>User Control</span>
          </Link>
        )}

        {/* User Logout Button */}
        <button
          onClick={logout}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 border border-transparent hover:border-rose-900/50 transition"
          title="Sign out"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>

      </div>
    </header>
  );
}
