import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, UserCheck } from 'lucide-react';

export default function CalendarView({ events = [], onDayClick, onEventClick, title = "Company HR Calendar" }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Days in current month
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const resetToToday = () => {
    setCurrentDate(new Date());
  };

  // Helper to format YYYY-MM-DD
  const formatDateString = (y, m, d) => {
    const mm = String(m + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    return `${y}-${mm}-${dd}`;
  };

  // Build calendar matrix
  const calendarCells = [];

  // Previous month trailing days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    const dayNum = daysInPrevMonth - i;
    const dateStr = formatDateString(month === 0 ? year - 1 : year, month === 0 ? 11 : month - 1, dayNum);
    calendarCells.push({
      dayNum,
      dateStr,
      isCurrentMonth: false,
      isToday: false,
    });
  }

  // Current month days
  const todayObj = new Date();
  const todayStr = formatDateString(todayObj.getFullYear(), todayObj.getMonth(), todayObj.getDate());

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = formatDateString(year, month, d);
    calendarCells.push({
      dayNum: d,
      dateStr,
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
    });
  }

  // Next month leading days (to fill 42 cells grid = 6 rows)
  const remainingCells = 42 - calendarCells.length;
  for (let i = 1; i <= remainingCells; i++) {
    const dateStr = formatDateString(month === 11 ? year + 1 : year, month === 11 ? 0 : month + 1, i);
    calendarCells.push({
      dayNum: i,
      dateStr,
      isCurrentMonth: false,
      isToday: false,
    });
  }

  // Group events by date string
  const eventsByDate = {};
  events.forEach((evt) => {
    if (!evt.date) return;
    // Extract YYYY-MM-DD from Date or string
    const dStr = typeof evt.date === 'string' ? evt.date.substring(0, 10) : new Date(evt.date).toISOString().substring(0, 10);
    if (!eventsByDate[dStr]) eventsByDate[dStr] = [];
    eventsByDate[dStr].push(evt);
  });

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md space-y-6">
      {/* Calendar Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">{title}</h2>
            <p className="text-xs text-slate-400">
              {monthNames[month]} {year}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={resetToToday}
            className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold rounded-xl transition"
          >
            Today
          </button>
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1">
            <button
              onClick={prevMonth}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg transition"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-white px-3 font-mono">
              {monthNames[month].substring(0, 3)} {year}
            </span>
            <button
              onClick={nextMonth}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg transition"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Days of Week Header */}
      <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2">
        {daysOfWeek.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      {/* 6x7 Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {calendarCells.map((cell, idx) => {
          const dayEvents = eventsByDate[cell.dateStr] || [];

          return (
            <div
              key={idx}
              onClick={() => onDayClick && onDayClick(cell.dateStr, dayEvents)}
              className={`min-h-[95px] p-2 rounded-xl border flex flex-col justify-between transition-all duration-150 cursor-pointer ${
                cell.isToday
                  ? 'bg-indigo-950/40 border-indigo-500/80 shadow-md shadow-indigo-500/10 ring-1 ring-indigo-500/40'
                  : cell.isCurrentMonth
                  ? 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60'
                  : 'bg-slate-950/20 border-slate-900/60 text-slate-600 opacity-40'
              }`}
            >
              <div className="flex justify-between items-center">
                <span
                  className={`text-xs font-bold font-mono ${
                    cell.isToday
                      ? 'text-indigo-400 bg-indigo-500/20 px-1.5 py-0.5 rounded'
                      : cell.isCurrentMonth
                      ? 'text-slate-300'
                      : 'text-slate-600'
                  }`}
                >
                  {cell.dayNum}
                </span>
                {dayEvents.length > 0 && (
                  <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300">
                    {dayEvents.length}
                  </span>
                )}
              </div>

              {/* Day Events Stack */}
              <div className="space-y-1 mt-1 overflow-y-auto max-h-[60px] custom-scrollbar">
                {dayEvents.slice(0, 3).map((evt, eIdx) => {
                  let badgeBg = 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
                  if (evt.status === 'APPROVED' || evt.status === 'Present') {
                    badgeBg = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
                  } else if (evt.status === 'SUBMITTED' || evt.status === 'PENDING' || evt.status === 'Late') {
                    badgeBg = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
                  } else if (evt.status === 'REJECTED' || evt.status === 'Absent' || evt.status === 'MISSING_CHECKOUT') {
                    badgeBg = 'bg-rose-500/20 text-rose-300 border-rose-500/30';
                  }

                  return (
                    <div
                      key={eIdx}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onEventClick) onEventClick(evt);
                      }}
                      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border truncate cursor-pointer hover:opacity-80 transition ${badgeBg}`}
                      title={`${evt.title || evt.employeeName || 'Event'} (${evt.status || ''})`}
                    >
                      {evt.title || evt.employeeName || 'Record'}
                    </div>
                  );
                })}
                {dayEvents.length > 3 && (
                  <div className="text-[9px] text-slate-400 font-bold pl-1">
                    +{dayEvents.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
