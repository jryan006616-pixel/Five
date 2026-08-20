import React from 'react';
import { useApp } from '../../context/AppContext';
import { RhinomdsLogo } from './RhinomdsLogo';
import {
  LayoutDashboard,
  User,
  Clock,
  Coffee,
  Award,
  DollarSign,
  FileText,
  ShieldAlert,
  Users,
  Building2,
  BarChart3,
  ScrollText,
  Settings,
  Bell,
  X,
  Sparkles,
  CalendarDays,
  TimerReset,
  KeyRound,
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  isMobileOpen,
  onCloseMobile,
}) => {
  const { currentUser, currentEmployee, activeTab, setActiveTab } = useApp();

  const mobileOpen = isOpen !== undefined ? isOpen : (isMobileOpen || false);
  const handleClose = onClose || onCloseMobile;

  if (!currentUser) return null;

  const isAdmin = currentUser.role === 'admin';

  const employeeNav = [
    { id: 'dashboard', label: 'My Dashboard', icon: LayoutDashboard },
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'attendance', label: 'My Attendance', icon: Clock },
    { id: 'breaks', label: 'Breaks & Outside Time', icon: Coffee },
    { id: 'kpi', label: 'My KPI & Bonus', icon: Award },
    { id: 'salary', label: 'My Salary & Deductions', icon: DollarSign },
    { id: 'payslips', label: 'My Payslips', icon: FileText },
    { id: 'policies', label: 'Company Policies', icon: ShieldAlert },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  const adminNav = [
    { id: 'admin-dashboard', label: 'Command Center', icon: LayoutDashboard },
    { id: 'admin-employees', label: 'Staff Management', icon: Users },
    { id: 'admin-users', label: 'User Passwords & Access', icon: KeyRound },
    { id: 'admin-attendance', label: 'Attendance & Shifts', icon: Clock },
    { id: 'admin-probation', label: 'Probation Tracker', icon: TimerReset },
    { id: 'admin-kpi', label: 'KPI & Bonuses', icon: Award },
    { id: 'admin-salary', label: 'Payroll & Deductions', icon: DollarSign },
    { id: 'admin-payslips', label: 'Generate Payslips', icon: FileText },
    { id: 'admin-policies', label: 'Attendance Policies', icon: ShieldAlert },
    { id: 'admin-departments', label: 'Departments & Roles', icon: Building2 },
    { id: 'admin-reports', label: 'Executive Reports', icon: BarChart3 },
    { id: 'admin-audit', label: 'Security Audit Logs', icon: ScrollText },
  ];

  const currentNav = isAdmin ? adminNav : employeeNav;

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    if (handleClose) handleClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={handleClose}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col w-64 bg-[#090d16] border-r border-slate-800/80 transition-transform duration-300 ease-in-out lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:translate-x-0 lg:z-10 shrink-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo Branding */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800/80 bg-[#0c121e] lg:hidden">
          <RhinomdsLogo size="sm" />
          <button
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Role Badge Banner */}
        <div className="p-3 mx-3 my-3 rounded-xl bg-gradient-to-r from-slate-900 via-slate-800/60 to-slate-900 border border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  isAdmin ? 'bg-amber-400 animate-pulse' : 'bg-cyan-400 animate-ping'
                }`}
              />
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                {isAdmin ? 'HR Admin Portal' : 'Employee Portal'}
              </span>
            </div>
            <span
              className={`px-1.5 py-0.5 text-[9px] font-mono font-bold rounded ${
                isAdmin
                  ? 'bg-amber-950 text-amber-300 border border-amber-800/50'
                  : 'bg-cyan-950 text-cyan-300 border border-cyan-800/50'
              }`}
            >
              {isAdmin ? 'FULL ACCESS' : currentEmployee?.id || 'STAFF'}
            </span>
          </div>

          <p className="text-xs font-semibold text-white mt-1.5 truncate">
            {currentUser.fullName}
          </p>
          <p className="text-[11px] text-slate-400 truncate">
            {isAdmin ? 'Director of Operations' : currentEmployee?.department || 'RCM Operations'}
          </p>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto custom-scrollbar">
          <div className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            {isAdmin ? 'Administration Modules' : 'Workspace Menu'}
          </div>

          {currentNav.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all group relative ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-950/90 to-sky-950/60 text-cyan-300 border border-cyan-700/60 shadow-md shadow-cyan-950/40 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-cyan-400 rounded-r-full shadow-sm shadow-cyan-400" />
                )}
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive
                      ? 'text-cyan-400'
                      : 'text-slate-400 group-hover:text-cyan-300'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom Shift Footer */}
        <div className="p-3 border-t border-slate-800/80 bg-[#0c121e]/80">
          <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px]">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="font-mono text-[10px] text-cyan-400 uppercase">US Billing Shift</span>
              <span className="text-[10px] text-emerald-400 font-semibold">Active</span>
            </div>
            <p className="text-slate-300 text-[11px] font-medium leading-tight">
              06:00 PM – 03:00 AM PKT
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              US Payer Real-time Adjudication
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
