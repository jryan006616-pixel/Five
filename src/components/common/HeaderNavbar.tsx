import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ProfileEditModal } from './ProfileEditModal';
import {
  Bell,
  Clock,
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
  Search,
  Camera,
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
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [currentTimePkt, setCurrentTimePkt] = useState('');
  const [currentTimeEst, setCurrentTimeEst] = useState('');

  // Live clocks for RCM Night Shift (US Houston / EST & PKT local)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimePkt(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })
      );
      const estDate = new Date(now.getTime() - 10 * 3600 * 1000);
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

  const userNotifs = notifications.filter(
    n => n.targetUserId === 'all' || n.targetUserId === currentUser.id
  );
  const unreadCount = userNotifs.filter(n => !n.read).length;

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'salary':
      case 'deduction':
        return <DollarSign className="w-4 h-4 text-emerald-600" />;
      case 'bonus':
        return <Award className="w-4 h-4 text-amber-600" />;
      case 'payslip':
        return <FileText className="w-4 h-4 text-indigo-600" />;
      case 'probation':
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
      default:
        return <CheckCircle2 className="w-4 h-4 text-sky-600" />;
    }
  };

  const firstName = currentUser.fullName.split(' ')[0] || currentUser.username;

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between h-20 px-4 sm:px-8 bg-[#eae8e3]/90 backdrop-blur-md border-b border-[#d8d5cc]/80">
      {/* Left: Mobile Toggle & Big Greeting */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleHandler}
          className="p-2 text-slate-700 hover:text-black rounded-xl lg:hidden hover:bg-black/5 cursor-pointer"
          title="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-xl sm:text-2xl font-black font-['Outfit'] text-[#141619] tracking-tight leading-none">
            Hello {firstName}
          </h1>
          <p className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-1">
            {currentUser.role === 'admin' ? 'RHINOMDS OPERATIONS & HR PORTAL' : 'RCM SPECIALIST WORKSPACE'}
          </p>
        </div>
      </div>

      {/* Right: Live Shift Clock + Role Switcher + Search + Notifications + Logout */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Dual Live Shift Clock */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 border border-[#d8d5cc] shadow-xs text-xs">
          <div className="flex items-center gap-1.5 text-slate-700 font-mono font-medium">
            <Clock className="w-3.5 h-3.5 text-slate-900" />
            <span className="text-slate-400 text-[10px] uppercase font-bold">PKT:</span>
            <span className="font-bold">{currentTimePkt || '06:00 PM'}</span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-1.5 text-slate-700 font-mono">
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400 text-[10px] uppercase font-bold">EST:</span>
            <span className="font-semibold">{currentTimeEst || '08:00 AM'}</span>
          </div>
        </div>

        {/* Quick Role / Persona Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowPersonaMenu(!showPersonaMenu)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#121316] text-white hover:bg-black text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#d6f932]" />
            <span className="hidden sm:inline font-mono uppercase text-[10px] text-slate-400">ROLE:</span>
            <span className="text-white text-xs font-bold font-mono">
              {currentUser.role === 'admin' ? 'ADMIN' : 'STAFF'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showPersonaMenu && (
            <div className="absolute right-0 mt-2 w-72 rounded-3xl bg-white border border-slate-200 shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900">Instant Persona Switcher</p>
                <p className="text-[11px] text-slate-500">
                  Switch between Admin & Staff accounts instantly.
                </p>
              </div>
              <div className="py-1 space-y-1 max-h-64 overflow-y-auto custom-scrollbar">
                {allUsers.map(u => (
                  <button
                    key={u.id}
                    onClick={() => {
                      quickSwitchUser(u.id);
                      setShowPersonaMenu(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-left text-xs transition-colors cursor-pointer ${
                      u.id === currentUser.id
                        ? 'bg-[#121316] text-white font-bold'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={u.avatar}
                        alt={u.fullName}
                        className="w-7 h-7 rounded-xl object-cover border border-slate-200"
                      />
                      <div>
                        <p className="font-semibold">{u.fullName}</p>
                        <p className={`text-[10px] ${u.id === currentUser.id ? 'text-slate-400' : 'text-slate-500'}`}>
                          {u.role === 'admin' ? 'Admin Director' : u.username}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 text-[9px] font-mono font-bold rounded-full uppercase ${
                        u.role === 'admin'
                          ? 'bg-amber-100 text-amber-900 border border-amber-200'
                          : 'bg-slate-200 text-slate-800'
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

        {/* Notifications Button */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2.5 text-slate-700 hover:text-black rounded-full bg-white border border-[#d8d5cc] shadow-xs hover:shadow-md transition-all cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 text-[9px] font-black text-black bg-[#d6f932] rounded-full shadow-sm">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-3xl bg-white border border-slate-200 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
              <div className="flex items-center justify-between px-5 py-3.5 bg-slate-50 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-slate-800" />
                  <span className="text-xs font-bold text-slate-900">Notifications ({unreadCount} unread)</span>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllNotificationsRead}
                    className="text-[11px] font-semibold text-slate-600 hover:text-black cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 custom-scrollbar">
                {userNotifs.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">No notifications yet</div>
                ) : (
                  userNotifs.map(n => (
                    <div
                      key={n.id}
                      onClick={() => {
                        markNotificationAsRead(n.id);
                        if (n.linkTab) setActiveTab(n.linkTab);
                        setShowNotifications(false);
                      }}
                      className={`p-3.5 text-xs transition-colors cursor-pointer ${
                        !n.read ? 'bg-amber-50/50 hover:bg-amber-50' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="p-2 rounded-xl bg-white border border-slate-200 shrink-0 shadow-xs">
                          {getNotifIcon(n.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-bold text-slate-900 truncate">
                              {n.title}
                            </p>
                            {!n.read && (
                              <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 ml-1"></span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2 leading-relaxed">
                            {n.message}
                          </p>
                          <span className="text-[10px] text-slate-400 mt-1 inline-block font-mono">
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

        {/* Profile Picture Display (Editable for Admin only) */}
        {currentUser.role === 'admin' ? (
          <button
            onClick={() => setShowProfileModal(true)}
            className="flex items-center gap-1.5 p-1 pr-2.5 rounded-full bg-white border border-[#d8d5cc] hover:border-black shadow-xs transition-all cursor-pointer group"
            title="Update Profile Picture & Admin Information"
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.fullName}
              className="w-7 h-7 rounded-full object-cover border border-slate-300 group-hover:scale-105 transition-transform"
            />
            <span className="hidden xl:inline text-xs font-bold text-slate-800 truncate max-w-[90px]">
              {firstName}
            </span>
            <Camera className="w-3.5 h-3.5 text-slate-400 group-hover:text-black transition-colors" />
          </button>
        ) : (
          <div
            className="flex items-center gap-1.5 p-1 pr-3 rounded-full bg-white/80 border border-[#d8d5cc] shadow-xs"
            title={`${currentUser.fullName} (Managed by HR)`}
          >
            <img
              src={currentUser.avatar}
              alt={currentUser.fullName}
              className="w-7 h-7 rounded-full object-cover border border-slate-300"
            />
            <span className="hidden sm:inline text-xs font-bold text-slate-800 truncate max-w-[90px]">
              {firstName}
            </span>
          </div>
        )}

        {/* Sign Out Button */}
        <button
          onClick={logout}
          className="p-2.5 text-slate-700 hover:text-rose-600 rounded-full bg-white border border-[#d8d5cc] shadow-xs hover:shadow-md transition-all cursor-pointer"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      {/* Profile Edit Modal with Computer File Upload */}
      <ProfileEditModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </header>
  );
};

