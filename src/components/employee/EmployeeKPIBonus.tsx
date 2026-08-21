import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Award,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  DollarSign,
  Star,
  Activity,
  FileCheck,
  Zap,
  Clock,
  Briefcase,
} from 'lucide-react';

export const EmployeeKPIBonus: React.FC = () => {
  const { currentEmployee, kpiRecords } = useApp();

  if (!currentEmployee) return null;

  const records = kpiRecords.filter(k => k.employeeId === currentEmployee.id);
  const currentKPI = records[0]; // Most recent

  const hrPoints = currentKPI?.hrPoints !== undefined ? currentKPI.hrPoints : 3.0;
  const prodPoints = currentKPI?.productivityPoints !== undefined ? currentKPI.productivityPoints : 6.5;
  const totalPoints = currentKPI?.totalPoints !== undefined ? currentKPI.totalPoints : Number((hrPoints + prodPoints).toFixed(1));
  const scorePct = currentKPI?.kpiScore !== undefined ? currentKPI.kpiScore : Math.round((totalPoints / 10) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-[#0c121e] border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl font-bold font-['Space_Grotesk'] text-white">
              My KPI & Mid-Month Performance Bonus
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            <strong>10-Point Evaluation Model:</strong> 3 Points HR (Attendance & Conduct) + 7 Points Productivity (Accuracy & Volume). Disbursed at Mid-Month (15th).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-amber-950/60 border border-amber-800/60 text-right">
            <span className="text-[10px] text-amber-300 font-bold uppercase block">Disbursement Cycle</span>
            <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> 15th of Every Month
            </span>
          </div>
        </div>
      </div>

      {/* Hero KPI Card for Latest Month */}
      {currentKPI ? (
        <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-cyan-800/60 p-6 shadow-xl relative overflow-hidden space-y-6">
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-4 gap-6 items-center">
            {/* KPI 10-Point Score Block */}
            <div className="lg:col-span-1 p-5 rounded-2xl bg-[#0a0f1d] border border-slate-800 text-center space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {currentKPI.month} Overall Score
              </span>
              <div className="text-4xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">
                {totalPoints} <span className="text-xl font-normal text-slate-400">/ 10</span>
              </div>
              <div className="text-xs font-mono font-bold text-cyan-300">
                {scorePct}% Performance Rating
              </div>
              <div className="flex items-center justify-center gap-1 text-amber-400 text-xs pt-1">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <Star className="w-3.5 h-3.5 fill-amber-400" />
              </div>
            </div>

            {/* Performance Details & Bonus */}
            <div className="lg:col-span-3 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 uppercase">
                      Status: {currentKPI.bonusStatus}
                    </span>
                    <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-950 text-amber-300 border border-amber-800 uppercase">
                      Mid-Month Pay: 15th
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white font-['Space_Grotesk'] mt-1.5">
                    {currentKPI.bonusReason}
                  </h3>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Approved Bonus Payout</span>
                  <span className="text-2xl font-bold font-mono text-emerald-400">
                    +{currentKPI.bonusAmount.toLocaleString()} <span className="text-xs text-slate-400">RS (PKR)</span>
                  </span>
                </div>
              </div>

              {/* 2-Part Breakdown: 3 Points HR + 7 Points Productivity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {/* Part 1: HR Points (3 Max) */}
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-blue-900/60 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-blue-400" />
                      <span className="text-xs font-bold text-white">HR Bonus Points</span>
                    </div>
                    <span className="font-mono font-bold text-blue-300 text-sm">
                      {hrPoints} / 3.0 Points
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {currentKPI.hrRemarks || 'Punctual check-ins, zero grace period violations, and strict adherence to shift rosters.'}
                  </p>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                    <div
                      className="bg-blue-400 h-full rounded-full"
                      style={{ width: `${Math.min(100, (hrPoints / 3) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Part 2: Productivity Points (7 Max) */}
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-purple-900/60 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-purple-400" />
                      <span className="text-xs font-bold text-white">Productivity Bonus Points</span>
                    </div>
                    <span className="font-mono font-bold text-purple-300 text-sm">
                      {prodPoints} / 7.0 Points
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {currentKPI.productivityRemarks || currentKPI.performanceRemarks}
                  </p>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                    <div
                      className="bg-purple-400 h-full rounded-full"
                      style={{ width: `${Math.min(100, (prodPoints / 7) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* RCM Operational Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800/80 text-xs">
                <div>
                  <span className="text-slate-400 text-[11px] block">Claims / Tasks Processed:</span>
                  <span className="font-mono font-bold text-white text-sm">
                    {currentKPI.claimsProcessed?.toLocaleString() || '1,840'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">First-Pass Accuracy:</span>
                  <span className="font-mono font-bold text-cyan-400 text-sm">
                    {currentKPI.accuracyRate || '99.4'}%
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px] block">Reviewing Supervisor:</span>
                  <span className="text-slate-200 font-medium">
                    {currentKPI.reviewedBy}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center bg-[#0c121e] rounded-2xl border border-slate-800 text-slate-400 text-xs">
          No KPI records have been filed for your profile yet.
        </div>
      )}

      {/* Historical KPI Table */}
      <div className="rounded-2xl bg-[#0c121e] border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white font-['Space_Grotesk']">
              Historical Performance & Bonus Archives
            </h2>
            <p className="text-xs text-slate-400">
              Evaluated on 10 points (3 HR + 7 Productivity) for separate mid-month disbursements.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">{records.length} evaluations recorded</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3.5">Review Period</th>
                <th className="p-3.5">HR Points (3)</th>
                <th className="p-3.5">Productivity (7)</th>
                <th className="p-3.5">Total Score</th>
                <th className="p-3.5">Mid-Month Bonus</th>
                <th className="p-3.5">Bonus Reason</th>
                <th className="p-3.5">Disbursed Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {records.map(r => {
                const hr = r.hrPoints !== undefined ? r.hrPoints : 3.0;
                const prod = r.productivityPoints !== undefined ? r.productivityPoints : 6.5;
                const tot = r.totalPoints !== undefined ? r.totalPoints : Number((hr + prod).toFixed(1));

                return (
                  <tr key={r.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-3.5 font-semibold text-white">{r.month}</td>
                    <td className="p-3.5 font-mono font-bold text-blue-400">{hr} / 3</td>
                    <td className="p-3.5 font-mono font-bold text-purple-400">{prod} / 7</td>
                    <td className="p-3.5 font-mono font-bold text-cyan-400 text-sm">
                      {tot} / 10 ({r.kpiScore}%)
                    </td>
                    <td className="p-3.5 font-mono font-bold text-emerald-400">
                      +{r.bonusAmount.toLocaleString()} RS
                    </td>
                    <td className="p-3.5 text-[11px] text-slate-300 max-w-xs">{r.bonusReason}</td>
                    <td className="p-3.5 font-mono text-[11px] text-slate-400">
                      15th of {r.month.split(' ')[0]}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
