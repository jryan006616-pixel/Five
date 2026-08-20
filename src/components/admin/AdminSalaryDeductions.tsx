import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DeductionType } from '../../types';
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
} from 'lucide-react';

export const AdminSalaryDeductions: React.FC = () => {
  const {
    allEmployees,
    salaryRecords,
    deductions,
    addDeduction,
    removeDeduction,
    updateSalary,
  } = useApp();

  const [selectedMonth, setSelectedMonth] = useState('August 2026');
  const [showAddDeductionModal, setShowAddDeductionModal] = useState(false);

  // New Deduction Form State
  const [deductionForm, setDeductionForm] = useState({
    employeeId: allEmployees[0]?.id || '',
    month: 'August 2026',
    date: '2026-08-20',
    deductionType: 'Late Arrival Penalty' as DeductionType,
    amount: 1000,
    reason: '',
    remarks: '',
  });

  const monthSalaries = salaryRecords.filter(s => s.month === selectedMonth);
  const monthDeductions = deductions.filter(d => d.month === selectedMonth);

  const totalBaseLiabilities = monthSalaries.reduce((acc, s) => acc + s.baseSalary, 0);
  const totalBonusLiabilities = monthSalaries.reduce((acc, s) => acc + s.bonus, 0);
  const totalDeductionsApplied = monthDeductions.reduce((acc, d) => acc + d.amount, 0);
  const totalNetDisbursement = totalBaseLiabilities + totalBonusLiabilities - totalDeductionsApplied;

  const handleAddDeductionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addDeduction(deductionForm);
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
            Corporate payroll reconciliation, base salaries, and transparent deduction governance with mandatory reasons.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:ring-2 focus:ring-cyan-500"
          >
            <option value="August 2026">August 2026</option>
            <option value="July 2026">July 2026</option>
            <option value="June 2026">June 2026</option>
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

      {/* Organization Payroll Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#0c121e] border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Base Salary Payroll
          </span>
          <p className="text-2xl font-bold font-mono text-white">
            {totalBaseLiabilities.toLocaleString()} <span className="text-xs text-slate-400">RS</span>
          </p>
          <span className="text-[10px] text-slate-500">{monthSalaries.length} Contracted staff</span>
        </div>

        <div className="p-4 rounded-xl bg-[#0c121e] border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
            + Total Approved Bonuses
          </span>
          <p className="text-2xl font-bold font-mono text-emerald-400">
            +{totalBonusLiabilities.toLocaleString()} <span className="text-xs text-slate-400">RS</span>
          </p>
          <span className="text-[10px] text-emerald-500">Quality & volume incentives</span>
        </div>

        <div className="p-4 rounded-xl bg-[#0c121e] border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider block">
            - Total Applied Deductions
          </span>
          <p className="text-2xl font-bold font-mono text-red-400">
            -{totalDeductionsApplied.toLocaleString()} <span className="text-xs text-slate-400">RS</span>
          </p>
          <span className="text-[10px] text-red-500">{monthDeductions.length} Total items</span>
        </div>

        <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/80 to-slate-900 border border-emerald-700/60 space-y-1">
          <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider block">
            = Total Net Disbursement
          </span>
          <p className="text-2xl font-black font-mono text-white">
            {totalNetDisbursement.toLocaleString()} <span className="text-xs text-emerald-300">RS (PKR)</span>
          </p>
          <span className="text-[10px] text-emerald-400 font-semibold">Ready for EFT batch processing</span>
        </div>
      </div>

      {/* Itemized Deductions Table with Explicit Reasons */}
      <div className="rounded-2xl bg-[#0c121e] border border-slate-800 overflow-hidden shadow-xl space-y-4 p-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-bold text-white font-['Space_Grotesk']">
              Itemized Deductions Ledger for {selectedMonth}
            </h2>
            <p className="text-xs text-slate-400">
              Clear reason accountability for every applied deduction across the organization.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">{monthDeductions.length} recorded</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3.5">Employee</th>
                <th className="p-3.5">Deduction Type</th>
                <th className="p-3.5">Amount (RS)</th>
                <th className="p-3.5">Mandatory Reason Explanation</th>
                <th className="p-3.5">Audit Remarks</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {monthDeductions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No deductions applied for {selectedMonth}.
                  </td>
                </tr>
              ) : (
                monthDeductions.map(d => (
                  <tr key={d.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-3.5 font-semibold text-white">
                      {d.employeeName}
                    </td>

                    <td className="p-3.5">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-red-950 text-red-300 border border-red-800/60 uppercase">
                        {d.deductionType}
                      </span>
                    </td>

                    <td className="p-3.5 font-mono font-bold text-red-400">
                      -{d.amount.toLocaleString()} RS
                    </td>

                    <td className="p-3.5 text-[11px] text-slate-200 max-w-sm">
                      {d.reason}
                    </td>

                    <td className="p-3.5 text-[11px] text-slate-400">
                      {d.remarks || '--'}
                    </td>

                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => removeDeduction(d.id)}
                        className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 text-red-400 hover:text-red-200 transition-colors"
                        title="Remove Deduction"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Deduction Modal */}
      {showAddDeductionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-md my-8 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <h3 className="text-base font-bold text-white font-['Space_Grotesk']">
                  Apply Itemized Salary Deduction
                </h3>
              </div>
              <button
                onClick={() => setShowAddDeductionModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddDeductionSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Target Employee *</label>
                <select
                  value={deductionForm.employeeId}
                  onChange={e => setDeductionForm({ ...deductionForm, employeeId: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                >
                  {allEmployees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.fullName} ({emp.id}) - {emp.department}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Deduction Type *</label>
                  <select
                    value={deductionForm.deductionType}
                    onChange={e => setDeductionForm({ ...deductionForm, deductionType: e.target.value as DeductionType })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  >
                    <option value="Late Arrival Penalty">Late Arrival Penalty</option>
                    <option value="Excessive Break / Outside Time">Excessive Break / Outside Time</option>
                    <option value="Unpaid Leave">Unpaid Leave</option>
                    <option value="Salary Advance Recovery">Salary Advance Recovery</option>
                    <option value="Medical Billing Error Penalty">Medical Billing Error Penalty</option>
                    <option value="Tax / Other">Tax / Other Deduction</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Amount (PKR / RS) *</label>
                  <input
                    type="number"
                    required
                    value={deductionForm.amount}
                    onChange={e => setDeductionForm({ ...deductionForm, amount: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-red-400 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Mandatory Reason ("Why was this deducted?") *
                </label>
                <textarea
                  rows={3}
                  required
                  value={deductionForm.reason}
                  onChange={e => setDeductionForm({ ...deductionForm, reason: e.target.value })}
                  placeholder="Provide precise explanation to ensure transparency on employee's salary slip."
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Audit Remarks / Policy Ref</label>
                <input
                  type="text"
                  value={deductionForm.remarks}
                  onChange={e => setDeductionForm({ ...deductionForm, remarks: e.target.value })}
                  placeholder="e.g. HR Attendance Policy clause 4.2"
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddDeductionModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold"
                >
                  Apply & Record Deduction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
