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
} from 'lucide-react';

export const EmployeeKPIBonus: React.FC = () => {
  const { currentEmployee, kpiRecords } = useApp();

  if (!currentEmployee) return null;

  const records = kpiRecords.filter(k => k.employeeId === currentEmployee.id);
  const currentKPI = records[0]; // Most recent

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-[#0c121e] border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl font-bold font-['Space_Grotesk'] text-white">
              My KPI & Performance Bonus
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Monthly accuracy benchmarks, claim volume milestones, and approved executive incentive bonuses.
          </p>
        </div>

        {currentKPI && (
          <div className="flex items-center gap-3">
            <div className="px-3.5 py-1.5 rounded-xl bg-amber-950/60 border border-amber-800/60 text-right">
              <span className="text-[10px] text-amber-300 font-bold uppercase block">Latest Bonus</span>
              <span className="text-sm font-mono font-bold text-amber-400">
                +{currentKPI.bonusAmount.toLocaleString()} RS
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Hero KPI Card for Latest Month */}
      {currentKPI ? (
        <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-cyan-800/60 p-6 shadow-xl relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
            {/* KPI Gauge Block */}
            <div className="md:col-span-1 p-4 rounded-xl bg-[#0a0f1d] border border-slate-800 text-center space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {currentKPI.month} Score
              </span>
              <div className="text-4xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">
                {currentKPI.kpiScore}%
              </div>
              <div className="flex items-center justify-center gap-1 text-amber-400 text-xs mt-1">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <Star className="w-3.5 h-3.5 fill-amber-400" />
              </div>
            </div>

            {/* Performance Details & Bonus */}
            <div className="md:col-span-3 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 uppercase">
                    Status: {currentKPI.bonusStatus}
                  </span>
                  <h3 className="text-lg font-bold text-white font-['Space_Grotesk'] mt-1">
                    {currentKPI.bonusReason}
                  </h3>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Incentive Payout</span>
                  <span className="text-2xl font-bold font-mono text-emerald-400">
                    +{currentKPI.bonusAmount.toLocaleString()} <span className="text-xs text-slate-400">RS (PKR)</span>
                  </span>
                </div>
              </div>

              {/* RCM Operational Metrics if available */}
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

              {/* Supervisor Performance Remarks */}
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Supervisor Performance Evaluation
                </span>
                <p className="text-slate-300 mt-1 italic leading-relaxed">
                  "{currentKPI.performanceRemarks}"
                </p>
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
          <h2 className="text-sm font-bold text-white font-['Space_Grotesk']">
            Historical Performance & Bonus Archives
          </h2>
          <span className="text-xs font-mono text-slate-400">{records.length} evaluations recorded</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3.5">Review Period</th>
                <th className="p-3.5">KPI Score</th>
                <th className="p-3.5">Accuracy / Volume</th>
                <th className="p-3.5">Bonus Payout</th>
                <th className="p-3.5">Bonus Reason</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Reviewed Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {records.map(r => (
                <tr key={r.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-3.5 font-semibold text-white">{r.month}</td>
                  <td className="p-3.5 font-mono font-bold text-cyan-400 text-sm">{r.kpiScore}%</td>
                  <td className="p-3.5 text-[11px] text-slate-300">
                    {r.accuracyRate ? `${r.accuracyRate}% Accuracy` : '--'} • {r.claimsProcessed || '--'} processed
                  </td>
                  <td className="p-3.5 font-mono font-bold text-emerald-400">
                    +{r.bonusAmount.toLocaleString()} RS
                  </td>
                  <td className="p-3.5 text-[11px] text-slate-300 max-w-xs">{r.bonusReason}</td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-950 text-emerald-300 border border-emerald-800/60 uppercase">
                      {r.bonusStatus}
                    </span>
                  </td>
                  <td className="p-3.5 font-mono text-[11px] text-slate-400">{r.reviewedDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
