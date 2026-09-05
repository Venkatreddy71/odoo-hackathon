import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  FileSignature,
  Clock,
  CalendarDays,
  Sliders,
  Calculator,
  PlayCircle,
  Receipt,
  UserCheck,
  Building2,
  ShieldAlert,
  Mail,
  BarChart3,
  CalendarClock,
  Settings,
} from 'lucide-react';

export default function Sidebar() {
  const { user } = useAuth();
  const role = user?.role || 'EMPLOYEE';

  const menuGroups = [
    {
      title: 'MAIN',
      items: [
        { label: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['ADMIN', 'HR_MANAGER', 'PAYROLL_USER', 'HR_PAYROLL_MANAGER', 'EMPLOYEE'] },
        { label: 'Employees', path: '/employees', icon: Users, roles: ['ADMIN', 'HR_MANAGER', 'PAYROLL_USER', 'HR_PAYROLL_MANAGER', 'EMPLOYEE'] },
        { label: 'Contracts', path: '/contracts', icon: FileSignature, roles: ['ADMIN', 'HR_MANAGER', 'PAYROLL_USER', 'HR_PAYROLL_MANAGER'] },
        { label: 'Working Schedules', path: '/working-schedules', icon: CalendarClock, roles: ['ADMIN', 'HR_MANAGER', 'PAYROLL_USER', 'HR_PAYROLL_MANAGER'] },
        { label: 'Attendance', path: '/attendance', icon: Clock, roles: ['ADMIN', 'HR_MANAGER', 'PAYROLL_USER', 'HR_PAYROLL_MANAGER', 'EMPLOYEE'] },
        { label: 'Time Off', path: '/timeoff', icon: CalendarDays, roles: ['ADMIN', 'HR_MANAGER', 'PAYROLL_USER', 'HR_PAYROLL_MANAGER', 'EMPLOYEE'] },
      ],
    },
    {
      title: 'PAYROLL',
      items: [
        { label: 'Payruns', path: '/payruns', icon: PlayCircle, roles: ['ADMIN', 'PAYROLL_USER', 'HR_PAYROLL_MANAGER', 'HR_MANAGER'] },
        { label: 'Payslips', path: '/payslips', icon: Receipt, roles: ['ADMIN', 'PAYROLL_USER', 'HR_PAYROLL_MANAGER', 'HR_MANAGER', 'EMPLOYEE'] },
        { label: 'Salary Structures', path: '/salary-structures', icon: Building2, roles: ['ADMIN', 'PAYROLL_USER', 'HR_PAYROLL_MANAGER'] },
        { label: 'Salary Rules', path: '/salary-rules', icon: Sliders, roles: ['ADMIN', 'PAYROLL_USER', 'HR_PAYROLL_MANAGER'] },
        { label: 'Email Outbox', path: '/email-outbox', icon: Mail, roles: ['ADMIN', 'PAYROLL_USER', 'HR_PAYROLL_MANAGER', 'HR_MANAGER'] },
      ],
    },
    {
      title: 'REPORTS',
      items: [
        { label: 'Payroll Analytics', path: '/reports/payroll', icon: BarChart3, roles: ['ADMIN', 'PAYROLL_USER', 'HR_PAYROLL_MANAGER', 'HR_MANAGER'] },
        { label: 'Attendance Analytics', path: '/reports/attendance', icon: BarChart3, roles: ['ADMIN', 'PAYROLL_USER', 'HR_PAYROLL_MANAGER', 'HR_MANAGER'] },
      ],
    },
    {
      title: 'ADMIN',
      items: [
        { label: 'Users', path: '/users', icon: UserCheck, roles: ['ADMIN'] },
        { label: 'Settings', path: '/settings', icon: Settings, roles: ['ADMIN'] },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800/80 flex flex-col justify-between h-screen sticky top-0 z-40 select-none">
      <div>
        {/* Brand Header */}
        <div className="p-5 flex items-center gap-3 border-b border-slate-800/60">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/20">
            <Calculator className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
              PeoplePay<span className="text-indigo-400">360</span>
            </h1>
            <p className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase">Connected HR & Payroll</p>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4 space-y-5 overflow-y-auto max-h-[calc(100vh-160px)] custom-scrollbar">
          {menuGroups.map((group) => {
            const accessibleItems = group.items.filter((item) => item.roles.includes(role));
            if (accessibleItems.length === 0) return null;

            return (
              <div key={group.title} className="space-y-1">
                <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                  {group.title}
                </p>
                {accessibleItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                          isActive
                            ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 shadow-sm shadow-indigo-500/10'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Role Badge Footer */}
      <div className="p-4 border-t border-slate-800/60 bg-slate-900/40">
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-indigo-950 flex items-center justify-center text-indigo-400 border border-indigo-800/50">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-white truncate">{user?.email || 'User'}</p>
            <span className="inline-block px-1.5 py-0.5 text-[10px] font-bold rounded bg-indigo-500/20 text-indigo-300 uppercase tracking-wider mt-0.5">
              {role}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
