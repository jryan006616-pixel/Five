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
  MoreVertical,
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

  const isCheckedIn = !!todayAtt?.checkInTime;
  const isCheckedOut = !!todayAtt?.checkOutTime;
  const isOnBreak = !!activeBreak;

  return (
    <div className="space-y-6">
      
      {/* Top Bento Row: Hero Portrait Card + Working Format Gauge + Onboarding Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* 1. Hero Card with Translucent Badge (4 Cols) */}
        <div className="lg:col-span-3 relative h-[380px] rounded-3xl overflow-hidden shadow-sm group">
          <img
            src={currentEmployee.profilePhoto || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop"}
            alt={currentEmployee.fullName}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

          {/* Floating Frosted Pill Badge at Bottom */}
          <div className="absolute bottom-4 inset-x-4 p-4 rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30 text-white shadow-lg">
            <h2 className="text-lg font-bold font-['Outfit'] tracking-tight leading-tight drop-shadow-sm">
              {currentEmployee.fullName}
            </h2>
            <p className="text-[11px] text-white/90 uppercase font-mono font-bold tracking-wider mt-0.5">
              {currentEmployee.designation || 'UX DESIGNER'}
            </p>
          </div>
        </div>

        {/* 2. Working Format / Shift Attendance Donut Gauge (4 Cols) */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-white border border-slate-200/60 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-[#141619] font-['Outfit']">
              Working format
            </h3>
            <button className="text-slate-400 hover:text-black">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>

          {/* Concentric Gauge Graphic */}
          <div className="flex flex-col items-center justify-center my-3 relative">
            <div className="relative w-44 h-44 flex items-center justify-center">
              {/* Ring 1 (Outer Cyan) */}
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="44" stroke="#f1f5f9" strokeWidth="4" fill="none" />
                <circle cx="50" cy="50" r="44" stroke="#22d3ee" strokeWidth="4" strokeDasharray="276" strokeDashoffset="60" strokeLinecap="round" fill="none" />
              </svg>
              {/* Ring 2 (Middle Lime) */}
              <svg className="absolute inset-0 w-full h-full -rotate-90 p-2.5" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" stroke="#f1f5f9" strokeWidth="4.5" fill="none" />
                <circle cx="50" cy="50" r="40" stroke="#84cc16" strokeWidth="4.5" strokeDasharray="251" strokeDashoffset="75" strokeLinecap="round" fill="none" />
              </svg>
              {/* Ring 3 (Inner Violet) */}
              <svg className="absolute inset-0 w-full h-full -rotate-90 p-5" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="36" stroke="#f1f5f9" strokeWidth="5" fill="none" />
                <circle cx="50" cy="50" r="36" stroke="#c084fc" strokeWidth="5" strokeDasharray="226" strokeDashoffset="120" strokeLinecap="round" fill="none" />
              </svg>

              {/* Center Counter */}
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-[#141619] font-['Outfit'] leading-none">
                  500
                </span>
                <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-widest mt-0.5">
                  DAYS
                </span>
              </div>
            </div>
          </div>

          {/* Legend Pills */}
          <div className="flex items-center justify-center gap-4 text-[11px] font-bold text-slate-600">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#22d3ee]"></span>
              <span>50% OFFICE</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#84cc16]"></span>
              <span>30% HYBRID</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#c084fc]"></span>
              <span>20% REMOTE</span>
            </div>
          </div>
        </div>

        {/* 3. Onboarding Tasks & Activity Checklist (5 Cols) */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-[#e3e1da] border border-[#d6d4cb] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-extrabold text-[#141619] font-['Outfit']">
                Onboarding tasks
              </h3>
              <span className="text-2xl font-black font-['Outfit'] text-[#141619]">
                98%
              </span>
            </div>

            {/* Progress Track */}
            <div className="w-full h-1.5 bg-slate-300 rounded-full overflow-hidden mb-1">
              <div className="h-full bg-[#84cc16] rounded-full w-[98%]" />
            </div>
            <div className="flex justify-between text-[9px] font-bold text-slate-500 mb-4">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>

            {/* Task Item List */}
            <div className="space-y-2.5">
              {[
                {
                  title: 'ONBOARDING SESSION',
                  time: 'MON, FEB 3 | 10:00 AM',
                  img: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=200&auto=format&fit=crop',
                  checked: true,
                },
                {
                  title: 'PAYER ADJUDICATION SYNC',
                  time: 'MON, FEB 3 | 14:30 PM',
                  img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
                  checked: true,
                },
                {
                  title: 'CLAIM QUALITY REVIEW',
                  time: 'MON, FEB 3 | 16:00 PM',
                  img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
                  checked: false,
                },
              ].map((task, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-2xl bg-white/60 hover:bg-white transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={task.img}
                      alt={task.title}
                      className="w-8 h-8 rounded-xl object-cover"
                    />
                    <div>
                      <p className="text-[11px] font-extrabold text-[#141619] tracking-wide font-mono leading-tight">
                        {task.title}
                      </p>
                      <p className="text-[9px] font-bold text-slate-500">
                        {task.time}
                      </p>
                    </div>
                  </div>

                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                      task.checked
                        ? 'bg-black text-white border-black'
                        : 'border-slate-400 text-transparent'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Middle Row: Schedule / Timeline Strip Card */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/60 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <button className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 cursor-pointer">
            &lt; JANUARY
          </button>
          <h3 className="text-lg font-black font-['Outfit'] text-[#141619] tracking-tight">
            February 2025
          </h3>
          <button className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 cursor-pointer">
            MARCH &gt;
          </button>
        </div>

        {/* Mini Day Timeline Header */}
        <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-black uppercase tracking-wider text-slate-500 py-2 border-b border-slate-100">
          <span>MON, 3</span>
          <span>TUE, 4</span>
          <span>WED, 5</span>
          <span>THU, 6</span>
          <span>FRI, 7</span>
          <span>SAT, 8</span>
          <span>SUN, 9</span>
        </div>

        {/* Live Shifts Strip */}
        <div className="py-4 space-y-3">
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-bold font-mono text-slate-400 w-16">10:00 AM</span>
            <div className="flex-1 p-2.5 rounded-full bg-black text-white text-xs font-bold flex items-center justify-between px-5 shadow-sm">
              <span className="font-mono text-[11px] tracking-wider">ONBOARDING SESSION</span>
              <div className="flex -space-x-1.5">
                <img className="w-5 h-5 rounded-full border border-black object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100" />
                <img className="w-5 h-5 rounded-full border border-black object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-[10px] font-bold font-mono text-slate-400 w-16">12:00 PM</span>
            <div className="flex-1 p-2.5 rounded-full bg-[#202227] text-white text-xs font-bold flex items-center justify-between px-5 shadow-sm ml-20">
              <span className="font-mono text-[11px] tracking-wider text-[#d6f932]">TEAM SYNC & CLAIM AUDIT</span>
              <div className="flex -space-x-1.5">
                <img className="w-5 h-5 rounded-full border border-black object-cover" src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=100" />
                <img className="w-5 h-5 rounded-full border border-black object-cover" src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=100" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bento Row: 5 Stats Cards exactly like reference image */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Card 1: 500 Days / Headcount (White Card) */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/60 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-3xl font-black font-['Outfit'] text-[#141619]">
              500
            </span>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-1">
              DAYS IN THE COMPANY
            </p>
            <p className="text-[9px] font-bold text-emerald-600 mt-0.5">
              +8% LAST MONTH
            </p>
          </div>

          <div className="mt-4">
            <div className="w-full h-1.5 rounded-full bg-gradient-to-r from-cyan-400 via-lime-400 to-amber-400 mb-1" />
            <div className="flex justify-between text-[9px] font-bold font-mono text-slate-400">
              <span>0</span>
              <span>250</span>
              <span>500</span>
            </div>
          </div>
        </div>

        {/* Card 2: 38 Completed Projects (Butter Card) */}
        <div className="p-5 rounded-3xl bg-[#fbf5e6] border border-[#f2ead3] shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-3xl font-black font-['Outfit'] text-[#141619]">
              38
            </span>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-700 mt-1">
              COMPLETED PROJECTS
            </p>
            <p className="text-[9px] font-bold text-slate-500 mt-0.5">
              +4 LAST MONTH
            </p>
          </div>

          <button
            onClick={() => setActiveTab('attendance')}
            className="w-full py-2 rounded-full bg-white hover:bg-slate-50 text-slate-900 text-[10px] font-extrabold uppercase tracking-wider shadow-xs mt-4 cursor-pointer"
          >
            VIEW ALL
          </button>
        </div>

        {/* Card 3: 8 Projects in Progress (Soft Stone Gray Card) */}
        <div className="p-5 rounded-3xl bg-[#e3e1da] border border-[#d6d4cb] shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-3xl font-black font-['Outfit'] text-[#141619]">
              8
            </span>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-700 mt-1">
              PROJECTS IN PROGRESS
            </p>
            <p className="text-[9px] font-bold text-slate-500 mt-0.5">
              +3 LAST MONTH
            </p>
          </div>

          <button
            onClick={() => setActiveTab('kpi')}
            className="w-full py-2 rounded-full bg-white hover:bg-slate-50 text-slate-900 text-[10px] font-extrabold uppercase tracking-wider shadow-xs mt-4 cursor-pointer"
          >
            VIEW ALL
          </button>
        </div>

        {/* Card 4: $6,110 Salary / Metallic Gradient Card with 4-Point Star */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-[#cfd6df] via-[#e6eae4] to-[#d5dbd3] border border-white/60 shadow-xs flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-transparent">.</span>
            <Sparkles className="w-5 h-5 text-slate-400" />
          </div>

          <div className="text-center my-2">
            <span className="text-2xl font-black font-['Outfit'] text-[#141619]">
              ${(currentSalary.netSalary / 280).toFixed(0).toLocaleString()}
            </span>
            <p className="text-[9px] font-bold text-slate-700 mt-0.5">
              +40% LAST MONTH
            </p>
          </div>

          <span className="text-center text-[9px] font-bold uppercase tracking-widest text-slate-500">
            SALARY & PAYOUT
          </span>
        </div>

        {/* Card 5: Personal Data / Office Space Photo Card */}
        <div className="relative rounded-3xl overflow-hidden shadow-xs h-[140px] group">
          <img
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=400&auto=format&fit=crop"
            alt="Office workspace"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-black/30 pointer-events-none" />
          
          <button
            onClick={() => setActiveTab('salary')}
            className="absolute bottom-3 inset-x-3 py-1.5 rounded-full bg-white/90 hover:bg-white text-slate-900 text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-md shadow-md cursor-pointer text-center"
          >
            PERSONAL DATA
          </button>
        </div>

      </div>

      {/* Live Time Clock & Break Controller Bar */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/60 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-base font-extrabold text-[#141619] font-['Outfit']">
              Live Shift Clock & Break Action
            </h4>
            <p className="text-xs text-slate-500">Record check-in, outside break duration, and shift checkout</p>
          </div>
          <span className="px-3 py-1 rounded-full bg-slate-100 text-xs font-mono font-bold text-slate-700">
            {todayAtt?.date || '2026-08-20'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => checkIn()}
            disabled={isCheckedIn}
            className={`py-3 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              isCheckedIn
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-black text-white hover:bg-slate-800'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-[#d6f932]" />
            <span>Check In ({todayAtt?.checkInTime || 'Start'})</span>
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
                >
                </input>
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
    </div>
  );
};

