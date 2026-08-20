import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FileText,
  Printer,
  Download,
  Plus,
  ShieldCheck,
  CheckCircle2,
  Users,
  Search,
} from 'lucide-react';

export const AdminPayslips: React.FC = () => {
  const {
    allEmployees,
    payslips,
    generatePayslip,
    setSelectedPayslipForModal,
  } = useApp();

  const [selectedMonth, setSelectedMonth] = useState('August 2026');
  const [selectedEmpId, setSelectedEmpId] = useState(allEmployees[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');

  const monthPayslips = payslips.filter(p => p.salaryMonth === selectedMonth);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpId) return;
    generatePayslip(selectedEmpId, selectedMonth);
  };

  const handleBatchGenerate = () => {
    allEmployees.forEach(emp => {
      generatePayslip(emp.id, selectedMonth);
    });
  };

  const filteredPayslips = monthPayslips.filter(p =>
    p.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.payslipNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-[#0c121e] border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl font-bold font-['Space_Grotesk'] text-white">
              Official Payslip & Compensation Advice Generator
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Generate, preview, and print branded Rhinomds monthly salary advice with complete deduction transparency.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleBatchGenerate}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Generate All for {selectedMonth}</span>
          </button>
        </div>
      </div>

      {/* Generator Control Bar */}
      <div className="p-4 rounded-2xl bg-[#0c121e] border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <form onSubmit={handleGenerate} className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Month:</span>
            <select
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:ring-2 focus:ring-cyan-500"
            >
              <option value="August 2026">August 2026</option>
              <option value="July 2026">July 2026</option>
              <option value="June 2026">June 2026</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Employee:</span>
            <select
              value={selectedEmpId}
              onChange={e => setSelectedEmpId(e.target.value)}
              className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:ring-2 focus:ring-cyan-500"
            >
              {allEmployees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.fullName} ({emp.id})
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold border border-slate-700 transition-colors"
          >
            Issue Single Payslip
          </button>
        </form>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search issued slips..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 placeholder-slate-500 text-xs"
          />
        </div>
      </div>

      {/* Payslips Table */}
      <div className="rounded-2xl bg-[#0c121e] border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white font-['Space_Grotesk']">
            Issued Payslips for {selectedMonth} ({filteredPayslips.length})
          </h2>
          <span className="text-xs font-mono text-emerald-400 font-bold">Official e-Slips</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3.5">Payslip #</th>
                <th className="p-3.5">Employee Name</th>
                <th className="p-3.5">Department</th>
                <th className="p-3.5">Gross (RS)</th>
                <th className="p-3.5">Deductions (RS)</th>
                <th className="p-3.5">Net Disbursed</th>
                <th className="p-3.5">Payment Date</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredPayslips.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    No payslips generated yet for {selectedMonth}. Click "Generate All" to issue.
                  </td>
                </tr>
              ) : (
                filteredPayslips.map(ps => (
                  <tr key={ps.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-cyan-400">
                      {ps.payslipNumber}
                    </td>

                    <td className="p-3.5 font-semibold text-white">
                      {ps.employeeName}
                    </td>

                    <td className="p-3.5 text-slate-300">
                      {ps.department}
                    </td>

                    <td className="p-3.5 font-mono text-slate-200">
                      {ps.grossSalary.toLocaleString()} RS
                    </td>

                    <td className="p-3.5 font-mono text-red-400">
                      -{ps.totalDeductions.toLocaleString()} RS
                    </td>

                    <td className="p-3.5 font-mono font-bold text-emerald-400 text-sm">
                      {ps.netSalary.toLocaleString()} RS
                    </td>

                    <td className="p-3.5 font-mono text-[11px] text-slate-400">
                      {ps.paymentDate}
                    </td>

                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => setSelectedPayslipForModal(ps)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-colors ml-auto shadow-sm"
                      >
                        <Printer className="w-3 h-3" />
                        <span>Print / PDF</span>
                      </button>
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
