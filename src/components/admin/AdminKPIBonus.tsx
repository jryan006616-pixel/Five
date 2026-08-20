import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Award,
  Plus,
  Edit2,
  DollarSign,
  TrendingUp,
  Star,
  CheckCircle2,
  X,
  User,
  Search,
} from 'lucide-react';

export const AdminKPIBonus: React.FC = () => {
  const { allEmployees, kpiRecords, updateKPI } = useApp();
  const [selectedMonth, setSelectedMonth] = useState('August 2026');
  const [editingEmployeeId, setEditingEmployeeId] = useState<string | null>(null);

  // Modal Form State
  const [formState, setFormState] = useState({
    kpiScore: 90,
    bonusAmount: 15000,
    bonusReason: 'Outstanding claim submission speed and zero error submissions.',
    performanceRemarks: 'Maintained exceptional quality benchmarks throughout the cycle.',
    claimsProcessed: 1800,
    accuracyRate: 99.0,
  });

  const monthKPIs = kpiRecords.filter(k => k.month === selectedMonth);

  const handleOpenEdit = (empId: string) => {
    const existing = monthKPIs.find(k => k.employeeId === empId);
    if (existing) {
      setFormState({
        kpiScore: existing.kpiScore,
        bonusAmount: existing.bonusAmount,
        bonusReason: existing.bonusReason,
        performanceRemarks: existing.performanceRemarks,
        claimsProcessed: existing.claimsProcessed || 1800,
        accuracyRate: existing.accuracyRate || 99.0,
      });
    } else {
      setFormState({
        kpiScore: 85,
        bonusAmount: 10000,
        bonusReason: 'Standard RCM KPI Performance Target Achieved',
        performanceRemarks: 'Consistent productivity and punctual shift attendance.',
        claimsProcessed: 1500,
        accuracyRate: 98.0,
      });
    }
    setEditingEmployeeId(empId);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployeeId) return;

    updateKPI(editingEmployeeId, {
      month: selectedMonth,
      kpiScore: formState.kpiScore,
      bonusAmount: formState.bonusAmount,
      bonusReason: formState.bonusReason,
      performanceRemarks: formState.performanceRemarks,
      claimsProcessed: formState.claimsProcessed,
      accuracyRate: formState.accuracyRate,
      bonusStatus: 'Approved',
      reviewedDate: '2026-08-20',
    });

    setEditingEmployeeId(null);
  };

  const totalBonusPool = monthKPIs.reduce((acc, k) => acc + k.bonusAmount, 0);
  const avgKPI = monthKPIs.length
    ? (monthKPIs.reduce((acc, k) => acc + k.kpiScore, 0) / monthKPIs.length).toFixed(1)
    : '0';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-[#0c121e] border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl font-bold font-['Space_Grotesk'] text-white">
              KPI & Performance Bonus Management
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Evaluate employee accuracy scores, record supervisor appraisals, and authorize performance bonus allocations.
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
        </div>
      </div>

      {/* KPI Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-[#0c121e] border border-slate-800">
          <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
            Total Bonus Allocated
          </span>
          <p className="text-2xl font-bold font-mono text-emerald-400 mt-1">
            +{totalBonusPool.toLocaleString()} <span className="text-xs text-slate-400">RS (PKR)</span>
          </p>
          <span className="text-[10px] text-slate-400">Approved for {selectedMonth}</span>
        </div>

        <div className="p-4 rounded-xl bg-[#0c121e] border border-slate-800">
          <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider block">
            Average Organization KPI
          </span>
          <p className="text-2xl font-bold font-mono text-cyan-400 mt-1">
            {avgKPI}%
          </p>
          <span className="text-[10px] text-cyan-500">Benchmark: 85% Target</span>
        </div>

        <div className="p-4 rounded-xl bg-[#0c121e] border border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Evaluated Staff
          </span>
          <p className="text-2xl font-bold font-mono text-white mt-1">
            {monthKPIs.length} / {allEmployees.length}
          </p>
          <span className="text-[10px] text-slate-500">Active RCM team</span>
        </div>
      </div>

      {/* Employees KPI Appraisal Table */}
      <div className="rounded-2xl bg-[#0c121e] border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white font-['Space_Grotesk']">
            Performance Appraisals for {selectedMonth}
          </h2>
          <span className="text-xs font-mono text-slate-400">Click evaluate to score</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3.5">Employee</th>
                <th className="p-3.5">Department</th>
                <th className="p-3.5">KPI Score</th>
                <th className="p-3.5">Approved Bonus (RS)</th>
                <th className="p-3.5">Incentive Reason</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {allEmployees.map(emp => {
                const kpi = monthKPIs.find(k => k.employeeId === emp.id);

                return (
                  <tr key={emp.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={emp.profilePhoto}
                          alt={emp.fullName}
                          className="w-8 h-8 rounded-lg object-cover border border-slate-700 shrink-0"
                        />
                        <div>
                          <span className="font-bold text-white block">{emp.fullName}</span>
                          <span className="font-mono text-[11px] text-cyan-400">{emp.id}</span>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5">
                      <span className="text-slate-200 block">{emp.designation}</span>
                      <span className="text-[11px] text-slate-400">{emp.department}</span>
                    </td>

                    <td className="p-3.5">
                      {kpi ? (
                        <div className="flex items-center gap-1">
                          <span className="font-mono font-bold text-cyan-400 text-sm">{kpi.kpiScore}%</span>
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        </div>
                      ) : (
                        <span className="text-slate-500">Unscored</span>
                      )}
                    </td>

                    <td className="p-3.5 font-mono font-bold text-emerald-400">
                      {kpi ? `+${kpi.bonusAmount.toLocaleString()} RS` : '--'}
                    </td>

                    <td className="p-3.5 text-[11px] text-slate-300 max-w-xs truncate">
                      {kpi ? kpi.bonusReason : 'Pending supervisor evaluation.'}
                    </td>

                    <td className="p-3.5">
                      {kpi ? (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-950 text-emerald-300 border border-emerald-800/60 uppercase">
                          {kpi.bonusStatus}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-slate-900 text-slate-400 border border-slate-800 uppercase">
                          Pending
                        </span>
                      )}
                    </td>

                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleOpenEdit(emp.id)}
                        className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-colors shadow-sm"
                      >
                        {kpi ? 'Edit Score' : 'Appraise'}
                      </button>
                    </td>
                  </tr>
                );
              })}

              {allEmployees.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Award className="w-10 h-10 text-slate-600" />
                      <p className="text-sm font-bold text-slate-300">No Employees Found</p>
                      <p className="text-xs text-slate-500">
                        Add staff members in Employee Management to assign monthly KPI scores and performance bonuses.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* KPI Appraisal Modal */}
      {editingEmployeeId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-lg my-8 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white font-['Space_Grotesk']">
                  Appraise Employee KPI & Bonus
                </h3>
              </div>
              <button
                onClick={() => setEditingEmployeeId(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">KPI Score Percentage (0-100%) *</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    required
                    value={formState.kpiScore}
                    onChange={e => setFormState({ ...formState, kpiScore: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Approved Incentive Bonus (PKR / RS) *</label>
                  <input
                    type="number"
                    required
                    value={formState.bonusAmount}
                    onChange={e => setFormState({ ...formState, bonusAmount: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-emerald-400 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Claims / Tasks Processed</label>
                  <input
                    type="number"
                    value={formState.claimsProcessed}
                    onChange={e => setFormState({ ...formState, claimsProcessed: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">First-Pass Accuracy Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formState.accuracyRate}
                    onChange={e => setFormState({ ...formState, accuracyRate: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Bonus Allocation Reason / Title *</label>
                <input
                  type="text"
                  required
                  value={formState.bonusReason}
                  onChange={e => setFormState({ ...formState, bonusReason: e.target.value })}
                  placeholder="e.g. 95%+ High Accuracy & Night Shift Differential Bonus"
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Supervisor Performance Remarks *</label>
                <textarea
                  rows={3}
                  required
                  value={formState.performanceRemarks}
                  onChange={e => setFormState({ ...formState, performanceRemarks: e.target.value })}
                  placeholder="Detailed constructive feedback regarding billing accuracy and punctuality."
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingEmployeeId(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  Authorize & Approve Bonus
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
