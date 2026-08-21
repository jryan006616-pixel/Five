import React from 'react';
import { Payslip } from '../../types';
import { RhinomdsLogo } from './RhinomdsLogo';
import {
  Printer,
  Download,
  X,
  ShieldCheck,
  Building,
  Calendar,
  DollarSign,
  CheckCircle2,
  Award,
  Clock,
  Zap,
  Star,
  AlertCircle,
} from 'lucide-react';

interface PayslipModalProps {
  payslip: Payslip | null;
  onClose: () => void;
}

export const PayslipModal: React.FC<PayslipModalProps> = ({ payslip, onClose }) => {
  if (!payslip) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    window.print();
  };

  const isBonusSlip = payslip.slipType === 'Bonus';

  // 10-Point Model calculations
  const hrPts = payslip.hrPoints !== undefined ? payslip.hrPoints : 3.0;
  const prodPts = payslip.productivityPoints !== undefined ? payslip.productivityPoints : 6.5;
  const totalPts = payslip.totalKpiPoints !== undefined ? payslip.totalKpiPoints : Number((hrPts + prodPts).toFixed(1));
  const scorePct = payslip.kpiScore !== undefined ? payslip.kpiScore : Math.round((totalPts / 10) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl my-auto sm:my-4 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Top Control Bar (Hidden when printing) */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 bg-slate-950 border-b border-slate-800 shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            <span className="text-sm font-bold text-white">
              {isBonusSlip ? 'Official Rhinomds KPI Bonus Advice' : 'Official Rhinomds Salary Slip'}
            </span>
            <span
              className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded border ${
                isBonusSlip
                  ? 'bg-amber-950 text-amber-300 border-amber-800'
                  : 'bg-cyan-950 text-cyan-300 border-cyan-800'
              }`}
            >
              {payslip.payslipNumber}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-xs font-semibold text-white transition-colors shadow-sm cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print Document</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div id="printable-payslip" className="flex-1 overflow-y-auto p-5 sm:p-8 bg-slate-900 text-slate-100 print:bg-white print:text-black print:p-6 relative">
          
          {/* Subtle Watermark background */}
          <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none select-none">
            <span className="text-9xl font-black tracking-widest uppercase">RHINOMDS</span>
          </div>

          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-800 print:border-slate-300 gap-4">
            <RhinomdsLogo size="md" />
            <div className="text-left sm:text-right text-xs text-slate-400 print:text-slate-600 space-y-0.5">
              <p className="font-bold text-slate-200 print:text-black">RHINOMDS HEALTHCARE LLC</p>
              <p>US HQ: Post Oak Blvd, Houston, TX 77056, USA</p>
              <p>RCM Operations Center: PECHS Block 6, Karachi</p>
              <p className="font-mono text-cyan-400 print:text-cyan-700 font-semibold">
                https://rhinomds.com • payroll@rhinomds.com
              </p>
            </div>
          </div>

          {/* Document Title Banner */}
          <div className="my-6 p-4 rounded-xl bg-slate-800/80 print:bg-slate-100 border border-slate-700/80 print:border-slate-300 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs gap-3">
            <div>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider block ${
                  isBonusSlip ? 'text-amber-400 print:text-amber-700' : 'text-cyan-400 print:text-cyan-700'
                }`}
              >
                {isBonusSlip
                  ? 'MID-MONTH PERFORMANCE INCENTIVE ADVICE (CYCLE 2: 15TH)'
                  : 'MONTHLY BASE COMPENSATION ADVICE (CYCLE 1: 1ST-5TH)'}
              </span>
              <h2 className="text-lg font-bold text-white print:text-black font-['Space_Grotesk'] mt-0.5">
                {isBonusSlip
                  ? `KPI Performance Bonus Advice — ${payslip.salaryMonth} ${payslip.year}`
                  : `Monthly Base Salary Slip — ${payslip.salaryMonth} ${payslip.year}`}
              </h2>
            </div>
            <div className="text-left sm:text-right font-mono text-[11px] text-slate-300 print:text-slate-700">
              <p>
                Ref #: <strong className="text-cyan-300 print:text-black">{payslip.payslipNumber}</strong>
              </p>
              <p>Disbursement Date: <strong>{payslip.paymentDate}</strong></p>
              <p>Cycle: <strong>{isBonusSlip ? 'Mid-Month (15th)' : 'Month-Start (1st-5th)'}</strong></p>
            </div>
          </div>

          {/* Employee Information 2-Column Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-950/60 print:bg-slate-50 border border-slate-800 print:border-slate-200 text-xs mb-6">
            <div className="space-y-1.5">
              <div className="flex justify-between py-0.5 border-b border-slate-800/60 print:border-slate-200">
                <span className="text-slate-400 print:text-slate-600">Employee Name:</span>
                <span className="font-bold text-white print:text-black">{payslip.employeeName}</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-slate-800/60 print:border-slate-200">
                <span className="text-slate-400 print:text-slate-600">Employee ID:</span>
                <span className="font-mono font-bold text-cyan-300 print:text-cyan-800">{payslip.employeeCode}</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-slate-800/60 print:border-slate-200">
                <span className="text-slate-400 print:text-slate-600">Designation:</span>
                <span className="font-medium text-slate-200 print:text-slate-800">{payslip.designation}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between py-0.5 border-b border-slate-800/60 print:border-slate-200">
                <span className="text-slate-400 print:text-slate-600">Department:</span>
                <span className="font-medium text-slate-200 print:text-slate-800">{payslip.department}</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-slate-800/60 print:border-slate-200">
                <span className="text-slate-400 print:text-slate-600">Date of Joining:</span>
                <span className="text-slate-300 print:text-slate-700">{payslip.dateOfJoining}</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-slate-800/60 print:border-slate-200">
                <span className="text-slate-400 print:text-slate-600">Disbursement Currency:</span>
                <span className="font-bold text-emerald-400 print:text-emerald-700">Pakistani Rupee (PKR / RS)</span>
              </div>
            </div>
          </div>

          {/* If BONUS SLIP: 10-Point Score & Remarks Breakdown Card */}
          {isBonusSlip && (
            <div className="p-4 rounded-xl bg-amber-950/30 print:bg-amber-50 border border-amber-800/50 print:border-amber-200 mb-6 space-y-3">
              <div className="flex items-center justify-between border-b border-amber-800/40 print:border-amber-200 pb-2">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400 print:text-amber-700" />
                  <span className="text-xs font-bold text-amber-300 print:text-amber-900 uppercase tracking-wider">
                    Official 10-Point KPI Appraisal Breakdown
                  </span>
                </div>
                <div className="font-mono text-sm font-black text-amber-300 print:text-amber-800">
                  {totalPts} / 10.0 Points ({scorePct}%)
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-950/60 print:bg-white border border-slate-800 print:border-slate-200 space-y-1">
                  <div className="flex justify-between font-bold">
                    <span className="text-blue-300 print:text-blue-700 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Part 1: HR Score
                    </span>
                    <span className="font-mono text-blue-300 print:text-blue-800">{hrPts} / 3.0 Points</span>
                  </div>
                  <p className="text-[10px] text-slate-400 print:text-slate-600">
                    Shift punctuality, grace period compliance, break adherence, and policy conduct.
                  </p>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950/60 print:bg-white border border-slate-800 print:border-slate-200 space-y-1">
                  <div className="flex justify-between font-bold">
                    <span className="text-purple-300 print:text-purple-700 flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5" /> Part 2: Productivity Score
                    </span>
                    <span className="font-mono text-purple-300 print:text-purple-800">{prodPts} / 7.0 Points</span>
                  </div>
                  <p className="text-[10px] text-slate-400 print:text-slate-600">
                    Claim turnaround speed, first-pass accuracy rate, and monthly target achievements.
                  </p>
                </div>
              </div>

              {payslip.kpiBonusReason && (
                <div className="text-xs pt-1">
                  <span className="text-slate-400 print:text-slate-600 font-bold block">Incentive Justification:</span>
                  <p className="text-slate-200 print:text-black italic">{payslip.kpiBonusReason}</p>
                </div>
              )}
            </div>
          )}

          {/* Earnings & Deductions Tables */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Earnings Column */}
            <div className="rounded-xl border border-slate-800 print:border-slate-300 overflow-hidden">
              <div className="px-4 py-2.5 bg-emerald-950/40 print:bg-emerald-50 border-b border-emerald-900/40 print:border-emerald-200 text-xs font-bold text-emerald-300 print:text-emerald-800 uppercase tracking-wider flex items-center justify-between">
                <span>{isBonusSlip ? 'Bonus Incentive Allocation' : 'Base Earnings & Additions'}</span>
                <span>Amount (RS)</span>
              </div>
              <div className="p-3 text-xs space-y-2">
                {!isBonusSlip ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-slate-300 print:text-slate-700">Base Monthly Fixed Salary</span>
                      <span className="font-mono font-semibold text-slate-100 print:text-black">
                        {payslip.baseSalary.toLocaleString()} RS
                      </span>
                    </div>
                    {payslip.otherEarnings > 0 && (
                      <div className="flex justify-between">
                        <span className="text-slate-300 print:text-slate-700">US Night Shift Differential</span>
                        <span className="font-mono font-semibold text-sky-400 print:text-sky-700">
                          +{payslip.otherEarnings.toLocaleString()} RS
                        </span>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span className="text-slate-300 print:text-slate-700">
                        10-Pt KPI Performance Bonus ({totalPts}/10)
                      </span>
                      <span className="font-mono font-semibold text-emerald-400 print:text-emerald-700">
                        +{payslip.bonus.toLocaleString()} RS
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-400 print:text-slate-600">
                      <span>• HR Component (3 Pts Max)</span>
                      <span className="font-mono text-blue-400">{hrPts} Pts</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-400 print:text-slate-600">
                      <span>• Productivity Component (7 Pts Max)</span>
                      <span className="font-mono text-purple-400">{prodPts} Pts</span>
                    </div>
                  </>
                )}

                <div className="pt-2 border-t border-slate-800 print:border-slate-300 flex justify-between font-bold text-white print:text-black">
                  <span>Gross {isBonusSlip ? 'Bonus Allocated' : 'Salary Earnings'}</span>
                  <span className="font-mono text-emerald-400 print:text-emerald-700">
                    {payslip.grossSalary.toLocaleString()} RS
                  </span>
                </div>
              </div>
            </div>

            {/* Deductions Column with Explicit Transparent Reasons */}
            <div className="rounded-xl border border-slate-800 print:border-slate-300 overflow-hidden">
              <div className="px-4 py-2.5 bg-red-950/40 print:bg-red-50 border-b border-red-900/40 print:border-red-200 text-xs font-bold text-red-300 print:text-red-800 uppercase tracking-wider flex items-center justify-between">
                <span>{isBonusSlip ? 'Bonus Adjustments & Deductions' : 'Salary Itemized Deductions'}</span>
                <span>Amount (RS)</span>
              </div>
              <div className="p-3 text-xs space-y-2">
                {payslip.deductionsList.length === 0 ? (
                  <p className="text-slate-500 italic py-2 text-center">
                    No deductions applied for this {isBonusSlip ? 'bonus' : 'salary'} cycle.
                  </p>
                ) : (
                  payslip.deductionsList.map((d, i) => (
                    <div key={i} className="pb-1.5 border-b border-slate-800/40 print:border-slate-200 last:border-0">
                      <div className="flex justify-between font-medium">
                        <span className="text-slate-200 print:text-slate-800">{d.type}</span>
                        <span className="font-mono text-red-400 print:text-red-700">-{d.amount.toLocaleString()} RS</span>
                      </div>
                      <p className="text-[10px] text-slate-400 print:text-slate-600 mt-0.5">
                        <strong>Reason:</strong> {d.reason}
                      </p>
                    </div>
                  ))
                )}
                <div className="pt-2 border-t border-slate-800 print:border-slate-300 flex justify-between font-bold text-white print:text-black">
                  <span>Total {isBonusSlip ? 'Bonus Deductions' : 'Salary Deductions'}</span>
                  <span className="font-mono text-red-400 print:text-red-700">
                    -{payslip.totalDeductions.toLocaleString()} RS
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Final Net Pay Highlight Card */}
          <div
            className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 ${
              isBonusSlip
                ? 'bg-gradient-to-r from-amber-950/80 via-slate-900 to-slate-950 print:bg-slate-100 border-amber-700/60 print:border-slate-400'
                : 'bg-gradient-to-r from-cyan-950/80 via-slate-900 to-slate-950 print:bg-slate-100 border-cyan-700/60 print:border-slate-400'
            }`}
          >
            <div>
              <span
                className={`text-[11px] font-bold uppercase tracking-wider block ${
                  isBonusSlip ? 'text-amber-400 print:text-slate-700' : 'text-cyan-400 print:text-slate-700'
                }`}
              >
                {isBonusSlip ? 'TOTAL NET DISBURSED PERFORMANCE BONUS' : 'TOTAL NET TAKE-HOME SALARY'}
              </span>
              <p className="text-2xl sm:text-3xl font-black font-['Space_Grotesk'] text-white print:text-black">
                {payslip.netSalary.toLocaleString()}{' '}
                <span className="text-lg font-bold text-cyan-300 print:text-slate-700">RS (PKR)</span>
              </p>
              <p className="text-[11px] text-slate-400 print:text-slate-600 mt-0.5">
                (Gross {payslip.grossSalary.toLocaleString()} RS - Deductions {payslip.totalDeductions.toLocaleString()} RS)
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/80 print:bg-emerald-100 border border-emerald-700/60 print:border-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 print:text-emerald-700" />
              <span className="text-xs font-bold text-emerald-300 print:text-emerald-800">
                Payment Disbursed
              </span>
            </div>
          </div>

          {/* Signatures and Authority */}
          <div className="pt-6 border-t border-slate-800 print:border-slate-300 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div className="text-slate-400 print:text-slate-600 space-y-1">
              <p><strong>Payment Mode:</strong> Electronic Bank Transfer (Meezan / HBL / SCB)</p>
              <p><strong>Authorized By:</strong> {payslip.authorizedBy}</p>
              <p><strong>Timestamp:</strong> {payslip.generatedAt}</p>
            </div>

            <div className="text-left sm:text-right space-y-2">
              <div className="inline-block border-b border-slate-700 print:border-slate-400 pb-1 w-48 text-center font-serif italic text-cyan-300 print:text-black">
                Sarah Jenkins
              </div>
              <p className="text-[11px] text-slate-400 print:text-slate-600">
                Authorized Signatory • Rhinomds Global Payroll
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/60 print:border-slate-200 text-center text-[10px] text-slate-500 print:text-slate-600">
            This is a computer-generated official payslip from Rhinomds Medical Billing & RCM Portal and requires no physical seal.
          </div>
        </div>
      </div>
    </div>
  );
};
