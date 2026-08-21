import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getLiveDateStr } from '../../utils/dateUtils';
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
  PlusCircle,
  Edit2,
  Trash2,
  X,
  Sparkles,
  Zap,
  Info,
} from 'lucide-react';
import { AttendanceRecord, AttendanceStatus, Employee } from '../../types';
import {
  DEFAULT_SHIFT_CONFIG,
  formatMinutesTo12Hour,
  parseTimeToMinutes,
  formatTimeTo12HourWithTimezone,
  evaluateCheckIn,
  calculateWorkingHours,
} from '../../utils/shiftUtils';

export const AdminAttendance: React.FC = () => {
  const {
    allEmployees,
    attendanceRecords,
    policy,
    recordManualAttendance,
    deleteAttendanceRecord,
    setActiveTab,
  } = useApp();

  const [selectedDate, setSelectedDate] = useState(() => getLiveDateStr());
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State for Manual Attendance Entry / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Partial<AttendanceRecord> | null>(null);
  const [modalEmployeeId, setModalEmployeeId] = useState('');
  const [modalDate, setModalDate] = useState(() => getLiveDateStr());
  const [modalCheckIn, setModalCheckIn] = useState('18:00');
  const [modalCheckOut, setModalCheckOut] = useState('03:00');
  const [modalBreakMinutes, setModalBreakMinutes] = useState(60);
  const [modalStatus, setModalStatus] = useState<AttendanceStatus>('Present');
  const [modalNotes, setModalNotes] = useState('');

  const currentShift = policy.shiftConfig || DEFAULT_SHIFT_CONFIG;

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

    const isLate = item.record?.isLate;
    const status = item.record ? item.record.status : 'Absent';

    let statusMatch = true;
    if (filterStatus === 'All') {
      statusMatch = true;
    } else if (filterStatus === 'Late') {
      statusMatch = isLate === true || status === 'Late';
    } else if (filterStatus === 'Present') {
      statusMatch = status === 'Present' && !isLate;
    } else if (filterStatus === 'OnBreak') {
      statusMatch = item.record?.breaks.some(b => b.endTime === null) || false;
    } else if (filterStatus === 'Absent') {
      statusMatch = !item.record || status === 'Absent';
    }

    return nameMatch && statusMatch;
  });

  // Calculate day stats
  const presentCount = dayRecords.filter(r => r.status === 'Present' || r.status === 'Late').length;
  const lateCount = dayRecords.filter(r => r.isLate).length;
  const onBreakNow = dayRecords.filter(r => r.breaks && r.breaks.some(b => b.endTime === null)).length;
  const flaggedBreaksTotal = dayRecords.reduce(
    (acc, r) => acc + (r.breaks ? r.breaks.filter(b => b.flaggedExcessive).length : 0),
    0
  );

  const openAddModal = (empId?: string) => {
    setEditingRecord(null);
    setModalEmployeeId(empId || (allEmployees[0]?.id ?? ''));
    setModalDate(selectedDate);
    setModalCheckIn('18:00');
    setModalCheckOut('03:00');
    setModalBreakMinutes(60);
    setModalStatus('Present');
    setModalNotes('Manual shift punch logged by HR/Admin.');
    setIsModalOpen(true);
  };

  const openEditModal = (emp: Employee, record: AttendanceRecord | null) => {
    setEditingRecord(record);
    setModalEmployeeId(emp.id);
    setModalDate(record?.date || selectedDate);
    setModalCheckIn(record?.checkInTime || '18:00');
    setModalCheckOut(record?.checkOutTime || '03:00');
    setModalBreakMinutes(record?.totalBreakMinutes ?? 60);
    setModalStatus(record?.status || 'Present');
    setModalNotes(record?.notes || '');
    setIsModalOpen(true);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalEmployeeId) return;

    recordManualAttendance({
      id: editingRecord?.id,
      employeeId: modalEmployeeId,
      date: modalDate,
      checkInTime: modalCheckIn ? modalCheckIn.trim() : null,
      checkOutTime: modalCheckOut ? modalCheckOut.trim() : null,
      totalBreakMinutes: Number(modalBreakMinutes),
      status: modalStatus,
      notes: modalNotes,
    });

    setIsModalOpen(false);
  };

  const handleDeleteRecord = (recordId: string) => {
    if (window.confirm('Are you sure you want to remove this attendance record?')) {
      deleteAttendanceRecord(recordId);
    }
  };

  // Preview evaluation inside modal
  const modalEval = modalCheckIn
    ? evaluateCheckIn(modalCheckIn, currentShift, policy.gracePeriodMinutes)
    : null;

  const exportDayCSV = () => {
    const headers =
      'Employee ID,Employee Name,Department,Date,Check In (PKT),Check Out (PKT),Total Break (mins),Working Hours,Status,Late Arrival,Audit Remarks\n';
    const rows = filtered
      .map(item => {
        const emp = item.employee;
        const r = item.record;
        return `"${emp.id}","${emp.fullName}","${emp.department}","${selectedDate}","${
          r?.checkInTime ? formatTimeTo12HourWithTimezone(r.checkInTime) : '--'
        }","${r?.checkOutTime ? formatTimeTo12HourWithTimezone(r.checkOutTime) : '--'}",${
          r?.totalBreakMinutes || 0
        },"${r ? (r.totalWorkingMinutes / 60).toFixed(2) : '0.00'}","${r?.status || 'Absent'}","${
          r?.isLate ? `Late +${r.lateMinutes}m` : 'No'
        }","${r?.notes || ''}"`;
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
            Real-time shift punches, dynamic late arrival detection against company shift timings, break monitoring, and manual attendance correction.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => openAddModal()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white font-bold text-xs shadow-lg shadow-cyan-950/40 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Log / Correct Attendance</span>
          </button>

          <button
            onClick={exportDayCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Active Shift Timing Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/40 via-slate-900 to-indigo-950/40 border border-cyan-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-white">Active Company Shift:</span>
            <span className="text-cyan-300 ml-2 font-mono font-semibold">
              {formatMinutesTo12Hour(parseTimeToMinutes(currentShift.startTime))} – {formatMinutesTo12Hour(parseTimeToMinutes(currentShift.endTime))} PKT ({currentShift.season} Timing)
            </span>
            <span className="text-slate-400 ml-2 font-medium">
              • Grace Period: <strong className="text-emerald-400">{policy.gracePeriodMinutes} mins</strong> (Arrival after {formatMinutesTo12Hour(parseTimeToMinutes(currentShift.startTime) + policy.gracePeriodMinutes)} flags as Late)
            </span>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('policies')}
          className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold underline underline-offset-2 shrink-0 cursor-pointer"
        >
          Change Winter / Summer Timing &rarr;
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
          <span className="text-[10px] text-emerald-400">
            {allEmployees.length > 0 ? ((presentCount / allEmployees.length) * 100).toFixed(0) : 0}% Roster Turnout
          </span>
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
            Late Arrivals (&gt;{policy.gracePeriodMinutes}m)
          </span>
          <p className="text-2xl font-bold font-mono text-rose-400 mt-1">
            {lateCount} Staff
          </p>
          <span className="text-[10px] text-rose-500 font-semibold">Flagged against shift start</span>
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
            <span className="text-slate-400">Filter:</span>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs"
            >
              <option value="All">All Staff ({combinedRoster.length})</option>
              <option value="Present">On-Time Present</option>
              <option value="Late">Late Arrivals Only ({lateCount})</option>
              <option value="OnBreak">Currently on Break ({onBreakNow})</option>
              <option value="Absent">Absent / Not Checked In</option>
            </select>
          </div>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search staff, ID, department..."
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
                <th className="p-3.5">Shift Check-In (PKT)</th>
                <th className="p-3.5">Break Logs (Outside Time)</th>
                <th className="p-3.5">Shift Check-Out (PKT)</th>
                <th className="p-3.5">Net Hours</th>
                <th className="p-3.5">Punctuality Status</th>
                <th className="p-3.5">System Audit Remarks</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map(({ employee, record }) => {
                const activeBreak = record?.breaks?.find(b => b.endTime === null);

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
                            {employee.id} • {employee.designation} • <strong className="text-cyan-400">{employee.department}</strong>
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Check In */}
                    <td className="p-3.5 font-mono">
                      {record?.checkInTime ? (
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
                        <span className="text-slate-500 italic">Not Punched In</span>
                      )}
                    </td>

                    {/* Breaks */}
                    <td className="p-3.5">
                      {record ? (
                        <div>
                          <span className="font-mono text-amber-400 font-bold">
                            {record.totalBreakMinutes || 0} mins total
                          </span>
                          {activeBreak && (
                            <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-amber-950 text-amber-300 border border-amber-800 ml-1.5 animate-pulse">
                              ☕ OUT ({activeBreak.category})
                            </span>
                          )}
                          {record.breaks?.some(b => b.flaggedExcessive) && (
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
                      {record?.checkOutTime ? (
                        formatTimeTo12HourWithTimezone(record.checkOutTime)
                      ) : record?.checkInTime ? (
                        <span className="text-cyan-400 font-semibold animate-pulse">In Progress</span>
                      ) : (
                        '--:--'
                      )}
                    </td>

                    {/* Working Hours */}
                    <td className="p-3.5 font-mono font-bold text-cyan-400">
                      {record ? `${(record.totalWorkingMinutes / 60).toFixed(2)} hrs` : '0.00 hrs'}
                    </td>

                    {/* Status */}
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase ${
                          record?.isLate
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : record?.status === 'Present'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                            : record?.status === 'Half Day'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-slate-900 text-slate-400 border border-slate-800'
                        }`}
                      >
                        {record?.status || 'Absent'}
                      </span>
                    </td>

                    {/* Audit Remarks */}
                    <td className="p-3.5 text-[11px] text-slate-400 max-w-xs truncate" title={record?.notes}>
                      {record?.notes || 'Normal shift schedule.'}
                    </td>

                    {/* Actions */}
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(employee, record)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-cyan-900/60 text-slate-300 hover:text-cyan-300 transition-colors"
                          title="Edit or log manual attendance"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {record && (
                          <button
                            onClick={() => handleDeleteRecord(record.id)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300 transition-colors"
                            title="Delete attendance record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Clock className="w-10 h-10 text-slate-600" />
                      <p className="text-sm font-bold text-slate-300">No Records Found</p>
                      <p className="text-xs text-slate-500">
                        {allEmployees.length === 0
                          ? 'Onboard employees first to view daily shift attendance logs.'
                          : 'No staff match the current search / filter criteria.'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Attendance Entry & Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#0c121e] border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white font-['Space_Grotesk']">
                  {editingRecord ? 'Edit Shift Attendance Punch' : 'Record Shift Punch / Correction'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Select Employee</label>
                <select
                  value={modalEmployeeId}
                  onChange={e => setModalEmployeeId(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  required
                >
                  {allEmployees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.fullName} ({emp.id} - {emp.department})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Shift Date</label>
                  <input
                    type="date"
                    value={modalDate}
                    onChange={e => setModalDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Status Override</label>
                  <select
                    value={modalStatus}
                    onChange={e => setModalStatus(e.target.value as AttendanceStatus)}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  >
                    <option value="Present">Present</option>
                    <option value="Late">Late</option>
                    <option value="Half Day">Half Day</option>
                    <option value="Absent">Absent</option>
                    <option value="Leave">Leave</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Check-In Time (e.g. 21:01 or 18:00)
                  </label>
                  <input
                    type="text"
                    placeholder="18:00 or 21:01"
                    value={modalCheckIn}
                    onChange={e => setModalCheckIn(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                  />
                  <span className="text-[10px] text-cyan-400 mt-1 block">
                    {modalCheckIn ? formatTimeTo12HourWithTimezone(modalCheckIn) : '--:--'}
                  </span>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Check-Out Time (e.g. 03:00)
                  </label>
                  <input
                    type="text"
                    placeholder="03:00"
                    value={modalCheckOut}
                    onChange={e => setModalCheckOut(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                  />
                  <span className="text-[10px] text-cyan-400 mt-1 block">
                    {modalCheckOut ? formatTimeTo12HourWithTimezone(modalCheckOut) : '--:--'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Total Break Duration (Minutes)</label>
                <input
                  type="number"
                  min={0}
                  max={240}
                  value={modalBreakMinutes}
                  onChange={e => setModalBreakMinutes(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                />
              </div>

              {/* Real-Time Late Evaluation Preview */}
              {modalEval && (
                <div
                  className={`p-3 rounded-xl border space-y-1 ${
                    modalEval.isLate
                      ? 'bg-rose-950/40 border-rose-800 text-rose-200'
                      : 'bg-emerald-950/40 border-emerald-800 text-emerald-200'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span>
                      {modalEval.isLate
                        ? `⚠️ Late Arrival Detected: +${modalEval.lateMinutes} mins late`
                        : '✓ On Time Arrival'}
                    </span>
                    <span className="font-mono">{modalEval.checkIn12h} PKT</span>
                  </div>
                  <p className="text-[11px] opacity-90">{modalEval.notes}</p>
                </div>
              )}

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Remarks / Reason</label>
                <textarea
                  value={modalNotes}
                  onChange={e => setModalNotes(e.target.value)}
                  placeholder="Reason for manual entry / correction..."
                  rows={2}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  Save Attendance Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
