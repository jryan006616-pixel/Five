import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Bell,
  Clock,
  Shield,
  User,
  LogOut,
  ChevronDown,
  Globe,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FileText,
  DollarSign,
  Award,
  Menu,
} from 'lucide-react';

interface NavbarProps {
  onToggleSidebar?: () => void;
  onMenuToggle?: () => void;
}

export const HeaderNavbar: React.FC<NavbarProps> = ({ onToggleSidebar, onMenuToggle }) => {
  const toggleHandler = onToggleSidebar || onMenuToggle;
  const {
    currentUser,
    currentEmployee,
    allUsers,
    quickSwitchUser,
    logout,
    notifications,
    markNotificationAsRead,
    markAllNotificationsRead,
    setActiveTab,
  } = useApp();

  const [showPersonaMenu, setShowPersonaMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [currentTimePkt, setCurrentTimePkt] = useState('');
  const [currentTimeEst, setCurrentTimeEst] = useState('');

  // Live clocks for RCM Night Shift (US Houston / EST & PKT local)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Format PKT time
      setCurrentTimePkt(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
      // Format US EST time (approx UTC-5)
      const estDate = new Date(now.getTime() - 10 * 3600 * 1000); // approx EST offset
      setCurrentTimeEst(
        estDate.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!currentUser) return null;

  // Filter notifications for current user (or 'all')
  const userNotifs = notifications.filter(
    n => n.targetUserId === 'all' || n.targetUserId === currentUser.id
  );
  const unreadCount = userNotifs.filter(n => !n.read).length;

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'salary':
      case 'deduction':
        return <DollarSign className="w-4 h-4 text-emerald-400" />;
      case 'bonus':
        return <Award className="w-4 h-4 text-amber-400" />;
      case 'payslip':
        return <FileText className="w-4 h-4 text-cyan-400" />;
      case 'probation':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      default:
        return <CheckCircle2 className="w-4 h-4 text-sky-400" />;
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 bg-[#0c121e]/90 backdrop-blur-md border-b border-slate-800/80">
      {/* Left: Mobile Toggle & Live RCM Shift Clock */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleHandler}
          className="p-2 text-slate-400 hover:text-white rounded-lg lg:hidden hover:bg-slate-800/60"
          title="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Dual US & PKT Dual Time Clock (Crucial for Medical Billing Teams) */}
        <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800/90 text-xs">
          <div className="flex items-center gap-1.5 text-cyan-400 font-mono font-medium">
            <Clock className="w-3.5 h-3.5 animate-pulse" />
            <span>PKT: {currentTimePkt || '06:00 PM'}</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-1.5 text-slate-300 font-mono">
            <Globe className="w-3.5 h-3.5 text-sky-400" />
            <span>US EST (Houston): {currentTimeEst || '08:00 AM'}</span>
          </div>
          <span className="px-1.5 py-0.2 text-[10px] uppercase font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 rounded">
            Live Shift
          </span>
        </div>
      </div>

      {/* Right: Quick Persona Switcher + Notifications + User Menu */}
      <div className="flex items-center gap-3">
        {/* Quick Role / Persona Switcher for effortless testing & evaluation */}
        <div className="relative">
          <button
            onClick={() => setShowPersonaMenu(!showPersonaMenu)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-950/80 to-slate-900 border border-cyan-700/50 hover:border-cyan-500 text-xs text-slate-200 transition-all shadow-sm shadow-cyan-950/30"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline font-medium text-slate-400">Switch Persona:</span>
            <span className="font-semibold text-cyan-300">
              {currentUser.role === 'admin' ? '👑 Admin' : `👤 ${currentUser.fullName.split(' ')[0] || currentUser.username}`}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showPersonaMenu && (
            <div className="absolute right-0 mt-2 w-72 rounded-xl bg-[#0f172a] border border-slate-700 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-2 border-b border-slate-800">
                <p className="text-xs font-semibold text-white">Instant Account Switcher</p>
                <p className="text-[11px] text-slate-400">
                  Switch between Admin and Employee roles to test full RBAC permissions.
                </p>
              </div>
              <div className="py-1 space-y-1">
                {allUsers.map(u => (
                  <button
                    key={u.id}
                    onClick={() => {
                      quickSwitchUser(u.id);
                      setShowPersonaMenu(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-xs transition-colors ${
                      u.id === currentUser.id
                        ? 'bg-cyan-950/70 text-cyan-300 border border-cyan-800/60'
                        : 'text-slate-300 hover:bg-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={u.avatar}
                        alt={u.fullName}
                        className="w-6 h-6 rounded-full object-cover border border-slate-700"
                      />
                      <div>
                        <p className="font-semibold text-slate-200">{u.fullName}</p>
                        <p className="text-[10px] text-slate-400">
                          {u.role === 'admin' ? 'Director of HR (Admin)' : u.username}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-1.5 py-0.5 text-[9px] font-bold rounded uppercase ${
                        u.role === 'admin'
                          ? 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {u.role}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-400 hover:text-white rounded-lg bg-slate-900/60 border border-slate-800 hover:bg-slate-800/80 transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-cyan-500 rounded-full animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-[#0f172a] border border-slate-700 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
              <div className="flex items-center justify-between px-4 py-3 bg-slate-900/90 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold text-white">Notifications ({unreadCount} unread)</span>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-[11px] text-cyan-400 hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
                {userNotifs.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500">No notifications yet</div>
                ) : (
                  userNotifs.map(n => (
                    <div
                      key={n.id}
                      onClick={() => {
                        markNotificationAsRead(n.id);
                        if (n.linkTab) setActiveTab(n.linkTab);
                        setShowNotifications(false);
                      }}
                      className={`p-3 text-xs transition-colors cursor-pointer ${
                        !n.read ? 'bg-cyan-950/30 hover:bg-cyan-950/50' : 'hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="p-1.5 rounded-lg bg-slate-800/90 border border-slate-700/60 shrink-0">
                          {getNotifIcon(n.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className={`font-semibold truncate ${!n.read ? 'text-white' : 'text-slate-300'}`}>
                              {n.title}
                            </p>
                            {!n.read && (
                              <span className="w-2 h-2 rounded-full bg-cyan-400 shrink-0 ml-1"></span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">
                            {n.message}
                          </p>
                          <span className="text-[10px] text-slate-500 mt-1 inline-block">
                            {n.createdAt}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill & Logout */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
          <div className="flex items-center gap-2">
            <img
              src={currentUser.avatar}
              alt={currentUser.fullName}
              className="w-8 h-8 rounded-lg object-cover border border-cyan-500/40"
            />
            <div className="hidden lg:block text-left">
              <p className="text-xs font-bold text-slate-200 leading-tight">{currentUser.fullName}</p>
              <p className="text-[10px] text-cyan-400 font-medium">
                {currentUser.role === 'admin' ? 'HR Administrator' : currentEmployee?.designation || 'Specialist'}
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            className="p-2 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800/60 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
