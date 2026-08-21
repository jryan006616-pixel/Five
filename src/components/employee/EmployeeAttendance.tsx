import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Clock,
  Calendar,
  Coffee,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Download,
  Filter,
  ShieldCheck,
  Timer,
  Zap,
} from 'lucide-react';
import {
  DEFAULT_SHIFT_CONFIG,
  formatMinutesTo12Hour,
  parseTimeToMinutes,
  formatTimeTo12HourWithTimezone,
} from '../../utils/shiftUtils';

export const EmployeeAttendance: React.FC = () => {
  const { currentEmployee, attendanceRecords, policy } = useApp();
  const [filterMonth, setFilterMonth] = useState('2026-08');

  if (!currentEmployee) return null;

  const currentShift = policy.shiftConfig || DEFAULT_SHIFT_CONFIG;

  const records = attendanceRecords.filter(
    a => a.employeeId === currentEmployee.id && a.date.startsWith(filterMonth)
  );

  // Calculate summary metrics
  const totalDaysPresent = records.filter(r => r.status === 'Present' || r.status === 'Late').length;
  const totalLateArrivals = records.filter(r => r.isLate).length;
  const totalMinutesWorked = records.reduce((acc, r) => acc + r.totalWorkingMinutes, 0);
  const totalBreakMinutes = records.reduce((acc, r) => acc + r.totalBreakMinutes, 0);
  const totalOvertimeMinutes = records.reduce((acc, r) => acc + r.overtimeMinutes, 0);

  const exportCSV = () => {
    const headers = 'Date,Check In (PKT),Check Out (PKT),Break Minutes,Working Hours,Status,Late Arrival,Notes\n';
    const rows = records
      .map(
        r =>
          `"${r.date}","${r.checkInTime ? formatTimeTo12HourWithTimezone(r.checkInTime) : '--'}","${
            r.checkOutTime ? formatTimeTo12HourWithTimezone(r.checkOutTime) : '--'
          }",${r.totalBreakMinutes},"${(r.totalWorkingMinutes / 60).toFixed(2)}","${r.status}","${
            r.isLate ? `Late +${r.lateMinutes}m` : 'No'
          }","${r.notes || ''}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rhinomds_attendance_${currentEmployee.id}_${filterMonth}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#0c121e] border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl font-bold font-['Space_Grotesk'] text-white">
              My Shift Attendance & Working Hours
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Automated punch logs, workstation intervals, and punctuality calculation per Rhinomds RCM Policy.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={filterMonth}
              onChange={e => setFilterMonth(e.target.value)}
              className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:ring-2 focus:ring-cyan-500"
            >
              <option value="2026-08">August 2026</option>
              <option value="2026-07">July 2026</option>
              <option value="2026-06">June 2026</option>
            </select>
          </div>

          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Active Shift Info */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/40 via-slate-900 to-indigo-950/40 border border-cyan-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-white">Your Assigned Shift Timing:</span>
            <span className="text-cyan-300 ml-2 font-mono font-semibold">
              {formatMinutesTo12Hour(parseTimeToMinutes(currentShift.startTime))} – {formatMinutesTo12Hour(parseTimeToMinutes(currentShift.endTime))} PKT ({currentShift.season} Timing)
            </span>
            <span className="text-slate-400 ml-2 font-medium">
              • Grace Period: <strong className="text-emerald-400">{policy.gracePeriodMinutes} mins</strong> (Arrival up to {formatMinutesTo12Hour(parseTimeToMinutes(currentShift.startTime) + policy.gracePeriodMinutes)} is On-Time)
            </span>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#0c121e] border border-slate-800">
          <span className="text-[11px] text-slate-400 font-bold uppercase block">Days Logged</span>
          <p className="text-2xl font-bold font-mono text-cyan-400 mt-1">{totalDaysPresent} Days</p>
          <span className="text-[10px] text-emerald-400">Monthly attendance</span>
        </div>

        <div className="p-4 rounded-xl bg-[#0c121e] border border-slate-800">
          <span className="text-[11px] text-slate-400 font-bold uppercase block">Total Work Hours</span>
          <p className="text-2xl font-bold font-mono text-emerald-400 mt-1">
            {(totalMinutesWorked / 60).toFixed(1)} <span className="text-xs text-slate-400">hrs</span>
          </p>
          <span className="text-[10px] text-slate-500">Net after break deductions</span>
        </div>

        <div className="p-4 rounded-xl bg-[#0c121e] border border-slate-800">
          <span className="text-[11px] text-slate-400 font-bold uppercase block">Total Breaks</span>
          <p className="text-2xl font-bold font-mono text-amber-400 mt-1">
            {totalBreakMinutes} <span className="text-xs text-slate-400">mins</span>
          </p>
          <span className="text-[10px] text-slate-500">Daily allowance: {policy.breakAllowanceMinutes}m</span>
        </div>

        <div className="p-4 rounded-xl bg-[#0c121e] border border-slate-800">
          <span className="text-[11px] text-slate-400 font-bold uppercase block">Late Arrivals</span>
          <p className="text-2xl font-bold font-mono text-rose-400 mt-1">{totalLateArrivals}</p>
          <span className="text-[10px] text-rose-400">
            {totalLateArrivals > 0 ? 'Exceeded grace limit' : 'Punctual arrival'}
          </span>
        </div>
      </div>

      {/* Attendance History Table */}
      <div className="rounded-2xl bg-[#0c121e] border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white font-['Space_Grotesk']">
            Shift Attendance History Log
          </h2>
          <span className="text-xs font-mono text-slate-400">{records.length} records found</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Shift Check-In (PKT)</th>
                <th className="p-3.5">Break Logs</th>
                <th className="p-3.5">Shift Check-Out (PKT)</th>
                <th className="p-3.5">Net Working Hours</th>
                <th className="p-3.5">Punctuality Status</th>
                <th className="p-3.5">System Audit Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No attendance records logged for this month. Use the Check-In button on the top bar or Dashboard to punch in.
                  </td>
                </tr>
              ) : (
                records.map(record => (
                  <tr key={record.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-3.5 font-mono font-semibold text-slate-200">
                      {record.date}
                    </td>
                    <td className="p-3.5 font-mono">
                      {record.checkInTime ? (
                        <div>
                          <span className="font-semibold text-white">
                            {formatTimeTo12HourWithTimezone(record.checkInTime)}
                          </span>
                          {record.isLate ? (
                            <span className="inline-block mt-0.5 px-1.5 py-0.5 text-[10px] font-bold rounded bg-rose-950 text-rose-300 border border-rose-800">
                              Late Arrival (+{record.lateMinutes}m)
                            </span>
                          ) : (
                            <span className="inline-block mt-0.5 text-[10px] text-emerald-400 font-semibold">
                              ✓ On Time
                            </span>
                          )}
                        </div>
                      ) : (
                        '--:--'
                      )}
                    </td>
                    <td className="p-3.5">
                      <div className="space-y-0.5">
                        <span className="font-mono text-amber-400 font-semibold">
                          {record.totalBreakMinutes} mins
                        </span>
                        {record.breaks && record.breaks.length > 0 && (
                          <div className="text-[10px] text-slate-400">
                            {record.breaks.map((b, i) => (
                              <div key={i}>
                                {b.startTime ? formatTimeTo12HourWithTimezone(b.startTime) : '--'} - {b.endTime ? formatTimeTo12HourWithTimezone(b.endTime) : 'Open'} ({b.durationMinutes}m)
                                {b.flaggedExcessive && (
                                  <span className="text-red-400 font-bold ml-1">⚠️ Flagged</span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-3.5 font-mono text-slate-300">
                      {record.checkOutTime
                        ? formatTimeTo12HourWithTimezone(record.checkOutTime)
                        : record.checkInTime
                        ? <span className="text-cyan-400 font-semibold animate-pulse">In Progress</span>
                        : '--:--'}
                    </td>
                    <td className="p-3.5 font-mono font-bold text-cyan-400">
                      {(record.totalWorkingMinutes / 60).toFixed(2)} hrs
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase ${
                          record.isLate
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : record.status === 'Present'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                            : record.status === 'Half Day'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-red-950 text-red-300 border border-red-800/60'
                        }`}
                      >
                        {record.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-[11px] text-slate-400 max-w-xs truncate" title={record.notes}>
                      {record.notes || 'Normal shift workflow.'}
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
