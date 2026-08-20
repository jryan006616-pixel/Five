import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FileSpreadsheet,
  Download,
  Printer,
  Filter,
  Calendar,
  Building,
  Users,
  CheckCircle2,
} from 'lucide-react';

export const AdminReports: React.FC = () => {
  const {
    allEmployees,
    attendanceRecords,
    salaryRecords,
    kpiRecords,
    deductions,
  } = useApp();

  const [reportType, setReportType] = useState<
    'employee' | 'attendance' | 'breaks' | 'kpi' | 'salary' | 'probation'
  >('salary');

  const [filterMonth, setFilterMonth] = useState('August 2026');

  const handleExportCSV = () => {
    let headers = '';
    let rows = '';

    if (reportType === 'salary') {
      headers = 'Employee ID,Full Name,Department,Base Salary (RS),Bonus (RS),Other Earnings (RS),Deductions (RS),Net Payout (RS),Month\n';
      rows = salaryRecords
        .filter(s => s.month === filterMonth)
        .map(
          s =>
            `"${s.employeeId}","${s.employeeName}","${s.department}",${s.baseSalary},${s.bonus},${s.otherEarnings},${s.totalDeductions},${s.netSalary},"${s.month}"`
        )
        .join('\n');
    } else if (reportType === 'employee') {
      headers = 'Employee ID,Full Name,Email,Department,Designation,DOJ,Probation Status,Base Salary,Status\n';
      rows = allEmployees
        .map(
          e =>
            `"${e.id}","${e.fullName}","${e.email}","${e.department}","${e.designation}","${e.dateOfJoining}","${e.probationStatus}",${e.monthlySalary},"${e.employmentStatus}"`
        )
        .join('\n');
    } else if (reportType === 'attendance') {
      headers = 'Date,Employee ID,Employee Name,Check In,Check Out,Total Break (mins),Working Hours,Status\n';
      rows = attendanceRecords
        .map(
          a =>
            `"${a.date}","${a.employeeId}","${a.employeeName}","${a.checkInTime || '--'}","${
              a.checkOutTime || '--'
            }",${a.totalBreakMinutes},"${(a.totalWorkingMinutes / 60).toFixed(2)}","${a.status}"`
        )
        .join('\n');
    } else if (reportType === 'probation') {
      headers = 'Employee ID,Full Name,Department,Joining Date,Probation End Date,Probation Status\n';
      rows = allEmployees
        .map(
          e =>
            `"${e.id}","${e.fullName}","${e.department}","${e.dateOfJoining}","${e.probationEndDate}","${e.probationStatus}"`
        )
        .join('\n');
    } else {
      headers = 'Employee ID,Employee Name,Month,KPI Score,Bonus Amount,Status,Remarks\n';
      rows = kpiRecords
        .map(
          k =>
            `"${k.employeeId}","${k.employeeName}","${k.month}",${k.kpiScore},${k.bonusAmount},"${k.bonusStatus}","${k.performanceRemarks}"`
        )
        .join('\n');
    }

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rhinomds_report_${reportType}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-[#0c121e] border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl font-bold font-['Space_Grotesk'] text-white">
              Enterprise Analytics & Audit Reports
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Export structured compliance, payroll reconciliation, attendance, and probation archives.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV Dataset</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print View</span>
          </button>
        </div>
      </div>

      {/* Report Category Selectors */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { id: 'salary', label: 'Payroll & Salary', icon: FileSpreadsheet },
          { id: 'attendance', label: 'Shift Attendance', icon: Calendar },
          { id: 'probation', label: 'Probation Tracker', icon: Users },
          { id: 'kpi', label: 'KPI & Bonus', icon: CheckCircle2 },
          { id: 'employee', label: 'Staff Master', icon: Users },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = reportType === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setReportType(tab.id as any)}
              className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                isActive
                  ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 shadow-md shadow-cyan-950/40'
                  : 'bg-[#0c121e] border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Report Preview Table */}
      <div className="rounded-2xl bg-[#0c121e] border border-slate-800 overflow-hidden shadow-xl p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h2 className="text-sm font-bold text-white font-['Space_Grotesk'] capitalize">
            {reportType} Data Report
          </h2>
          <span className="text-xs font-mono text-cyan-400">Ready for instant export</span>
        </div>

        <div className="overflow-x-auto">
          {reportType === 'salary' && (
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="p-3">Staff</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Base (RS)</th>
                  <th className="p-3">Bonus (RS)</th>
                  <th className="p-3">Deductions (RS)</th>
                  <th className="p-3">Net Take-Home</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {salaryRecords.map(s => (
                  <tr key={s.id}>
                    <td className="p-3 font-sans font-semibold text-white">{s.employeeName}</td>
                    <td className="p-3 font-sans text-slate-300">{s.department}</td>
                    <td className="p-3">{s.baseSalary.toLocaleString()} RS</td>
                    <td className="p-3 text-emerald-400">+{s.bonus.toLocaleString()} RS</td>
                    <td className="p-3 text-red-400">-{s.totalDeductions.toLocaleString()} RS</td>
                    <td className="p-3 font-bold text-emerald-400">{s.netSalary.toLocaleString()} RS</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'employee' && (
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="p-3">ID</th>
                  <th className="p-3">Staff Name</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Designation</th>
                  <th className="p-3">DOJ</th>
                  <th className="p-3">Probation</th>
                  <th className="p-3">Base Salary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {allEmployees.map(e => (
                  <tr key={e.id}>
                    <td className="p-3 text-cyan-400">{e.id}</td>
                    <td className="p-3 font-sans font-semibold text-white">{e.fullName}</td>
                    <td className="p-3 font-sans text-slate-300">{e.department}</td>
                    <td className="p-3 font-sans text-slate-400">{e.designation}</td>
                    <td className="p-3">{e.dateOfJoining}</td>
                    <td className="p-3 font-sans text-amber-400">{e.probationStatus}</td>
                    <td className="p-3 text-emerald-400">{e.monthlySalary.toLocaleString()} RS</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'probation' && (
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="p-3">Staff Name</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Date of Joining</th>
                  <th className="p-3">Probation End Date</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {allEmployees.map(e => (
                  <tr key={e.id}>
                    <td className="p-3 font-sans font-semibold text-white">{e.fullName}</td>
                    <td className="p-3 font-sans text-slate-300">{e.department}</td>
                    <td className="p-3">{e.dateOfJoining}</td>
                    <td className="p-3 text-cyan-400">{e.probationEndDate}</td>
                    <td className="p-3 font-sans text-amber-400">{e.probationStatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
