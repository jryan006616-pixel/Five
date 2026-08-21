import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BreakCategory } from '../../types';
import { ProfileEditModal } from '../common/ProfileEditModal';
import {
  formatTimeTo12HourWithTimezone,
  formatMinutesTo12Hour,
  parseTimeToMinutes,
  DEFAULT_SHIFT_CONFIG,
} from '../../utils/shiftUtils';
import {
  Clock,
  Coffee,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Award,
  Calendar,
  Sparkles,
  ArrowUpRight,
  ShieldAlert,
  Play,
  Square,
  Timer,
  ChevronRight,
  MoreVertical,
  Check,
  Plus,
  Edit3,
} from 'lucide-react';

export const EmployeeDashboard: React.FC = () => {
  const {
    currentUser,
    currentEmployee,
    attendanceRecords,
    kpiRecords,
    salaryRecords,
    deductions,
    policy,
    companyTasks,
    toggleCompanyTask,
    getTodayAttendance,
    getActiveBreak,
    checkIn,
    startBreak,
    endBreak,
    checkOut,
    setActiveTab,
  } = useApp();

  const [selectedBreakCategory, setSelectedBreakCategory] = useState<BreakCategory>('Lunch / Dinner Break');
  const [breakReason, setBreakReason] = useState('');
  const [showBreakModal, setShowBreakModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  if (!currentUser || !currentEmployee) {
    return (
      <div className="p-8 rounded-3xl bg-white border border-slate-200 text-center space-y-4">
        <h3 className="text-lg font-bold text-slate-800">Employee Record Not Linked</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Your account is currently active as an Administrator. You can view all company staff and rosters from the Admin Dashboard or link an employee profile.
        </p>
        <button
          onClick={() => setActiveTab('admin-dashboard')}
          className="px-5 py-2 rounded-full bg-black text-white text-xs font-bold hover:bg-slate-800"
        >
          Go to Admin Dashboard
        </button>
      </div>
    );
  }

  const todayAtt = getTodayAttendance(currentEmployee.id);
  const activeBreak = getActiveBreak(currentEmployee.id);

  // Real employee attendance metrics
  const employeeAttendance = attendanceRecords.filter(a => a.employeeId === currentEmployee.id);
  const daysAttended = employeeAttendance.filter(a => a.status === 'Present' || a.status === 'Late').length;
  const lateCount = employeeAttendance.filter(a => a.isLate).length;

  // Real current month salary
  const currentMonth = 'August 2026';
  const currentSalary = salaryRecords.find(
    s => s.employeeId === currentEmployee.id && s.month === currentMonth
  ) || {
    baseSalary: currentEmployee.monthlySalary || 0,
    bonus: currentEmployee.currentBonus || 0,
    otherEarnings: 0,
    grossSalary: (currentEmployee.monthlySalary || 0) + (currentEmployee.currentBonus || 0),
    totalDeductions: currentEmployee.currentDeductions || 0,
    netSalary: Math.max(0, (currentEmployee.monthlySalary || 0) + (currentEmployee.currentBonus || 0) - (currentEmployee.currentDeductions || 0)),
  };

  const currentKPI = kpiRecords.find(
    k => k.employeeId === currentEmployee.id && k.month === currentMonth
  );

  // Relevant tasks (assigned to this employee or 'All Team')
  const myTasks = companyTasks.filter(
    t => !t.assignedTo || t.assignedTo === 'All Team' || t.assignedTo === currentEmployee.fullName
  );
  const completedMyTasks = myTasks.filter(t => t.completed).length;
  const myTaskPct = myTasks.length > 0 ? Math.round((completedMyTasks / myTasks.length) * 100) : 0;

  const handleStartBreakSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startBreak(selectedBreakCategory, breakReason || `${selectedBreakCategory}`);
    setShowBreakModal(false);
    setBreakReason('');
  };

  const isCheckedIn = !!todayAtt?.checkInTime;
  const isCheckedOut = !!todayAtt?.checkOutTime;
  const isOnBreak = !!activeBreak;

  const workFormat = currentEmployee.employmentType || 'Full-time (Office)';

  return (
    <div className="space-y-6">
      
      {/* Top Bento Row: Hero Portrait Card + Working Format Gauge + Onboarding Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* 1. Hero Card with Translucent Badge (4 Cols) */}
        <div className="lg:col-span-3 relative h-[380px] rounded-3xl overflow-hidden shadow-xs group bg-[#141619]">
          {currentEmployee.profilePhoto ? (
            <img
              src={currentEmployee.profilePhoto}
              alt={currentEmployee.fullName}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-black text-white p-6 text-center">
              <div className="w-24 h-24 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center text-3xl font-black text-white mb-3">
                {currentEmployee.fullName.slice(0, 2).toUpperCase()}
              </div>
              <p className="text-xs text-slate-400 font-mono">{currentEmployee.department}</p>
            </div>
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />

          {/* Quick Edit Profile Button (Admin Only) */}
          {currentUser.role === 'admin' && (
            <button
              onClick={() => setShowProfileModal(true)}
              title="Edit Profile Picture & Information"
              className="absolute top-4 right-4 p-2.5 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md border border-white/30 text-white transition-all cursor-pointer shadow-md"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          )}

          {/* Floating Frosted Pill Badge at Bottom */}
          <div className="absolute bottom-4 inset-x-4 p-4 rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30 text-white shadow-lg">
            <h2 className="text-lg font-bold font-['Outfit'] tracking-tight leading-tight drop-shadow-xs">
              {currentEmployee.fullName}
            </h2>
            <div className="flex items-center justify-between mt-1">
              <p className="text-[10px] text-[#d6f932] uppercase font-mono font-bold tracking-wider truncate">
                {currentEmployee.designation || 'SPECIALIST'}
              </p>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-black/40 text-slate-200 font-mono">
                {currentEmployee.id}
              </span>
            </div>
          </div>
        </div>

        {/* 2. Working Format / Personal Shift Gauge (4 Cols) */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-white border border-slate-200/60 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-[#141619] font-['Outfit']">
                Working format & Shift
              </h3>
              <p className="text-[10px] text-slate-500 font-medium">{currentEmployee.department}</p>
            </div>
            <button
              onClick={() => setActiveTab('attendance')}
              className="text-slate-400 hover:text-black p-1.5 rounded-full hover:bg-slate-100 transition-colors"
            >
              <Clock className="w-4 h-4" />
            </button>
          </div>

          {/* Concentric Gauge Graphic */}
          <div className="flex flex-col items-center justify-center my-3 relative">
            <div className="relative w-44 h-44 flex items-center justify-center">
              {/* Outer Ring */}
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="44" stroke="#f1f5f9" strokeWidth="4" fill="none" />
                <circle cx="50" cy="50" r="44" stroke="#22d3ee" strokeWidth="4" strokeDasharray="276" strokeDashoffset={daysAttended > 0 ? "70" : "276"} strokeLinecap="round" fill="none" />
              </svg>
              {/* Middle Ring */}
              <svg className="absolute inset-0 w-full h-full -rotate-90 p-2.5" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" stroke="#f1f5f9" strokeWidth="4.5" fill="none" />
                <circle cx="50" cy="50" r="40" stroke="#84cc16" strokeWidth="4.5" strokeDasharray="251" strokeDashoffset={isCheckedIn ? "50" : "251"} strokeLinecap="round" fill="none" />
              </svg>
              {/* Inner Ring */}
              <svg className="absolute inset-0 w-full h-full -rotate-90 p-5" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="36" stroke="#f1f5f9" strokeWidth="5" fill="none" />
                <circle cx="50" cy="50" r="36" stroke="#c084fc" strokeWidth="5" strokeDasharray="226" strokeDashoffset={isOnBreak ? "40" : "226"} strokeLinecap="round" fill="none" />
              </svg>

              {/* Center Counter */}
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-[#141619] font-['Outfit'] leading-none">
                  {daysAttended}
                </span>
                <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-widest mt-0.5">
                  DAYS LOGGED
                </span>
              </div>
            </div>
          </div>

          {/* Shift Details Badge */}
          <div className="flex flex-col gap-1 text-[11px] font-bold text-slate-700 bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-mono text-[10px]">SCHEDULE:</span>
              <span className="font-mono text-xs text-slate-900 font-bold">
                {currentEmployee.shiftTiming || policy.shiftType || '06:00 PM – 03:00 AM PKT'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-mono text-[10px]">LOCATION:</span>
              <span className="text-slate-900">{currentEmployee.workLocation || 'Karachi RCM Operations Center'}</span>
            </div>
          </div>
        </div>

        {/* 3. My Operational Tasks & Checklist (5 Cols) */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-[#e3e1da] border border-[#d6d4cb] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-base font-extrabold text-[#141619] font-['Outfit']">
                  My Tasks & Milestones
                </h3>
                <p className="text-[10px] text-slate-600 font-medium">
                  {completedMyTasks} of {myTasks.length} tasks completed
                </p>
              </div>
              <span className="text-2xl font-black font-['Outfit'] text-[#141619]">
                {myTaskPct}%
              </span>
            </div>

            {/* Progress Track */}
            <div className="w-full h-1.5 bg-slate-300 rounded-full overflow-hidden mb-1">
              <div
                className="h-full bg-[#84cc16] rounded-full transition-all duration-500"
                style={{ width: `${myTaskPct}%` }}
              />
            </div>
            <div className="flex justify-between text-[9px] font-bold text-slate-500 mb-3">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>

            {/* Task Item List */}
            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
              {myTasks.length === 0 ? (
                <div className="py-6 text-center bg-white/50 rounded-2xl border border-dashed border-slate-300">
                  <p className="text-xs font-bold text-slate-600">No active tasks assigned</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Your operational checklist is up to date.</p>
                </div>
              ) : (
                myTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`flex items-center justify-between p-2.5 rounded-2xl transition-all ${
                      task.completed ? 'bg-white/40 opacity-75' : 'bg-white shadow-xs'
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0 pr-2">
                      <button
                        onClick={() => toggleCompanyTask(task.id)}
                        className={`w-5 h-5 rounded-full flex items-center justify-center border transition-colors cursor-pointer shrink-0 ${
                          task.completed
                            ? 'bg-black text-white border-black'
                            : 'border-slate-400 text-transparent hover:border-black'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <div className="truncate">
                        <p className={`text-[11px] font-extrabold tracking-wide font-mono leading-tight truncate ${
                          task.completed ? 'line-through text-slate-400' : 'text-[#141619]'
                        }`}>
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 text-[9px] font-bold text-slate-500 mt-0.5">
                          <span>{task.category}</span>
                          <span>•</span>
                          <span>{task.timeSlot || task.dueDate}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Middle Row: Live Time Clock & Break Controller Bar */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/60 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-base font-extrabold text-[#141619] font-['Outfit']">
              Live Shift Clock & Break Action
            </h4>
            <p className="text-xs text-slate-500">Record check-in, outside break duration, and shift checkout in real-time</p>
          </div>
          <span className="px-3 py-1 rounded-full bg-slate-100 text-xs font-mono font-bold text-slate-700">
            {todayAtt?.date || new Date().toISOString().split('T')[0]}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => checkIn()}
            disabled={isCheckedIn}
            className={`py-3 px-4 rounded-2xl font-bold text-xs flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
              isCheckedIn
                ? todayAtt?.isLate
                  ? 'bg-rose-50 text-rose-800 border border-rose-200'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-black text-white hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className={`w-4 h-4 ${isCheckedIn ? (todayAtt?.isLate ? 'text-rose-600' : 'text-emerald-600') : 'text-[#d6f932]'}`} />
              <span>{isCheckedIn ? 'Checked In' : 'Punch Check-In'}</span>
            </div>
            {isCheckedIn && (
              <span className="text-[10px] font-mono">
                {formatTimeTo12HourWithTimezone(todayAtt?.checkInTime || '')}
                {todayAtt?.isLate && ` (Late +${todayAtt.lateMinutes}m)`}
              </span>
            )}
          </button>

          <button
            onClick={() => setShowBreakModal(true)}
            disabled={!isCheckedIn || isCheckedOut || isOnBreak}
            className={`py-3 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              !isCheckedIn || isCheckedOut || isOnBreak
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300'
            }`}
          >
            <Coffee className="w-4 h-4 text-amber-600" />
            <span>Start Break</span>
          </button>

          <button
            onClick={() => endBreak()}
            disabled={!isOnBreak}
            className={`py-3 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              !isOnBreak
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-[#d6f932] text-black font-extrabold hover:bg-lime-400 animate-pulse'
            }`}
          >
            <Timer className="w-4 h-4" />
            <span>End Break</span>
          </button>

          <button
            onClick={() => checkOut()}
            disabled={!isCheckedIn || isCheckedOut}
            className={`py-3 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              !isCheckedIn || isCheckedOut
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
            }`}
          >
            <Square className="w-4 h-4 text-rose-600" />
            <span>Check Out ({todayAtt?.checkOutTime || 'End'})</span>
          </button>
        </div>
      </div>

      {/* Bottom Bento Row: 5 Stats Cards linked to real employee metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Card 1: Days Attended */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/60 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-3xl font-black font-['Outfit'] text-[#141619]">
              {daysAttended}
            </span>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-1">
              DAYS ATTENDED THIS MONTH
            </p>
            <p className="text-[9px] font-bold text-slate-600 mt-0.5">
              {lateCount} LATE ARRIVALS
            </p>
          </div>

          <button
            onClick={() => setActiveTab('attendance')}
            className="w-full py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-900 text-[10px] font-extrabold uppercase tracking-wider shadow-xs mt-4 cursor-pointer"
          >
            MY ATTENDANCE
          </button>
        </div>

        {/* Card 2: Probation Status */}
        <div className="p-5 rounded-3xl bg-[#fbf5e6] border border-[#f2ead3] shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-lg font-black font-['Outfit'] text-[#141619] block truncate">
              {currentEmployee.probationStatus || 'Probation'}
            </span>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-700 mt-1">
              EVALUATION STATUS
            </p>
            <p className="text-[9px] font-bold text-slate-500 mt-0.5">
              Ends: {currentEmployee.probationEndDate || 'In Evaluation'}
            </p>
          </div>

          <button
            onClick={() => setActiveTab('profile')}
            className="w-full py-2 rounded-full bg-white hover:bg-slate-50 text-slate-900 text-[10px] font-extrabold uppercase tracking-wider shadow-xs mt-4 cursor-pointer"
          >
            VIEW PROFILE
          </button>
        </div>

        {/* Card 3: Performance KPI Score */}
        <div className="p-5 rounded-3xl bg-[#e3e1da] border border-[#d6d4cb] shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-3xl font-black font-['Outfit'] text-[#141619]">
              {currentKPI ? `${currentKPI.kpiScore}%` : 'Pending'}
            </span>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-700 mt-1">
              KPI PERFORMANCE
            </p>
            <p className="text-[9px] font-bold text-slate-500 mt-0.5">
              {currentKPI?.performanceRemarks || 'Monthly Review in progress'}
            </p>
          </div>

          <button
            onClick={() => setActiveTab('kpi')}
            className="w-full py-2 rounded-full bg-white hover:bg-slate-50 text-slate-900 text-[10px] font-extrabold uppercase tracking-wider shadow-xs mt-4 cursor-pointer"
          >
            KPI & BONUS
          </button>
        </div>

        {/* Card 4: Deductions & Adjustments */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-[#cfd6df] via-[#e6eae4] to-[#d5dbd3] border border-white/60 shadow-xs flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-mono font-bold text-slate-700 uppercase">DEDUCTIONS</span>
            <Sparkles className="w-4 h-4 text-slate-500" />
          </div>

          <div className="text-center my-2">
            <span className="text-2xl font-black font-['Outfit'] text-red-600">
              -{currentSalary.totalDeductions.toLocaleString()} <span className="text-xs font-bold text-slate-700">RS</span>
            </span>
            <p className="text-[9px] font-bold text-slate-700 mt-0.5 uppercase tracking-wide">
              {currentSalary.totalDeductions > 0 ? 'Applied Adjustments' : 'Zero Deductions'}
            </p>
          </div>

          <button
            onClick={() => setActiveTab('salary')}
            className="w-full py-1.5 rounded-full bg-white/90 hover:bg-white text-slate-900 text-[10px] font-extrabold uppercase tracking-wider shadow-xs cursor-pointer text-center"
          >
            VIEW DEDUCTIONS
          </button>
        </div>

        {/* Card 5: Payslips Portal */}
        <div className="p-5 rounded-3xl bg-[#141619] text-white border border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <DollarSign className="w-5 h-5 text-[#d6f932]" />
              <span className="text-[9px] font-mono uppercase text-slate-400">SLIPS</span>
            </div>
            <h4 className="text-base font-extrabold font-['Outfit'] text-white mt-2">
              Monthly Payslips
            </h4>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Verified salary disbursements
            </p>
          </div>

          <button
            onClick={() => setActiveTab('payslips')}
            className="w-full py-2 rounded-full bg-[#d6f932] hover:bg-lime-400 text-black text-[10px] font-extrabold uppercase tracking-wider shadow-xs mt-4 cursor-pointer transition-colors"
          >
            VIEW PAYSLIP
          </button>
        </div>

      </div>

      {/* Break Category Modal */}
      {showBreakModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white border border-slate-200 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2">
              <Coffee className="w-5 h-5 text-amber-600" />
              <h3 className="text-base font-extrabold text-slate-900 font-['Outfit']">
                Start Break / Workstation Absence
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              Select the purpose of your break to log outside-time per company attendance policy.
            </p>

            <form onSubmit={handleStartBreakSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Break Category
                </label>
                <select
                  value={selectedBreakCategory}
                  onChange={e => setSelectedBreakCategory(e.target.value as BreakCategory)}
                  className="w-full p-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-black"
                >
                  <option value="Lunch / Dinner Break">Dinner / Lunch Break (Max 45m)</option>
                  <option value="Tea / Coffee Break">Tea / Coffee Break (Max 15m)</option>
                  <option value="Workstation Rest">Workstation Rest / Stretch</option>
                  <option value="Emergency / Outside">Emergency / Urgent Outside</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Optional Reason / Location
                </label>
                <input
                  type="text"
                  value={breakReason}
                  onChange={e => setBreakReason(e.target.value)}
                  placeholder="e.g. Cafeteria dinner / Restroom"
                  className="w-full p-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-black"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBreakModal(false)}
                  className="px-4 py-2 rounded-full bg-slate-100 text-xs font-semibold text-slate-700 hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-full bg-black text-xs font-bold text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Start Break Timer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Profile Edit Modal with Computer File Upload & Presets */}
      <ProfileEditModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </div>
  );
};
