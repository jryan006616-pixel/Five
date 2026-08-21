import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DeductionType } from '../../types';
import {
  getLiveDateStr,
  getLiveMonthStr,
  getLiveMonthName,
  getAvailableMonthOptions,
} from '../../utils/dateUtils';
import {
  DollarSign,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  X,
  CreditCard,
  Building,
  Calendar,
  Filter,
} from 'lucide-react';

export const AdminSalaryDeductions: React.FC = () => {
  const {
    allEmployees,
    salaryRecords,
    deductions,
    addDeduction,
    removeDeduction,
    adjustSalary,
  } = useApp();

  const monthOptions = getAvailableMonthOptions(8);
  const currentMonthName = getLiveMonthName(getLiveMonthStr());

  const [selectedMonth, setSelectedMonth] = useState(currentMonthName);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<'All' | 'Salary' | 'Bonus'>('All');
  const [showAddDeductionModal, setShowAddDeductionModal] = useState(false);

  // New Deduction Form State
  const [deductionForm, setDeductionForm] = useState({
    employeeId: allEmployees[0]?.id || '',
    month: currentMonthName,
    date: getLiveDateStr(),
    deductionType: 'Late Arrival Penalty' as DeductionType,
    deductionCategory: 'Salary' as 'Salary' | 'Bonus',
    amount: 1000,
    reason: '',
    remarks: '',
  });

  const monthSalaries = salaryRecords.filter(s => s.month === selectedMonth);
  const monthDeductions = deductions.filter(d => d.month === selectedMonth);

  const filteredDeductions = monthDeductions.filter(d => {
    if (selectedCategoryFilter === 'All') return true;
    if (selectedCategoryFilter === 'Bonus') return d.deductionCategory === 'Bonus';
    return d.deductionCategory !== 'Bonus'; // Default 'Salary'
  });

  const totalBaseLiabilities = monthSalaries.reduce((acc, s) => acc + s.baseSalary, 0);
  const totalBonusLiabilities = monthSalaries.reduce((acc, s) => acc + s.bonus, 0);
  
  const totalSalaryDeductions = monthDeductions
    .filter(d => d.deductionCategory !== 'Bonus')
    .reduce((acc, d) => acc + d.amount, 0);

  const totalBonusDeductions = monthDeductions
    .filter(d => d.deductionCategory === 'Bonus')
    .reduce((acc, d) => acc + d.amount, 0);

  const totalAllDeductions = totalSalaryDeductions + totalBonusDeductions;

  const netSalaryDisbursement = totalBaseLiabilities - totalSalaryDeductions;
  const netBonusDisbursement = totalBonusLiabilities - totalBonusDeductions;

  const handleAddDeductionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetEmp = allEmployees.find(emp => emp.id === deductionForm.employeeId);
    addDeduction({
      ...deductionForm,
      employeeName: targetEmp?.fullName || 'Employee',
      status: 'Applied',
    });
    setShowAddDeductionModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-[#0c121e] border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <h1 className="text-xl font-bold font-['Space_Grotesk'] text-white">
              Payroll Liabilities & Itemized Deductions
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Reconcile Base Salary (Month-Start) & Performance Bonus (Mid-Month) cycles with segregated transparent deductions.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:ring-2 focus:ring-cyan-500"
          >
            {monthOptions.map(opt => (
              <option key={opt.key} value={opt.label}>
                {opt.label}
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowAddDeductionModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Apply Deduction</span>
          </button>
        </div>
      </div>

      {/* Segregated Cycle Payroll Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Cycle 1: Base Salary (Month-Start) */}
        <div className="p-4 rounded-xl bg-[#0c121e] border border-slate-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Cycle 1: Base Salary
            </span>
            <span className="px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 text-[9px] font-bold">1st-5th</span>
          </div>
          <p className="text-2xl font-bold font-mono text-white">
            {totalBaseLiabilities.toLocaleString()} <span className="text-xs text-slate-400">RS</span>
          </p>
          <div className="flex justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800">
            <span>Deductions: -{totalSalaryDeductions.toLocaleString()} RS</span>
            <span className="text-emerald-400 font-bold">Net: {netSalaryDisbursement.toLocaleString()} RS</span>
          </div>
        </div>

        {/* Cycle 2: KPI Bonus (Mid-Month) */}
        <div className="p-4 rounded-xl bg-[#0c121e] border border-slate-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
              Cycle 2: Mid-Month Bonus
            </span>
            <span className="px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 text-[9px] font-bold">15th</span>
          </div>
          <p className="text-2xl font-bold font-mono text-emerald-400">
            +{totalBonusLiabilities.toLocaleString()} <span className="text-xs text-slate-400">RS</span>
          </p>
          <div className="flex justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800">
            <span>Deductions: -{totalBonusDeductions.toLocaleString()} RS</span>
            <span className="text-amber-400 font-bold">Net: {netBonusDisbursement.toLocaleString()} RS</span>
          </div>
        </div>

        {/* Total Deductions Across Cycles */}
        <div className="p-4 rounded-xl bg-[#0c121e] border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider block">
            - Total Organization Deductions
          </span>
          <p className="text-2xl font-bold font-mono text-red-400">
            -{totalAllDeductions.toLocaleString()} <span className="text-xs text-slate-400">RS</span>
          </p>
          <span className="text-[10px] text-red-500">
            {monthDeductions.length} Total items ({monthDeductions.filter(d => d.deductionCategory !== 'Bonus').length} Salary, {monthDeductions.filter(d => d.deductionCategory === 'Bonus').length} Bonus)
          </span>
        </div>

        {/* Total Net Annualized / Monthly Outflow */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/80 to-slate-900 border border-emerald-700/60 space-y-1">
          <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider block">
            = Total Combined Disbursement
          </span>
          <p className="text-2xl font-black font-mono text-white">
            {(netSalaryDisbursement + netBonusDisbursement).toLocaleString()} <span className="text-xs text-emerald-300">RS</span>
          </p>
          <span className="text-[10px] text-emerald-400 font-semibold">Separate electronic advice issued</span>
        </div>
      </div>

      {/* Itemized Deductions Table with Category Filter & Reasons */}
      <div className="rounded-2xl bg-[#0c121e] border border-slate-800 overflow-hidden shadow-xl space-y-4 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-3">
          <div>
            <h2 className="text-sm font-bold text-white font-['Space_Grotesk']">
              Itemized Deductions Ledger for {selectedMonth}
            </h2>
            <p className="text-xs text-slate-400">
              Clear reason accountability for every applied deduction, tagged to either Salary (Month-Start) or Bonus (Mid-Month).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <div className="flex rounded-xl bg-slate-900 border border-slate-700 p-0.5 text-xs">
              <button
                onClick={() => setSelectedCategoryFilter('All')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  selectedCategoryFilter === 'All' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                All ({monthDeductions.length})
              </button>
              <button
                onClick={() => setSelectedCategoryFilter('Salary')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  selectedCategoryFilter === 'Salary' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Salary Cycle
              </button>
              <button
                onClick={() => setSelectedCategoryFilter('Bonus')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                  selectedCategoryFilter === 'Bonus' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Bonus Cycle
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3.5">Employee</th>
                <th className="p-3.5">Applied Cycle</th>
                <th className="p-3.5">Deduction Type</th>
                <th className="p-3.5">Amount (RS)</th>
                <th className="p-3.5">Transparent Justification / Reason</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredDeductions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No deductions recorded for {selectedMonth} under the selected filter.
                  </td>
                </tr>
              ) : (
                filteredDeductions.map(ded => {
                  const emp = allEmployees.find(e => e.id === ded.employeeId);
                  const isBonus = ded.deductionCategory === 'Bonus';

                  return (
                    <tr key={ded.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={emp?.profilePhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                            alt={ded.employeeName}
                            className="w-8 h-8 rounded-lg object-cover border border-slate-700 shrink-0"
                          />
                          <div>
                            <span className="font-bold text-white block">{ded.employeeName}</span>
                            <span className="font-mono text-[11px] text-cyan-400">{ded.employeeId}</span>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase border ${
                            isBonus
                              ? 'bg-amber-950/80 text-amber-300 border-amber-800/60'
                              : 'bg-blue-950/80 text-blue-300 border-blue-800/60'
                          }`}
                        >
                          {isBonus ? 'Bonus (Mid-Month)' : 'Salary (Month-Start)'}
                        </span>
                      </td>

                      <td className="p-3.5 font-medium text-slate-200">
                        {ded.deductionType}
                      </td>

                      <td className="p-3.5 font-mono font-bold text-red-400 text-sm">
                        -{ded.amount.toLocaleString()} RS
                      </td>

                      <td className="p-3.5 text-slate-300 max-w-sm">
                        <div className="flex items-start gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{ded.reason}</span>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-950 text-emerald-300 border border-emerald-800/60 uppercase">
                          {ded.status}
                        </span>
                      </td>

                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => removeDeduction(ded.id)}
                          className="p-1.5 rounded-lg bg-red-950/50 hover:bg-red-900/60 text-red-400 hover:text-red-200 border border-red-800/50 transition-colors cursor-pointer"
                          title="Remove deduction"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Add Deduction Modal */}
      {showAddDeductionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-lg my-8 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <h3 className="text-base font-bold text-white font-['Space_Grotesk']">
                  Apply Itemized Deduction
                </h3>
              </div>
              <button
                onClick={() => setShowAddDeductionModal(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddDeductionSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Target Employee *</label>
                  <select
                    value={deductionForm.employeeId}
                    onChange={e => setDeductionForm({ ...deductionForm, employeeId: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  >
                    {allEmployees.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.fullName} ({emp.id})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Disbursement Cycle *</label>
                  <select
                    value={deductionForm.deductionCategory}
                    onChange={e => setDeductionForm({ ...deductionForm, deductionCategory: e.target.value as 'Salary' | 'Bonus' })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  >
                    <option value="Salary">Salary Cycle (Month-Start 1st-5th)</option>
                    <option value="Bonus">Bonus Cycle (Mid-Month 15th)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Deduction Type *</label>
                  <select
                    value={deductionForm.deductionType}
                    onChange={e => setDeductionForm({ ...deductionForm, deductionType: e.target.value as DeductionType })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  >
                    <option value="Late Arrival Penalty">Late Arrival Penalty</option>
                    <option value="Unpaid Leave / Absenteeism">Unpaid Leave / Absenteeism</option>
                    <option value="Income Tax Withholding">Income Tax Withholding</option>
                    <option value="EOBI / Social Security">EOBI / Social Security</option>
                    <option value="Health Insurance Premium">Health Insurance Premium</option>
                    <option value="Advance Salary Repayment">Advance Salary Repayment</option>
                    <option value="Equipment Damage / Loss">Equipment Damage / Loss</option>
                    <option value="Disciplinary Penalty">Disciplinary Penalty</option>
                    <option value="Other Itemized Deduction">Other Itemized Deduction</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Amount (PKR / RS) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={deductionForm.amount}
                    onChange={e => setDeductionForm({ ...deductionForm, amount: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-red-400 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Transparent Reason & Justification * (Visible on Payslip)
                </label>
                <textarea
                  rows={3}
                  required
                  value={deductionForm.reason}
                  onChange={e => setDeductionForm({ ...deductionForm, reason: e.target.value })}
                  placeholder="e.g. 4 late arrivals beyond 15-minute grace period on Aug 12, 14, 18, 19. HR policy section 4.2 applied."
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddDeductionModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold cursor-pointer"
                >
                  Apply to {deductionForm.deductionCategory} Slip
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
