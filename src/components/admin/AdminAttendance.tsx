import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Clock,
  Coffee,
  Calendar,
  Filter,
  Download,
  AlertTriangle,
  CheckCircle2,
  Users,
  Search,
  Timer,
} from 'lucide-react';

export const AdminAttendance: React.FC = () => {
  const { allEmployees, attendanceRecords, policy } = useApp();
  const [selectedDate, setSelectedDate] = useState('2026-08-20');
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Daily records for selected date
  const dayRecords = attendanceRecords.filter(a => a.date === selectedDate);

  // Merge with all employees to show full roster for the day
  const combinedRoster = allEmployees.map(emp => {
    const record = dayRecords.find(r => r.employeeId === emp.id);
    return {
      employee: emp,
      record: record || null,
    };
  });

  const filtered = combinedRoster.filter(item => {
    const nameMatch =
      item.employee.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.employee.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.employee.department.toLowerCase().includes(searchQuery.toLowerCase());

    const status = item.record ? item.record.status : 'Absent / Not Checked In';
    const statusMatch = filterStatus === 'All' || status === filterStatus;

    return nameMatch && statusMatch;
  });

  // Calculate day stats
  const presentCount = dayRecords.filter(r => r.status === 'Present' || r.status === 'Late').length;
  const lateCount = dayRecords.filter(r => r.isLate).length;
  const onBreakNow = dayRecords.filter(r => r.breaks && r.breaks.some(b => b.endTime === null)).length;
  const flaggedBreaksTotal = dayRecords.reduce(
    (acc, r) => acc + r.breaks.filter(b => b.flaggedExcessive).length,
    0
  );

  const exportDayCSV = () => {
    const headers = 'Employee ID,Employee Name,Department,Date,Check In,Check Out,Total Break (mins),Working Hours,Status,Audit Remarks\n';
    const rows = filtered
      .map(item => {
        const emp = item.employee;
        const r = item.record;
        return `"${emp.id}","${emp.fullName}","${emp.department}","${selectedDate}","${
          r?.checkInTime || '--'
        }","${r?.checkOutTime || '--'}",${r?.totalBreakMinutes || 0},"${
          r ? (r.totalWorkingMinutes / 60).toFixed(2) : '0.00'
        }","${r?.status || 'Absent'}","${r?.notes || ''}"`;
      })
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rhinomds_organization_attendance_${selectedDate}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-[#0c121e] border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl font-bold font-['Space_Grotesk'] text-white">
              Organization-Wide Shift & Attendance Console
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time shift punches, outside workstation time surveillance, and automated working hours auditing.
          </p>
        </div>

        <button
          onClick={exportDayCSV}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Daily Shift CSV</span>
        </button>
      </div>

      {/* Daily Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#0c121e] border border-slate-800">
          <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
            Present on Shift
          </span>
          <p className="text-2xl font-bold font-mono text-white mt-1">
            {presentCount} / {allEmployees.length}
          </p>
          <span className="text-[10px] text-emerald-400">{((presentCount / allEmployees.length) * 100).toFixed(0)}% Roster Turnout</span>
        </div>

        <div className="p-4 rounded-xl bg-[#0c121e] border border-slate-800">
          <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
            Currently on Break
          </span>
          <p className="text-2xl font-bold font-mono text-amber-400 mt-1">
            {onBreakNow} Staff
          </p>
          <span className="text-[10px] text-slate-400">Outside Workstation</span>
        </div>

        <div className="p-4 rounded-xl bg-[#0c121e] border border-slate-800">
          <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider block">
            Late Arrivals (&gt;15m)
          </span>
          <p className="text-2xl font-bold font-mono text-rose-400 mt-1">
            {lateCount} Staff
          </p>
          <span className="text-[10px] text-rose-500">Auto grace exceeded</span>
        </div>

        <div className="p-4 rounded-xl bg-[#0c121e] border border-slate-800">
          <span className="text-[11px] font-bold text-red-400 uppercase tracking-wider block">
            Flagged Excessive Breaks
          </span>
          <p className="text-2xl font-bold font-mono text-red-400 mt-1">
            {flaggedBreaksTotal}
          </p>
          <span className="text-[10px] text-slate-400">&gt;{policy.maxSingleBreakMinutes} mins single break</span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-[#0c121e] border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Date:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs font-mono"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Status:</span>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs"
            >
              <option value="All">All Statuses</option>
              <option value="Present">Present</option>
              <option value="Late">Late</option>
            </select>
          </div>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search staff..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 placeholder-slate-500 text-xs"
          />
        </div>
      </div>

      {/* Roster Attendance Table */}
      <div className="rounded-2xl bg-[#0c121e] border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3.5">Employee</th>
                <th className="p-3.5">Shift Check In</th>
                <th className="p-3.5">Break Logs (Outside Time)</th>
                <th className="p-3.5">Shift Check Out</th>
                <th className="p-3.5">Net Working Hours</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">System Audit Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map(({ employee, record }) => {
                const activeBreak = record?.breaks.find(b => b.endTime === null);

                return (
                  <tr key={employee.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={employee.profilePhoto}
                          alt={employee.fullName}
                          className="w-8 h-8 rounded-lg object-cover border border-slate-700 shrink-0"
                        />
                        <div>
                          <span className="font-bold text-white block">{employee.fullName}</span>
                          <span className="text-[11px] text-slate-400">
                            {employee.designation} • <strong className="text-cyan-400">{employee.department}</strong>
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Check In */}
                    <td className="p-3.5 font-mono">
                      {record?.checkInTime ? (
                        <div>
                          <span className="font-semibold text-white">{record.checkInTime}</span>
                          {record.isLate && (
                            <span className="text-[10px] text-amber-400 block font-bold">
                              Late +{record.lateMinutes}m
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-500">Not Logged</span>
                      )}
                    </td>

                    {/* Breaks */}
                    <td className="p-3.5">
                      {record ? (
                        <div>
                          <span className="font-mono text-amber-400 font-bold">
                            {record.totalBreakMinutes} mins total
                          </span>
                          {activeBreak && (
                            <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-amber-950 text-amber-300 border border-amber-800 ml-1.5 animate-pulse">
                              ☕ OUT ({activeBreak.category})
                            </span>
                          )}
                          {record.breaks.some(b => b.flaggedExcessive) && (
                            <span className="text-red-400 text-[10px] block font-bold mt-0.5">
                              ⚠️ Exceeded {policy.maxSingleBreakMinutes}m limit
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-500">0 mins</span>
                      )}
                    </td>

                    {/* Check Out */}
                    <td className="p-3.5 font-mono text-slate-300">
                      {record?.checkOutTime || (record?.checkInTime ? 'In Progress' : '--:--')}
                    </td>

                    {/* Working Hours */}
                    <td className="p-3.5 font-mono font-bold text-cyan-400">
                      {record ? `${(record.totalWorkingMinutes / 60).toFixed(2)} hrs` : '0.00 hrs'}
                    </td>

                    {/* Status */}
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase ${
                          record?.status === 'Present'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                            : record?.status === 'Late'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800/60'
                            : 'bg-slate-900 text-slate-400 border border-slate-800'
                        }`}
                      >
                        {record?.status || 'Absent'}
                      </span>
                    </td>

                    {/* Audit Remarks */}
                    <td className="p-3.5 text-[11px] text-slate-400 max-w-xs truncate">
                      {record?.notes || 'Normal shift operations.'}
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Clock className="w-10 h-10 text-slate-600" />
                      <p className="text-sm font-bold text-slate-300">No Roster Entries</p>
                      <p className="text-xs text-slate-500">
                        {allEmployees.length === 0
                          ? 'Onboard employees first to view daily shift attendance logs.'
                          : 'No attendance records match your search criteria.'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
