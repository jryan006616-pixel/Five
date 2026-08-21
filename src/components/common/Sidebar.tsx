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
  Bell,
  X,
  Sparkles,
  TimerReset,
  KeyRound,
  ChevronRight,
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
    { id: 'dashboard', label: 'DASHBOARD', icon: LayoutDashboard },
    { id: 'profile', label: 'MY PROFILE', icon: User },
    { id: 'attendance', label: 'ATTENDANCE', icon: Clock },
    { id: 'breaks', label: 'BREAKS & TIME', icon: Coffee },
    { id: 'kpi', label: 'KPI & BONUSES', icon: Award },
    { id: 'salary', label: 'DEDUCTIONS & SLIPS', icon: DollarSign },
    { id: 'payslips', label: 'PAYSLIPS', icon: FileText },
    { id: 'policies', label: 'POLICIES', icon: ShieldAlert },
    { id: 'notifications', label: 'NOTIFICATIONS', icon: Bell },
  ];

  const adminNav = [
    { id: 'admin-dashboard', label: 'DASHBOARD', icon: LayoutDashboard },
    { id: 'admin-employees', label: 'STAFF & ROSTER', icon: Users },
    { id: 'admin-users', label: 'USER PASSWORDS', icon: KeyRound },
    { id: 'admin-attendance', label: 'ATTENDANCE', icon: Clock },
    { id: 'admin-probation', label: 'PROBATION', icon: TimerReset },
    { id: 'admin-kpi', label: 'KPI BONUSES', icon: Award },
    { id: 'admin-salary', label: 'PAYROLL DEPT', icon: DollarSign },
    { id: 'admin-payslips', label: 'GENERATE SLIPS', icon: FileText },
    { id: 'admin-policies', label: 'POLICY RULES', icon: ShieldAlert },
    { id: 'admin-departments', label: 'DEPARTMENTS', icon: Building2 },
    { id: 'admin-reports', label: 'ANALYTICS', icon: BarChart3 },
    { id: 'admin-audit', label: 'SECURITY LOGS', icon: ScrollText },
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
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex flex-col w-64 bg-[#121316] text-[#8e959e] border-r border-[#22242a] transition-transform duration-300 ease-in-out lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 lg:z-30 shrink-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Logo Brand */}
        <div className="flex items-center justify-between h-20 px-6 border-b border-[#22242a]/60 shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-['Space_Grotesk'] text-xl font-extrabold tracking-wider text-white uppercase">
              RHINOMDS<span className="text-[#d6f932]">.</span>
            </span>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg lg:hidden cursor-pointer hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          {currentNav.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-2xl text-[11px] font-bold tracking-wider transition-all duration-150 group relative cursor-pointer ${
                  isActive
                    ? 'text-[#d6f932] bg-[#1a1c21]'
                    : 'text-[#828892] hover:text-white hover:bg-[#181a1f]'
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-[#d6f932] rounded-r-full shadow-[0_0_12px_#d6f932]" />
                )}
                <Icon
                  className={`w-4 h-4 transition-colors shrink-0 ${
                    isActive ? 'text-[#d6f932]' : 'text-[#828892] group-hover:text-white'
                  }`}
                />
                <span className="truncate uppercase font-mono">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* AI Analytics Promo Card (Inspired by reference design) */}
        <div className="px-4 py-2 shrink-0">
          <div className="relative p-4 rounded-3xl bg-gradient-to-br from-[#2a2c33] via-[#1f2127] to-[#16171b] border border-white/10 shadow-xl overflow-hidden group">
            {/* Ambient metallic sheen */}
            <div className="absolute -top-10 -right-10 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none group-hover:bg-[#d6f932]/10 transition-colors" />
            
            <div className="flex items-center justify-center w-8 h-8 rounded-2xl bg-white/10 mb-2.5 backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-[#d6f932]" />
            </div>

            <p className="text-[11px] font-bold text-white tracking-wide uppercase font-['Space_Grotesk'] leading-tight">
              AI FOR RESULTS
            </p>
            <p className="text-[10px] text-slate-400 mb-3 uppercase tracking-wider">
              {isAdmin ? 'RCM Staff Automation' : 'Performance Insights'}
            </p>

            <button
              onClick={() => setActiveTab(isAdmin ? 'admin-reports' : 'kpi')}
              className="w-full py-2 px-3 rounded-full bg-black/70 hover:bg-black text-white text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 border border-white/10 transition-all cursor-pointer shadow-md group-hover:border-[#d6f932]/40"
            >
              <span>TRY NOW</span>
              <ChevronRight className="w-3 h-3 text-[#d6f932]" />
            </button>
          </div>
        </div>

        {/* Bottom Profile Pill */}
        <div className="p-4 border-t border-[#22242a]/60 shrink-0">
          <div className="flex items-center gap-3 p-2 rounded-2xl bg-[#17191e] border border-white/5">
            <img
              src={currentUser.avatar}
              alt={currentUser.fullName}
              className="w-9 h-9 rounded-xl object-cover border border-white/10 shadow-sm"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate leading-tight">
                {currentUser.fullName}
              </p>
              <p className="text-[10px] text-[#8e959e] uppercase font-mono truncate">
                {isAdmin ? 'OPERATIONS LEAD' : currentEmployee?.jobTitle || 'RCM SPECIALIST'}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

