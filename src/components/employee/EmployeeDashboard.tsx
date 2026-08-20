import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BreakCategory } from '../../types';
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
    getTodayAttendance,
    getActiveBreak,
    checkIn,
    startBreak,
    endBreak,
    checkOut,
    setActiveTab,
    setSelectedPayslipForModal,
    payslips,
  } = useApp();

  const [selectedBreakCategory, setSelectedBreakCategory] = useState<BreakCategory>('Lunch / Dinner Break');
  const [breakReason, setBreakReason] = useState('');
  const [showBreakModal, setShowBreakModal] = useState(false);

  if (!currentUser || !currentEmployee) return null;

  const todayAtt = getTodayAttendance(currentEmployee.id);
  const activeBreak = getActiveBreak(currentEmployee.id);

  // Current month stats
  const currentMonth = 'August 2026';
  const currentSalary = salaryRecords.find(
    s => s.employeeId === currentEmployee.id && s.month === currentMonth
  ) || {
    baseSalary: currentEmployee.monthlySalary,
    bonus: currentEmployee.currentBonus,
    otherEarnings: 5000,
    grossSalary: currentEmployee.monthlySalary + currentEmployee.currentBonus + 5000,
    totalDeductions: currentEmployee.currentDeductions,
    netSalary: currentEmployee.monthlySalary + currentEmployee.currentBonus + 5000 - currentEmployee.currentDeductions,
  };

  const currentKPI = kpiRecords.find(
    k => k.employeeId === currentEmployee.id && k.month === currentMonth
  );

  const employeeDeductions = deductions.filter(
    d => d.employeeId === currentEmployee.id && d.month === currentMonth && d.status === 'Applied'
  );

  const handleStartBreakSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startBreak(selectedBreakCategory, breakReason || `${selectedBreakCategory}`);
    setShowBreakModal(false);
    setBreakReason('');
  };

  // Recent attendance entries for Tariq or active user
  const userAttendanceHistory = attendanceRecords
    .filter(a => a.employeeId === currentEmployee.id)
    .slice(0, 5);

  const isCheckedIn = !!todayAtt?.checkInTime;
  const isCheckedOut = !!todayAtt?.checkOutTime;
  const isOnBreak = !!activeBreak;

  return (
    <div className="space-y-6">
      
      {/* 1. Futuristic Hero Greeting & "How am I doing today" Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0d1b2a] via-[#0f2744] to-[#0a192f] p-6 border border-cyan-500/30 shadow-xl shadow-cyan-950/20">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={currentEmployee.profilePhoto}
              alt={currentEmployee.fullName}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-cyan-400/60 shadow-md shadow-cyan-500/20"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold tracking-wider text-cyan-400 uppercase font-mono">
                  {currentEmployee.id}
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                  {currentEmployee.employmentStatus}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold font-['Space_Grotesk'] text-white">
                Good Evening, {currentEmployee.fullName.split(' ')[0]} 👋
              </h1>
              <p className="text-xs text-slate-300">
                {currentEmployee.designation} • <strong className="text-cyan-300">{currentEmployee.department}</strong>
              </p>
            </div>
          </div>

          {/* Quick Summary Pill Banner */}
          <div className="flex flex-wrap items-center gap-2.5 p-3 rounded-xl bg-slate-900/80 border border-slate-700/60 text-xs">
            <div className="px-2.5 py-1 rounded-lg bg-slate-800/80">
              <span className="text-[10px] text-slate-400 block">Today's Shift</span>
              <span className="font-semibold text-emerald-400">
                {isCheckedOut ? 'Completed' : isCheckedIn ? (isOnBreak ? '☕ On Break' : '🟢 Active Duty') : '⚪ Not Checked In'}
              </span>
            </div>
            <div className="px-2.5 py-1 rounded-lg bg-slate-800/80">
              <span className="text-[10px] text-slate-400 block">Expected Take-Home</span>
              <span className="font-mono font-bold text-white">
                {currentSalary.netSalary.toLocaleString()} RS
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Interactive Punch Card & Live Working Hours Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Live Shift & Break Tracker */}
        <div className="lg:col-span-2 rounded-2xl bg-[#0c121e] border border-slate-800 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-cyan-400" />
              <h2 className="text-base font-bold text-white font-['Space_Grotesk']">
                Today's Attendance & Time Tracker
              </h2>
            </div>
            <span className="text-xs font-mono text-slate-400">Date: 2026-08-20</span>
          </div>

          {/* Punch Actions Action Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Check In */}
            <button
              onClick={() => checkIn()}
              disabled={isCheckedIn}
              className={`flex flex-col items-center justify-center p-3.5 rounded-xl border text-xs font-semibold transition-all ${
                isCheckedIn
                  ? 'bg-slate-900/50 border-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-b from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 border-emerald-500 text-white shadow-lg shadow-emerald-950/40 cursor-pointer'
              }`}
            >
              <CheckCircle2 className="w-5 h-5 mb-1 text-emerald-300" />
              <span>Check In</span>
              <span className="text-[10px] font-normal opacity-80 mt-0.5">
                {todayAtt?.checkInTime || 'Start Shift'}
              </span>
            </button>

            {/* Start Break */}
            <button
              onClick={() => setShowBreakModal(true)}
              disabled={!isCheckedIn || isCheckedOut || isOnBreak}
              className={`flex flex-col items-center justify-center p-3.5 rounded-xl border text-xs font-semibold transition-all ${
                !isCheckedIn || isCheckedOut || isOnBreak
                  ? 'bg-slate-900/50 border-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-b from-amber-600 to-orange-700 hover:from-amber-500 hover:to-orange-600 border-amber-500 text-white shadow-lg shadow-amber-950/40 cursor-pointer'
              }`}
            >
              <Coffee className="w-5 h-5 mb-1 text-amber-300" />
              <span>Start Break</span>
              <span className="text-[10px] font-normal opacity-80 mt-0.5">Outside Time</span>
            </button>

            {/* End Break */}
            <button
              onClick={() => endBreak()}
              disabled={!isOnBreak}
              className={`flex flex-col items-center justify-center p-3.5 rounded-xl border text-xs font-semibold transition-all ${
                !isOnBreak
                  ? 'bg-slate-900/50 border-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-b from-cyan-600 to-sky-700 hover:from-cyan-500 hover:to-sky-600 border-cyan-400 text-white shadow-lg shadow-cyan-950/50 animate-pulse cursor-pointer'
              }`}
            >
              <Timer className="w-5 h-5 mb-1 text-cyan-200" />
              <span>End Break</span>
              <span className="text-[10px] font-normal opacity-90 mt-0.5">Return to Desk</span>
            </button>

            {/* Check Out */}
            <button
              onClick={() => checkOut()}
              disabled={!isCheckedIn || isCheckedOut}
              className={`flex flex-col items-center justify-center p-3.5 rounded-xl border text-xs font-semibold transition-all ${
                !isCheckedIn || isCheckedOut
                  ? 'bg-slate-900/50 border-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-b from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 border-rose-500 text-white shadow-lg shadow-rose-950/40 cursor-pointer'
              }`}
            >
              <Square className="w-5 h-5 mb-1 text-rose-300" />
              <span>Check Out</span>
              <span className="text-[10px] font-normal opacity-80 mt-0.5">
                {todayAtt?.checkOutTime || 'End Shift'}
              </span>
            </button>
          </div>

          {/* Today's Punch Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
            <div>
              <span className="text-[11px] text-slate-400 block">Check In Time</span>
              <span className="font-mono font-bold text-white text-sm">
                {todayAtt?.checkInTime || '--:--'}
              </span>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 block">Total Break Time</span>
              <span className="font-mono font-bold text-amber-400 text-sm">
                {todayAtt ? `${todayAtt.totalBreakMinutes} mins` : '0 mins'}
              </span>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 block">Check Out Time</span>
              <span className="font-mono font-bold text-slate-300 text-sm">
                {todayAtt?.checkOutTime || (isCheckedIn ? 'In Progress' : '--:--')}
              </span>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 block">Today's Net Hours</span>
              <span className="font-mono font-bold text-cyan-400 text-sm">
                {todayAtt ? `${(todayAtt.totalWorkingMinutes / 60).toFixed(1)} hrs` : '0.0 hrs'}
              </span>
            </div>
          </div>

          {/* Active Break Banner if currently on break */}
          {isOnBreak && (
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-amber-950/60 border border-amber-700/60 text-xs">
              <div className="flex items-center gap-2.5">
                <Coffee className="w-5 h-5 text-amber-400 animate-bounce" />
                <div>
                  <p className="font-bold text-amber-200">
                    Currently Outside Workstation ({activeBreak?.category})
                  </p>
                  <p className="text-[11px] text-amber-300/80">
                    Started at {activeBreak?.startTime}. Max allowed per policy: {policy.maxSingleBreakMinutes} mins.
                  </p>
                </div>
              </div>
              <button
                onClick={() => endBreak()}
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors"
              >
                Mark Return
              </button>
            </div>
          )}
        </div>

        {/* Right 1 Col: This Month's Compensation Snapshot */}
        <div className="rounded-2xl bg-[#0c121e] border border-slate-800 p-6 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white font-['Space_Grotesk']">
                  This Month's Salary (August)
                </h3>
              </div>
              <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold">PKR / RS</span>
            </div>

            <div className="py-3 space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Base Monthly Salary:</span>
                <span className="font-mono font-semibold text-white">
                  {currentSalary.baseSalary.toLocaleString()} RS
                </span>
              </div>

              <div className="flex justify-between text-slate-300">
                <span className="flex items-center gap-1">
                  <span>Performance Bonus:</span>
                  <span className="text-[10px] text-emerald-400 font-semibold">({currentKPI?.kpiScore || 94}% KPI)</span>
                </span>
                <span className="font-mono font-semibold text-emerald-400">
                  +{currentSalary.bonus.toLocaleString()} RS
                </span>
              </div>

              <div className="flex justify-between text-slate-300">
                <span>Shift Differential:</span>
                <span className="font-mono font-semibold text-sky-400">
                  +{(currentSalary.otherEarnings || 5000).toLocaleString()} RS
                </span>
              </div>

              <div className="flex justify-between text-slate-300">
                <span className="flex items-center gap-1">
                  <span>Itemized Deductions:</span>
                  {employeeDeductions.length > 0 && (
                    <span className="text-[10px] text-red-400 font-semibold">({employeeDeductions.length})</span>
                  )}
                </span>
                <span className="font-mono font-semibold text-red-400">
                  -{currentSalary.totalDeductions.toLocaleString()} RS
                </span>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Expected Net Payout
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-bold font-mono text-emerald-400">
                {currentSalary.netSalary.toLocaleString()} <span className="text-xs text-slate-400">RS</span>
              </span>
              <button
                onClick={() => setActiveTab('salary')}
                className="text-xs text-cyan-400 hover:underline flex items-center gap-0.5"
              >
                <span>Breakdown</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Bottom 2 Columns: KPI Performance Card & Recent Attendance History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* KPI & Quality Performance */}
        <div className="rounded-2xl bg-[#0c121e] border border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-bold text-white font-['Space_Grotesk']">
                My Performance & KPI (August 2026)
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('kpi')}
              className="text-xs text-cyan-400 hover:underline flex items-center gap-0.5"
            >
              <span>View History</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {currentKPI ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Overall KPI Score</span>
                  <div className="text-2xl font-bold font-mono text-cyan-400">
                    {currentKPI.kpiScore}%
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Approved Bonus</span>
                  <div className="text-xl font-bold font-mono text-emerald-400">
                    +{currentKPI.bonusAmount.toLocaleString()} RS
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs">
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Supervisor Remarks</span>
                <p className="text-slate-300 mt-1 leading-relaxed italic">
                  "{currentKPI.performanceRemarks}"
                </p>
                <div className="mt-2 text-[10px] text-slate-500">
                  Reviewed by: <strong>{currentKPI.reviewedBy}</strong> on {currentKPI.reviewedDate}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-slate-500">
              No KPI evaluation recorded for this cycle yet.
            </div>
          )}
        </div>

        {/* Recent Attendance Log */}
        <div className="rounded-2xl bg-[#0c121e] border border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-sky-400" />
              <h3 className="text-sm font-bold text-white font-['Space_Grotesk']">
                Recent Attendance History
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('attendance')}
              className="text-xs text-cyan-400 hover:underline flex items-center gap-0.5"
            >
              <span>Full Log</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-800/70 text-xs">
            {userAttendanceHistory.map(att => (
              <div key={att.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="font-mono font-medium text-slate-200">{att.date}</span>
                  <p className="text-[11px] text-slate-400">
                    In: {att.checkInTime || '--'} | Out: {att.checkOutTime || 'Active'} | Break: {att.totalBreakMinutes}m
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase ${
                      att.status === 'Present'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                        : att.status === 'Late'
                        ? 'bg-amber-950 text-amber-300 border border-amber-800/60'
                        : 'bg-red-950 text-red-300 border border-red-800/60'
                    }`}
                  >
                    {att.status}
                  </span>
                  <span className="block font-mono text-[11px] text-cyan-400 font-semibold mt-0.5">
                    {(att.totalWorkingMinutes / 60).toFixed(1)} hrs
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Break Category Modal */}
      {showBreakModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2">
              <Coffee className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold text-white font-['Space_Grotesk']">
                Start Break / Workstation Absence
              </h3>
            </div>
            <p className="text-xs text-slate-400">
              Select the purpose of your break to log outside-time per company attendance policy.
            </p>

            <form onSubmit={handleStartBreakSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Break Category
                </label>
                <select
                  value={selectedBreakCategory}
                  onChange={e => setSelectedBreakCategory(e.target.value as BreakCategory)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="Lunch / Dinner Break">Dinner / Lunch Break (Max 45m)</option>
                  <option value="Tea / Coffee Break">Tea / Coffee Break (Max 15m)</option>
                  <option value="Workstation Rest">Workstation Rest / Stretch</option>
                  <option value="Emergency / Outside">Emergency / Urgent Outside</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Optional Reason / Location
                </label>
                <input
                  type="text"
                  value={breakReason}
                  onChange={e => setBreakReason(e.target.value)}
                  placeholder="e.g. Cafeteria dinner / Restroom"
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBreakModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-xs font-bold text-white transition-colors"
                >
                  Start Break Timer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
