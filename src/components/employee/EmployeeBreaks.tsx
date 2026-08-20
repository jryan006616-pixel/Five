import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { BreakCategory } from '../../types';
import {
  Coffee,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Timer,
  Play,
  Square,
  Sparkles,
} from 'lucide-react';

export const EmployeeBreaks: React.FC = () => {
  const {
    currentEmployee,
    attendanceRecords,
    policy,
    getTodayAttendance,
    getActiveBreak,
    startBreak,
    endBreak,
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<BreakCategory>('Lunch / Dinner Break');
  const [breakReason, setBreakReason] = useState('');

  if (!currentEmployee) return null;

  const todayAtt = getTodayAttendance(currentEmployee.id);
  const activeBreak = getActiveBreak(currentEmployee.id);
  const isCheckedIn = !!todayAtt?.checkInTime;
  const isCheckedOut = !!todayAtt?.checkOutTime;
  const isOnBreak = !!activeBreak;

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    startBreak(selectedCategory, breakReason || `${selectedCategory}`);
    setBreakReason('');
  };

  // All breaks for current employee across all dates
  const allUserBreaks = attendanceRecords
    .filter(a => a.employeeId === currentEmployee.id)
    .flatMap(a => a.breaks)
    .sort((a, b) => b.date.localeCompare(a.date));

  const totalHistoricalBreaks = allUserBreaks.length;
  const flaggedBreaksCount = allUserBreaks.filter(b => b.flaggedExcessive).length;
  const avgBreakDuration = totalHistoricalBreaks
    ? Math.round(allUserBreaks.reduce((acc, b) => acc + (b.durationMinutes || 0), 0) / totalHistoricalBreaks)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-[#0c121e] border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Coffee className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl font-bold font-['Space_Grotesk'] text-white">
              Workstation & Outside Time Tracking
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Compliant workstation absence logging per Rhinomds RCM Policy. (Max single break: {policy.maxSingleBreakMinutes} mins).
          </p>
        </div>

        {/* Live Break Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs">
          <span className="text-slate-400">Current Status:</span>
          <span className={`font-bold ${isOnBreak ? 'text-amber-400 animate-pulse' : 'text-emerald-400'}`}>
            {isOnBreak ? '☕ Currently on Break' : '🟢 At Workstation'}
          </span>
        </div>
      </div>

      {/* Break Action Console */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Break Punch Controls */}
        <div className="lg:col-span-2 rounded-2xl bg-[#0c121e] border border-slate-800 p-6 space-y-4">
          <h2 className="text-sm font-bold text-white font-['Space_Grotesk'] flex items-center gap-2">
            <Timer className="w-4 h-4 text-cyan-400" />
            <span>Break Controls</span>
          </h2>

          {!isCheckedIn ? (
            <div className="p-8 text-center bg-slate-950/60 rounded-xl border border-slate-800 text-slate-400 text-xs space-y-2">
              <Clock className="w-8 h-8 mx-auto text-slate-600 mb-2" />
              <p className="font-semibold text-slate-300">You must check in for today's shift before starting a break.</p>
              <p className="text-[11px] text-slate-500">Go to your Dashboard to check in.</p>
            </div>
          ) : isCheckedOut ? (
            <div className="p-8 text-center bg-slate-950/60 rounded-xl border border-slate-800 text-slate-400 text-xs">
              Today's shift is checked out and complete.
            </div>
          ) : isOnBreak ? (
            <div className="p-6 rounded-xl bg-gradient-to-r from-amber-950/80 to-orange-950/60 border border-amber-600/70 text-slate-100 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                    <Coffee className="w-6 h-6 text-amber-400 animate-bounce" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">{activeBreak?.category}</h3>
                    <p className="text-xs text-amber-200/80">Started at {activeBreak?.startTime}</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/30 text-amber-300 border border-amber-500/50">
                  Timer Active
                </span>
              </div>

              <div className="p-3 rounded-lg bg-black/40 text-xs space-y-1">
                <p className="text-amber-200">
                  ⚠️ <strong>Policy Notice:</strong> Dinner/Lunch breaks are capped at <strong>{policy.maxSingleBreakMinutes} minutes</strong>. Excessive outside time will be logged for supervisor review.
                </p>
              </div>

              <button
                onClick={() => endBreak()}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white font-bold text-xs shadow-lg shadow-cyan-950/50 transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>I've Returned to Desk (End Break)</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleStart} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Break Type
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={e => setSelectedCategory(e.target.value as BreakCategory)}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="Lunch / Dinner Break">Lunch / Dinner Break (Max 45m)</option>
                    <option value="Tea / Coffee Break">Tea / Coffee Break (Max 15m)</option>
                    <option value="Workstation Rest">Workstation Rest / Eye Break</option>
                    <option value="Emergency / Outside">Emergency / Personal Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Optional Reason / Remarks
                  </label>
                  <input
                    type="text"
                    value={breakReason}
                    onChange={e => setBreakReason(e.target.value)}
                    placeholder="e.g. 5th Floor Cafeteria"
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs shadow-lg shadow-amber-950/40 transition-all cursor-pointer"
              >
                <Coffee className="w-4 h-4" />
                <span>Start Break & Outside Timer</span>
              </button>
            </form>
          )}
        </div>

        {/* Right 1 Col: Policy Allowance Card */}
        <div className="rounded-2xl bg-[#0c121e] border border-slate-800 p-6 space-y-4">
          <h2 className="text-sm font-bold text-white font-['Space_Grotesk'] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Policy Allowance</span>
          </h2>

          <div className="space-y-2.5 text-xs text-slate-300">
            <div className="flex justify-between py-1.5 border-b border-slate-800">
              <span className="text-slate-400">Total Shift Allowance:</span>
              <span className="font-mono font-bold text-cyan-400">{policy.breakAllowanceMinutes} mins/shift</span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-800">
              <span className="text-slate-400">Max Single Break:</span>
              <span className="font-mono font-bold text-amber-400">{policy.maxSingleBreakMinutes} mins</span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-800">
              <span className="text-slate-400">Average Break Duration:</span>
              <span className="font-mono font-bold text-white">{avgBreakDuration} mins</span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-800">
              <span className="text-slate-400">Flagged Instances:</span>
              <span className="font-mono font-bold text-rose-400">{flaggedBreaksCount}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
            Outside-time duration is deducted from gross shift time to accurately establish net billable working hours.
          </div>
        </div>
      </div>

      {/* Break History Log Table */}
      <div className="rounded-2xl bg-[#0c121e] border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white font-['Space_Grotesk']">
            Recent Workstation Absence & Break Log
          </h3>
          <span className="text-xs font-mono text-slate-400">{allUserBreaks.length} total entries</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Start Time</th>
                <th className="p-3.5">Return Time</th>
                <th className="p-3.5">Duration</th>
                <th className="p-3.5">Reason</th>
                <th className="p-3.5">Policy Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {allUserBreaks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No historical break intervals recorded.
                  </td>
                </tr>
              ) : (
                allUserBreaks.map(b => (
                  <tr key={b.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-3.5 font-mono text-slate-200">{b.date}</td>
                    <td className="p-3.5 font-semibold text-white">{b.category}</td>
                    <td className="p-3.5 font-mono text-slate-300">{b.startTime}</td>
                    <td className="p-3.5 font-mono text-slate-300">{b.endTime || 'In Progress'}</td>
                    <td className="p-3.5 font-mono font-bold text-amber-400">
                      {b.durationMinutes} mins
                    </td>
                    <td className="p-3.5 text-[11px] text-slate-400">{b.reason || '--'}</td>
                    <td className="p-3.5">
                      {b.flaggedExcessive ? (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-red-950 text-red-300 border border-red-800/60 uppercase">
                          ⚠️ Exceeded Limit ({b.durationMinutes}m &gt; {policy.maxSingleBreakMinutes}m)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-950 text-emerald-300 border border-emerald-800/60 uppercase">
                          ✓ Compliant
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
