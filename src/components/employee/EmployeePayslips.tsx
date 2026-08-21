import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FileText,
  Printer,
  Download,
  Calendar,
  DollarSign,
  ShieldCheck,
  Building,
  CheckCircle2,
  Award,
  Filter,
} from 'lucide-react';

export const EmployeePayslips: React.FC = () => {
  const { currentEmployee, payslips, setSelectedPayslipForModal } = useApp();
  const [activeTab, setActiveTab] = useState<'All' | 'Salary' | 'Bonus'>('All');

  if (!currentEmployee) return null;

  const userPayslips = payslips.filter(p => p.employeeId === currentEmployee.id);

  const filteredSlips = userPayslips.filter(p => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Bonus') return p.slipType === 'Bonus';
    return p.slipType !== 'Bonus';
  });

  const salaryCount = userPayslips.filter(p => p.slipType !== 'Bonus').length;
  const bonusCount = userPayslips.filter(p => p.slipType === 'Bonus').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-[#0c121e] border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl font-bold font-['Space_Grotesk'] text-white">
              My Official Compensation Slips
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Access segregated <strong>Base Salary Slips (Month-Start)</strong> and <strong>KPI Performance Bonus Slips (Mid-Month)</strong> with full itemized deduction transparency.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-slate-300">
            Available Documents: <strong>{userPayslips.length} Total</strong>
          </span>
        </div>
      </div>

      {/* Cycle Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-[#0c121e] border border-slate-800">
        <div className="flex rounded-xl bg-slate-900 border border-slate-700 p-0.5 text-xs">
          <button
            onClick={() => setActiveTab('All')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              activeTab === 'All' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            All Documents ({userPayslips.length})
          </button>
          <button
            onClick={() => setActiveTab('Salary')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              activeTab === 'Salary' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Salary Slips ({salaryCount})</span>
          </button>
          <button
            onClick={() => setActiveTab('Bonus')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
              activeTab === 'Bonus' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>KPI Bonus Slips ({bonusCount})</span>
          </button>
        </div>

        <span className="text-[11px] text-slate-400">
          Cycle 1: 1st-5th of Month (Salary) • Cycle 2: 15th of Month (Bonus)
        </span>
      </div>

      {/* Payslips Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSlips.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-[#0c121e] rounded-2xl border border-slate-800 text-slate-400 text-xs">
            <FileText className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="font-semibold text-slate-300">No Documents Found</p>
            <p className="text-[11px] text-slate-500 mt-1">
              Your HR Administrator will generate your electronic advice according to the disbursement cycle.
            </p>
          </div>
        ) : (
          filteredSlips.map(ps => {
            const isBonus = ps.slipType === 'Bonus';

            return (
              <div
                key={ps.id}
                className={`rounded-2xl bg-[#0c121e] border p-5 shadow-lg transition-all space-y-4 flex flex-col justify-between group ${
                  isBonus
                    ? 'border-amber-900/60 hover:border-amber-600/80'
                    : 'border-blue-900/60 hover:border-cyan-600/80'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2.5 py-0.5 text-[10px] font-mono font-bold rounded-md uppercase border flex items-center gap-1 ${
                        isBonus
                          ? 'bg-amber-950 text-amber-300 border-amber-800'
                          : 'bg-blue-950 text-blue-300 border-blue-800'
                      }`}
                    >
                      {isBonus ? <Award className="w-3 h-3 text-amber-400" /> : <Calendar className="w-3 h-3 text-blue-400" />}
                      {ps.payslipNumber}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Disbursed
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        {isBonus ? 'Mid-Month KPI Bonus Slip' : 'Monthly Base Salary Slip'}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {isBonus ? '15th Mid-Month' : '1st-5th Month-Start'}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white font-['Space_Grotesk'] mt-0.5">
                      {ps.salaryMonth} {ps.year}
                    </h3>
                    <p className="text-[11px] text-slate-400">Payment Date: {ps.paymentDate}</p>
                  </div>

                  {/* If Bonus Slip: Show 10-Point Score Summary */}
                  {isBonus && (
                    <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-800/40 text-xs flex items-center justify-between">
                      <span className="text-slate-300 text-[11px]">10-Pt KPI Score:</span>
                      <span className="font-mono font-bold text-amber-300">
                        {ps.totalKpiPoints !== undefined ? `${ps.totalKpiPoints}/10` : `${((ps.kpiScore || 90) / 10).toFixed(1)}/10`} ({ps.hrPoints || 3} HR + {ps.productivityPoints || 6.5} Prod)
                      </span>
                    </div>
                  )}

                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs space-y-1.5">
                    <div className="flex justify-between text-slate-300">
                      <span>{isBonus ? 'Bonus Incentive:' : 'Base Monthly Earnings:'}</span>
                      <span className="font-mono text-white">{ps.grossSalary.toLocaleString()} RS</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Itemized Deductions:</span>
                      <span className="font-mono text-red-400">
                        {ps.totalDeductions > 0 ? `-${ps.totalDeductions.toLocaleString()} RS` : '0 RS'}
                      </span>
                    </div>
                    <div className="pt-1.5 border-t border-slate-800 flex justify-between font-bold text-white">
                      <span>Net Take-Home:</span>
                      <span className="font-mono text-emerald-400 text-sm">
                        {ps.netSalary.toLocaleString()} RS
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => setSelectedPayslipForModal(ps)}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-colors shadow-sm cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>View Slip</span>
                  </button>
                  <button
                    onClick={() => setSelectedPayslipForModal(ps)}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print / PDF</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
