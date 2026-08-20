import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  DollarSign,
  TrendingDown,
  TrendingUp,
  FileText,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  Calendar,
  CreditCard,
  Building,
} from 'lucide-react';

export const EmployeeSalary: React.FC = () => {
  const {
    currentEmployee,
    salaryRecords,
    deductions,
    setSelectedPayslipForModal,
    payslips,
  } = useApp();

  const [selectedMonth, setSelectedMonth] = useState('August 2026');

  if (!currentEmployee) return null;

  const currentSal = salaryRecords.find(
    s => s.employeeId === currentEmployee.id && s.month === selectedMonth
  ) || {
    baseSalary: currentEmployee.monthlySalary,
    bonus: currentEmployee.currentBonus,
    otherEarnings: 5000,
    grossSalary: currentEmployee.monthlySalary + currentEmployee.currentBonus + 5000,
    totalDeductions: currentEmployee.currentDeductions,
    netSalary: currentEmployee.monthlySalary + currentEmployee.currentBonus + 5000 - currentEmployee.currentDeductions,
    paymentStatus: 'Processing' as const,
    currency: 'RS',
  };

  const itemizedDeductions = deductions.filter(
    d => d.employeeId === currentEmployee.id && d.month === selectedMonth
  );

  const matchedPayslip = payslips.find(
    p => p.employeeId === currentEmployee.id && p.salaryMonth === selectedMonth
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-[#0c121e] border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <h1 className="text-xl font-bold font-['Space_Grotesk'] text-white">
              My Salary & Deductions Breakdown
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Complete transparency into base pay, performance incentives, and itemized deduction reasons.
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

          {matchedPayslip && (
            <button
              onClick={() => setSelectedPayslipForModal(matchedPayslip)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>View Payslip</span>
            </button>
          )}
        </div>
      </div>

      {/* Salary Overview Formula Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Base */}
        <div className="p-5 rounded-2xl bg-[#0c121e] border border-slate-800 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Base Monthly Salary
          </span>
          <p className="text-2xl font-bold font-mono text-white">
            {currentSal.baseSalary.toLocaleString()} <span className="text-xs text-slate-400">RS</span>
          </p>
          <span className="text-[10px] text-slate-500">Contracted Base Tier</span>
        </div>

        {/* Bonus & Additions */}
        <div className="p-5 rounded-2xl bg-[#0c121e] border border-slate-800 space-y-1">
          <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
            + Bonus & Allowances
          </span>
          <p className="text-2xl font-bold font-mono text-emerald-400">
            +{(currentSal.bonus + (currentSal.otherEarnings || 0)).toLocaleString()} <span className="text-xs text-slate-400">RS</span>
          </p>
          <span className="text-[10px] text-emerald-500">Performance & Shift Differentials</span>
        </div>

        {/* Deductions */}
        <div className="p-5 rounded-2xl bg-[#0c121e] border border-slate-800 space-y-1">
          <span className="text-[11px] font-bold text-red-400 uppercase tracking-wider block">
            - Total Deductions
          </span>
          <p className="text-2xl font-bold font-mono text-red-400">
            -{currentSal.totalDeductions.toLocaleString()} <span className="text-xs text-slate-400">RS</span>
          </p>
          <span className="text-[10px] text-red-500">{itemizedDeductions.length} Applied deductions</span>
        </div>

        {/* Net Take-Home */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/80 to-slate-900 border border-emerald-700/60 space-y-1">
          <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider block">
            = Net Take-Home Pay
          </span>
          <p className="text-2xl font-black font-mono text-white">
            {currentSal.netSalary.toLocaleString()} <span className="text-xs text-emerald-300">RS (PKR)</span>
          </p>
          <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
            <CheckCircle2 className="w-3 h-3" />
            <span>Status: {currentSal.paymentStatus}</span>
          </div>
        </div>
      </div>

      {/* Itemized Deductions Section with Transparent Explanations */}
      <div className="rounded-2xl bg-[#0c121e] border border-slate-800 overflow-hidden shadow-xl space-y-4 p-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <div>
              <h2 className="text-sm font-bold text-white font-['Space_Grotesk']">
                Itemized Deductions & Policy Reasons
              </h2>
              <p className="text-xs text-slate-400">
                "Why was this amount deducted?" — Transparent reasons for every applied adjustment.
              </p>
            </div>
          </div>
        </div>

        {itemizedDeductions.length === 0 ? (
          <div className="p-8 text-center bg-slate-950/40 rounded-xl border border-slate-800 text-slate-400 text-xs">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
            <p className="font-semibold text-white">Zero Deductions Logged</p>
            <p className="text-[11px] text-slate-500">No penalties, unpaid leaves, or advance installments for {selectedMonth}.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {itemizedDeductions.map(d => (
              <div
                key={d.id}
                className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-colors space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-md bg-red-950 text-red-300 border border-red-800/60 uppercase">
                      {d.deductionType}
                    </span>
                    <span className="font-mono text-xs text-slate-400">{d.date}</span>
                  </div>
                  <span className="font-mono font-bold text-red-400 text-sm">
                    -{d.amount.toLocaleString()} RS
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-900/90 text-xs border border-slate-800/80">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                    Clear Transparency Reason:
                  </span>
                  <p className="text-slate-200 font-medium leading-relaxed">{d.reason}</p>
                  {d.remarks && (
                    <p className="text-[11px] text-slate-400 mt-1 italic">
                      Remarks: {d.remarks}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Direct Deposit Information Card */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <CreditCard className="w-6 h-6 text-cyan-400 shrink-0" />
          <div>
            <p className="font-bold text-slate-200">Disbursement Direct Deposit Account</p>
            <p className="text-slate-400">
              Bank: <strong>{currentEmployee.bankName || 'Meezan Bank'}</strong> • A/C: <span className="font-mono text-cyan-300">{currentEmployee.bankAccountNumber || 'PK36MEZN0001122334455667'}</span>
            </p>
          </div>
        </div>
        <span className="px-3 py-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 rounded-xl">
          Automated EFT Transfer
        </span>
      </div>
    </div>
  );
};
