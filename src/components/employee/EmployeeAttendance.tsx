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
} from 'lucide-react';

export const EmployeeAttendance: React.FC = () => {
  const { currentEmployee, attendanceRecords, policy } = useApp();
  const [filterMonth, setFilterMonth] = useState('2026-08');

  if (!currentEmployee) return null;

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
    const headers = 'Date,Check In,Check Out,Break Minutes,Working Hours,Status,Notes\n';
    const rows = records
      .map(
        r =>
          `"${r.date}","${r.checkInTime || '--'}","${r.checkOutTime || '--'}",${r.totalBreakMinutes},"${(
            r.totalWorkingMinutes / 60
          ).toFixed(2)}","${r.status}","${r.notes || ''}"`
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
              My Attendance & Working Hours
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Automated punch logs, workstation intervals, and shift calculation per Rhinomds RCM Policy.
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
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#0c121e] border border-slate-800">
          <span className="text-[11px] text-slate-400 font-bold uppercase block">Days Logged</span>
          <p className="text-2xl font-bold font-mono text-cyan-400 mt-1">{totalDaysPresent} Days</p>
          <span className="text-[10px] text-emerald-400">Target: 22 shift days</span>
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
          <span className="text-[10px] text-slate-500">Allowance: {policy.breakAllowanceMinutes}m/day</span>
        </div>

        <div className="p-4 rounded-xl bg-[#0c121e] border border-slate-800">
          <span className="text-[11px] text-slate-400 font-bold uppercase block">Late Arrivals</span>
          <p className="text-2xl font-bold font-mono text-rose-400 mt-1">{totalLateArrivals}</p>
          <span className="text-[10px] text-slate-500">Grace threshold: 15 mins</span>
        </div>
      </div>

      {/* Formula Explainer Callout */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0" />
          <span className="text-slate-300">
            <strong>System Calculation Rule:</strong> Total Working Hours = (Check-Out Time − Check-In Time) − Total Break Duration. Records are cryptographic & immutable.
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
                <th className="p-3.5">Check In</th>
                <th className="p-3.5">Break Logs</th>
                <th className="p-3.5">Check Out</th>
                <th className="p-3.5">Net Working Hours</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Audit Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No attendance records logged for this filter month.
                  </td>
                </tr>
              ) : (
                records.map(record => (
                  <tr key={record.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-3.5 font-mono font-semibold text-slate-200">
                      {record.date}
                    </td>
                    <td className="p-3.5 font-mono text-slate-300">
                      {record.checkInTime || '--:--'}
                      {record.isLate && (
                        <span className="ml-1 text-[10px] text-amber-400 font-bold block">
                          Late +{record.lateMinutes}m
                        </span>
                      )}
                    </td>
                    <td className="p-3.5">
                      <div className="space-y-0.5">
                        <span className="font-mono text-amber-400 font-semibold">
                          {record.totalBreakMinutes} mins
                        </span>
                        {record.breaks.length > 0 && (
                          <div className="text-[10px] text-slate-400">
                            {record.breaks.map((b, i) => (
                              <div key={i}>
                                {b.startTime} - {b.endTime || 'Open'} ({b.durationMinutes}m)
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
                      {record.checkOutTime || (record.checkInTime ? 'In Progress' : '--:--')}
                    </td>
                    <td className="p-3.5 font-mono font-bold text-cyan-400">
                      {(record.totalWorkingMinutes / 60).toFixed(2)} hrs
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase ${
                          record.status === 'Present'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                            : record.status === 'Late'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800/60'
                            : 'bg-red-950 text-red-300 border border-red-800/60'
                        }`}
                      >
                        {record.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-[11px] text-slate-400 max-w-xs truncate">
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
