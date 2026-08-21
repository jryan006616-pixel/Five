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
  Calendar,
  Award,
  Layers,
  DollarSign,
  Filter,
} from 'lucide-react';

export const AdminPayslips: React.FC = () => {
  const {
    allEmployees,
    payslips,
    generatePayslip,
    generateBothSlips,
    setSelectedPayslipForModal,
  } = useApp();

  const [selectedMonth, setSelectedMonth] = useState('August 2026');
  const [selectedEmpId, setSelectedEmpId] = useState(allEmployees[0]?.id || '');
  const [selectedSlipTypeToGen, setSelectedSlipTypeToGen] = useState<'Salary' | 'Bonus' | 'Both'>('Both');
  const [slipTypeFilter, setSlipTypeFilter] = useState<'All' | 'Salary' | 'Bonus'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const monthPayslips = payslips.filter(p => p.salaryMonth === selectedMonth);

  const handleGenerateSingle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpId) return;

    if (selectedSlipTypeToGen === 'Both') {
      generateBothSlips(selectedEmpId, selectedMonth);
    } else {
      generatePayslip(selectedEmpId, selectedMonth, selectedSlipTypeToGen);
    }
  };

  const handleBatchGenerateSalary = () => {
    allEmployees.forEach(emp => {
      generatePayslip(emp.id, selectedMonth, 'Salary');
    });
  };

  const handleBatchGenerateBonus = () => {
    allEmployees.forEach(emp => {
      generatePayslip(emp.id, selectedMonth, 'Bonus');
    });
  };

  const handleBatchGenerateBoth = () => {
    allEmployees.forEach(emp => {
      generateBothSlips(emp.id, selectedMonth);
    });
  };

  const filteredPayslips = monthPayslips.filter(p => {
    const matchesSearch =
      p.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.payslipNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.department.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (slipTypeFilter === 'All') return true;
    if (slipTypeFilter === 'Bonus') return p.slipType === 'Bonus';
    return p.slipType !== 'Bonus'; // Default 'Salary'
  });

  const salarySlipsCount = monthPayslips.filter(p => p.slipType !== 'Bonus').length;
  const bonusSlipsCount = monthPayslips.filter(p => p.slipType === 'Bonus').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-[#0c121e] border border-slate-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl font-bold font-['Space_Grotesk'] text-white">
              Official Payslip & Bonus Advice Generator
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Generate segregated <strong>Monthly Salary Slips (Month-Start 1st-5th)</strong> and <strong>KPI Performance Bonus Slips (Mid-Month 15th)</strong> with 10-point scoring.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleBatchGenerateSalary}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Generate Salary Slips (Month-Start)</span>
          </button>

          <button
            onClick={handleBatchGenerateBonus}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
          >
            <Award className="w-3.5 h-3.5" />
            <span>Generate Bonus Slips (Mid-Month)</span>
          </button>

          <button
            onClick={handleBatchGenerateBoth}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Generate Both Cycles</span>
          </button>
        </div>
      </div>

      {/* Cycle Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-[#0c121e] border border-blue-900/50 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider block">
              Salary Slips Issued (Month-Start)
            </span>
            <p className="text-2xl font-bold font-mono text-white mt-0.5">
              {salarySlipsCount} / {allEmployees.length}
            </p>
            <span className="text-[10px] text-slate-400">Disbursed 1st-5th</span>
          </div>
          <Calendar className="w-8 h-8 text-blue-500/40" />
        </div>

        <div className="p-4 rounded-xl bg-[#0c121e] border border-amber-900/50 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
              KPI Bonus Slips Issued (Mid-Month)
            </span>
            <p className="text-2xl font-bold font-mono text-amber-400 mt-0.5">
              {bonusSlipsCount} / {allEmployees.length}
            </p>
            <span className="text-[10px] text-slate-400">Disbursed 15th (10-Pt Model)</span>
          </div>
          <Award className="w-8 h-8 text-amber-500/40" />
        </div>

        <div className="p-4 rounded-xl bg-[#0c121e] border border-cyan-900/50 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">
              Total Official Electronic Documents
            </span>
            <p className="text-2xl font-bold font-mono text-cyan-300 mt-0.5">
              {monthPayslips.length}
            </p>
            <span className="text-[10px] text-slate-400">Available for print & PDF</span>
          </div>
          <ShieldCheck className="w-8 h-8 text-cyan-500/40" />
        </div>
      </div>

      {/* Generator Control Bar */}
      <div className="p-4 rounded-2xl bg-[#0c121e] border border-slate-800 flex flex-col lg:flex-row items-center justify-between gap-4 text-xs">
        <form onSubmit={handleGenerateSingle} className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
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

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Issue Type:</span>
            <select
              value={selectedSlipTypeToGen}
              onChange={e => setSelectedSlipTypeToGen(e.target.value as 'Salary' | 'Bonus' | 'Both')}
              className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:ring-2 focus:ring-cyan-500"
            >
              <option value="Both">Both (Salary & Bonus Slips)</option>
              <option value="Salary">Monthly Salary Slip Only (Month-Start)</option>
              <option value="Bonus">KPI Bonus Slip Only (Mid-Month 15th)</option>
            </select>
          </div>

          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold border border-slate-700 transition-colors cursor-pointer"
          >
            Issue Selected Slip
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Slip Type Filter Buttons */}
          <div className="flex rounded-xl bg-slate-900 border border-slate-700 p-0.5 text-xs">
            <button
              onClick={() => setSlipTypeFilter('All')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                slipTypeFilter === 'All' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({monthPayslips.length})
            </button>
            <button
              onClick={() => setSlipTypeFilter('Salary')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                slipTypeFilter === 'Salary' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Salary Slips
            </button>
            <button
              onClick={() => setSlipTypeFilter('Bonus')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                slipTypeFilter === 'Bonus' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Bonus Slips
            </button>
          </div>

          <div className="relative w-full sm:w-56">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search issued slips..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 placeholder-slate-500 text-xs"
            />
          </div>
        </div>
      </div>

      {/* Payslips Table */}
      <div className="rounded-2xl bg-[#0c121e] border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white font-['Space_Grotesk']">
            Issued Electronic Slips for {selectedMonth} ({filteredPayslips.length})
          </h2>
          <span className="text-xs font-mono text-emerald-400 font-bold">Official e-Documents</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3.5">Slip #</th>
                <th className="p-3.5">Type & Cycle</th>
                <th className="p-3.5">Employee Name</th>
                <th className="p-3.5">KPI Points</th>
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
                  <td colSpan={9} className="p-8 text-center text-slate-500">
                    No payslips found for {selectedMonth} under the selected criteria. Use the buttons above to generate slips.
                  </td>
                </tr>
              ) : (
                filteredPayslips.map(ps => {
                  const isBonus = ps.slipType === 'Bonus';

                  return (
                    <tr key={ps.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-cyan-400">
                        {ps.payslipNumber}
                      </td>

                      <td className="p-3.5">
                        <span
                          className={`px-2.5 py-1 text-[10px] font-bold rounded-lg uppercase border inline-flex items-center gap-1 ${
                            isBonus
                              ? 'bg-amber-950/80 text-amber-300 border-amber-800/60'
                              : 'bg-blue-950/80 text-blue-300 border-blue-800/60'
                          }`}
                        >
                          {isBonus ? <Award className="w-3 h-3 text-amber-400" /> : <Calendar className="w-3 h-3 text-blue-400" />}
                          {isBonus ? 'Bonus (15th Mid-Month)' : 'Salary (Month-Start)'}
                        </span>
                      </td>

                      <td className="p-3.5 font-semibold text-white">
                        <div>
                          <span>{ps.employeeName}</span>
                          <span className="text-[10px] text-slate-400 block font-mono">{ps.employeeCode} • {ps.department}</span>
                        </div>
                      </td>

                      <td className="p-3.5">
                        {isBonus ? (
                          <div className="font-mono text-[11px] text-amber-300 font-bold">
                            {ps.totalKpiPoints !== undefined ? `${ps.totalKpiPoints}/10` : `${((ps.kpiScore || 90) / 10).toFixed(1)}/10`}
                            <span className="text-[10px] text-slate-400 block font-normal">
                              ({ps.hrPoints !== undefined ? ps.hrPoints : 3} HR + {ps.productivityPoints !== undefined ? ps.productivityPoints : 6.5} Prod)
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-500 font-mono">--</span>
                        )}
                      </td>

                      <td className="p-3.5 font-mono text-slate-200">
                        {ps.grossSalary.toLocaleString()} RS
                      </td>

                      <td className="p-3.5 font-mono text-red-400">
                        {ps.totalDeductions > 0 ? `-${ps.totalDeductions.toLocaleString()} RS` : '0 RS'}
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
                          className="px-3 py-1.5 rounded-lg bg-cyan-600/80 hover:bg-cyan-500 text-white font-semibold text-xs transition-colors shadow-sm cursor-pointer inline-flex items-center gap-1"
                        >
                          <FileText className="w-3 h-3" />
                          <span>View e-Slip</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
