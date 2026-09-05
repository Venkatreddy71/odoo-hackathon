import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { TableSkeleton } from '../components/common/Skeleton';
import { CalendarClock, Plus, Clock, CheckCircle2, XCircle, Save } from 'lucide-react';

export default function WorkingSchedules() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    status: 'ACTIVE',
    days: [
      { day: 'Monday', startTime: '09:00', endTime: '17:00', breakHours: 1, isWorkingDay: true },
      { day: 'Tuesday', startTime: '09:00', endTime: '17:00', breakHours: 1, isWorkingDay: true },
      { day: 'Wednesday', startTime: '09:00', endTime: '17:00', breakHours: 1, isWorkingDay: true },
      { day: 'Thursday', startTime: '09:00', endTime: '17:00', breakHours: 1, isWorkingDay: true },
      { day: 'Friday', startTime: '09:00', endTime: '17:00', breakHours: 1, isWorkingDay: true },
      { day: 'Saturday', startTime: '09:00', endTime: '13:00', breakHours: 0, isWorkingDay: false },
      { day: 'Sunday', startTime: '09:00', endTime: '13:00', breakHours: 0, isWorkingDay: false },
    ],
  });

  const canManage = ['ADMIN', 'HR_MANAGER', 'HR_PAYROLL_MANAGER'].includes(user?.role);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const res = await API.get('/working-schedules');
      if (res.data.success) {
        setSchedules(res.data.schedules || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Helper to compute weekly hours dynamically on frontend preview
  const computeWeeklyHours = (daysList) => {
    return daysList.reduce((total, dayItem) => {
      if (!dayItem.isWorkingDay) return total;
      const [startH, startM] = dayItem.startTime.split(':').map(Number);
      const [endH, endM] = dayItem.endTime.split(':').map(Number);
      const startMinutes = startH * 60 + startM;
      const endMinutes = endH * 60 + endM;
      const workedMinutes = Math.max(0, endMinutes - startMinutes - (dayItem.breakHours || 0) * 60);
      return total + workedMinutes / 60;
    }, 0);
  };

  const handleDayChange = (index, field, value) => {
    const updatedDays = [...formData.days];
    updatedDays[index][field] = value;
    setFormData({ ...formData, days: updatedDays });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/working-schedules', formData);
      if (res.data.success) {
        addToast('Working Schedule created with automatic weekly hours calculation!', 'success');
        setShowModal(false);
        fetchSchedules();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to create schedule', 'error');
    }
  };

  const computedHoursPreview = computeWeeklyHours(formData.days);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <CalendarClock className="w-6 h-6 text-indigo-400" /> Working Schedules Configuration
          </h1>
          <p className="text-xs text-slate-400 mt-1">Configure standard shifts, breaks, and auto-computed weekly target hours.</p>
        </div>

        {canManage && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition shadow-lg shadow-indigo-600/20"
          >
            <Plus className="w-4 h-4" /> Create Schedule
          </button>
        )}
      </div>

      {/* Schedules Cards / Table */}
      {loading ? (
        <TableSkeleton rows={4} cols={4} />
      ) : schedules.length === 0 ? (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
          <CalendarClock className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-base font-bold text-white">No Working Schedules Configured</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">Create a schedule to define standard employee working hours.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {schedules.map((sch) => (
            <div key={sch._id} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-base font-bold text-white">{sch.name}</h3>
                  <span className="text-xs font-mono font-bold text-indigo-400">{sch.weeklyHours} Hours / Week</span>
                </div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    sch.status === 'ACTIVE'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {sch.status}
                </span>
              </div>

              {/* Day Breakdown Preview */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800 text-xs">
                {sch.days?.map((d) => (
                  <div key={d.day} className="flex justify-between items-center text-slate-300 py-0.5">
                    <span className="font-medium text-slate-400 w-24">{d.day}</span>
                    {d.isWorkingDay ? (
                      <span className="font-mono text-emerald-400 font-semibold">
                        {d.startTime} - {d.endTime} ({d.breakHours}h break)
                      </span>
                    ) : (
                      <span className="text-slate-500 italic">Off Day</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE SCHEDULE MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Create Working Schedule</h3>
                <p className="text-xs text-slate-400">Weekly hours automatically calculate from start, end, and break configuration.</p>
              </div>
              <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-mono font-bold">
                Auto Weekly: {computedHoursPreview} Hours
              </span>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Schedule Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Standard 40-Hour Week"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              </div>

              {/* Weekly Days Configuration */}
              <div className="space-y-2 border-t border-slate-800 pt-3">
                <p className="font-semibold text-slate-300">Day-by-Day Shift Configuration</p>
                {formData.days.map((dayItem, idx) => (
                  <div key={dayItem.day} className="flex items-center gap-3 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <div className="w-24 font-bold text-white">{dayItem.day}</div>

                    <label className="flex items-center gap-1.5 cursor-pointer text-slate-400 select-none">
                      <input
                        type="checkbox"
                        checked={dayItem.isWorkingDay}
                        onChange={(e) => handleDayChange(idx, 'isWorkingDay', e.target.checked)}
                        className="rounded border-slate-800 bg-slate-900 text-indigo-600 focus:ring-0"
                      />
                      <span>Working Day</span>
                    </label>

                    {dayItem.isWorkingDay ? (
                      <>
                        <input
                          type="time"
                          value={dayItem.startTime}
                          onChange={(e) => handleDayChange(idx, 'startTime', e.target.value)}
                          className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-white font-mono"
                        />
                        <span className="text-slate-500">to</span>
                        <input
                          type="time"
                          value={dayItem.endTime}
                          onChange={(e) => handleDayChange(idx, 'endTime', e.target.value)}
                          className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-white font-mono"
                        />
                        <div className="flex items-center gap-1">
                          <span className="text-slate-400">Break:</span>
                          <input
                            type="number"
                            min="0"
                            step="0.5"
                            value={dayItem.breakHours}
                            onChange={(e) => handleDayChange(idx, 'breakHours', parseFloat(e.target.value) || 0)}
                            className="w-14 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-white text-center font-mono"
                          />
                          <span className="text-slate-500">hrs</span>
                        </div>
                      </>
                    ) : (
                      <span className="text-slate-500 italic pl-4">Non-working Day</span>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold shadow-lg">
                  Save Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
