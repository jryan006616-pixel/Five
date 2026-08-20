import React from 'react';
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
} from 'lucide-react';

export const EmployeePayslips: React.FC = () => {
  const { currentEmployee, payslips, setSelectedPayslipForModal } = useApp();

  if (!currentEmployee) return null;

  const userPayslips = payslips.filter(p => p.employeeId === currentEmployee.id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-[#0c121e] border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl font-bold font-['Space_Grotesk'] text-white">
              My Official Salary Slips
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Browse, print, and export official Rhinomds Monthly Compensation Advice documents.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-slate-300">Authorized e-Payslips: <strong>{userPayslips.length} Available</strong></span>
        </div>
      </div>

      {/* Payslips Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {userPayslips.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-[#0c121e] rounded-2xl border border-slate-800 text-slate-400 text-xs">
            <FileText className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="font-semibold text-slate-300">No Generated Payslips Yet</p>
            <p className="text-[11px] text-slate-500">Your HR Administrator will generate your payslip at monthly pay disbursement.</p>
          </div>
        ) : (
          userPayslips.map(ps => (
            <div
              key={ps.id}
              className="rounded-2xl bg-[#0c121e] border border-slate-800 hover:border-cyan-700/60 p-5 shadow-lg transition-all space-y-4 flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold rounded-md bg-cyan-950 text-cyan-300 border border-cyan-800">
                    {ps.payslipNumber}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Disbursed
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Pay Period
                  </span>
                  <h3 className="text-base font-bold text-white font-['Space_Grotesk']">
                    {ps.salaryMonth} {ps.year}
                  </h3>
                  <p className="text-[11px] text-slate-400">Payment Date: {ps.paymentDate}</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs space-y-1.5">
                  <div className="flex justify-between text-slate-300">
                    <span>Gross Earnings:</span>
                    <span className="font-mono text-white">{ps.grossSalary.toLocaleString()} RS</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Total Deductions:</span>
                    <span className="font-mono text-red-400">-{ps.totalDeductions.toLocaleString()} RS</span>
                  </div>
                  <div className="pt-1.5 border-t border-slate-800 flex justify-between font-bold text-white">
                    <span>Net Paid:</span>
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
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-colors shadow-sm shadow-cyan-950/40"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>View Slip</span>
                </button>
                <button
                  onClick={() => setSelectedPayslipForModal(ps)}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / PDF</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
