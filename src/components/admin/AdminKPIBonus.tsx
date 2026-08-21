import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  getLiveDateStr,
  getLiveMonthStr,
  getLiveMonthName,
  getAvailableMonthOptions,
} from '../../utils/dateUtils';
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
  Sliders,
  Calendar,
  Sparkles,
  HelpCircle,
} from 'lucide-react';

export const AdminKPIBonus: React.FC = () => {
  const { allEmployees, kpiRecords, addOrUpdateKPI } = useApp();
  const monthOptions = getAvailableMonthOptions(8);
  const currentMonthName = getLiveMonthName(getLiveMonthStr());
  const [selectedMonth, setSelectedMonth] = useState(currentMonthName);
  const [editingEmployeeId, setEditingEmployeeId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // 10-Point KPI Model: 3 Points HR + 7 Points Productivity
  const [formState, setFormState] = useState({
    hrPoints: 3.0, // 0 to 3 points
    productivityPoints: 7.0, // 0 to 7 points
    bonusAmount: 15000,
    maxBonusPool: 15000,
    bonusReason: '10/10 Score: Flawless claims accuracy and 100% punctual shift adherence.',
    hrRemarks: 'Maintained excellent shift discipline, zero unapproved breaks, and punctual check-ins.',
    productivityRemarks: 'Exceeded target claim processing speed with 99.4% first-pass accuracy rate.',
    claimsProcessed: 1800,
    accuracyRate: 99.4,
  });

  const monthKPIs = kpiRecords.filter(k => k.month === selectedMonth);

  const handleOpenEdit = (empId: string) => {
    const existing = monthKPIs.find(k => k.employeeId === empId);
    const emp = allEmployees.find(e => e.id === empId);
    const defaultBonus = emp?.currentBonus || 15000;

    if (existing) {
      setFormState({
        hrPoints: existing.hrPoints !== undefined ? existing.hrPoints : 3.0,
        productivityPoints: existing.productivityPoints !== undefined ? existing.productivityPoints : 7.0,
        bonusAmount: existing.bonusAmount,
        maxBonusPool: existing.maxBonusPool || existing.bonusAmount || defaultBonus,
        bonusReason: existing.bonusReason,
        hrRemarks: existing.hrRemarks || 'Maintained standard HR attendance and SOP compliance benchmarks.',
        productivityRemarks: existing.productivityRemarks || existing.performanceRemarks,
        claimsProcessed: existing.claimsProcessed || 1800,
        accuracyRate: existing.accuracyRate || 99.0,
      });
    } else {
      setFormState({
        hrPoints: 3.0,
        productivityPoints: 6.5,
        bonusAmount: defaultBonus,
        maxBonusPool: defaultBonus,
        bonusReason: '9.5/10 KPI Score: High productivity and consistent shift discipline.',
        hrRemarks: 'Excellent attendance record, punctual login, and adherence to company policies.',
        productivityRemarks: 'Consistent productivity in medical billing and denial management.',
        claimsProcessed: 1650,
        accuracyRate: 98.8,
      });
    }
    setEditingEmployeeId(empId);
  };

  const handleHrPointsChange = (val: number) => {
    const hr = Math.min(3, Math.max(0, val));
    const total = hr + formState.productivityPoints;
    const recommendedBonus = Math.round((total / 10) * (formState.maxBonusPool || 15000));
    setFormState(prev => ({
      ...prev,
      hrPoints: hr,
      bonusAmount: recommendedBonus,
    }));
  };

  const handleProductivityPointsChange = (val: number) => {
    const prod = Math.min(7, Math.max(0, val));
    const total = formState.hrPoints + prod;
    const recommendedBonus = Math.round((total / 10) * (formState.maxBonusPool || 15000));
    setFormState(prev => ({
      ...prev,
      productivityPoints: prod,
      bonusAmount: recommendedBonus,
    }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployeeId) return;

    const hr = Number(formState.hrPoints);
    const prod = Number(formState.productivityPoints);
    const total = Number((hr + prod).toFixed(1));
    const pct = Math.round((total / 10) * 100);

    addOrUpdateKPI({
      employeeId: editingEmployeeId,
      month: selectedMonth,
      year: 2026,
      hrPoints: hr,
      productivityPoints: prod,
      totalPoints: total,
      kpiScore: pct,
      maxBonusPool: formState.maxBonusPool,
      bonusAmount: formState.bonusAmount,
      bonusStatus: 'Approved',
      bonusReason: formState.bonusReason,
      hrRemarks: formState.hrRemarks,
      productivityRemarks: formState.productivityRemarks,
      performanceRemarks: `${formState.hrRemarks} | ${formState.productivityRemarks}`,
      claimsProcessed: formState.claimsProcessed,
      accuracyRate: formState.accuracyRate,
      disbursementCycle: 'Mid-Month (15th)',
      reviewedBy: 'HR & Operations Director',
      reviewedDate: getLiveDateStr(),
    });

    setEditingEmployeeId(null);
  };

  const totalBonusPool = monthKPIs.reduce((acc, k) => acc + k.bonusAmount, 0);
  const avgKPI = monthKPIs.length
    ? (monthKPIs.reduce((acc, k) => acc + (k.totalPoints ?? ((k.kpiScore / 100) * 10)), 0) / monthKPIs.length).toFixed(1)
    : '0';

  const filteredEmployees = allEmployees.filter(emp =>
    emp.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentTotalFormPoints = Number((Number(formState.hrPoints) + Number(formState.productivityPoints)).toFixed(1));
  const currentTotalFormPct = Math.round((currentTotalFormPoints / 10) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-[#0c121e] border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl font-bold font-['Space_Grotesk'] text-white">
              KPI & Mid-Month Performance Bonus Management
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            <strong>10-Point Appraisal Model:</strong> 3 Points HR (Attendance & Conduct) + 7 Points Productivity (Claims & Accuracy). Disbursed at Mid-Month (15th).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-950/50 border border-amber-800/60 text-xs text-amber-300">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span>Payout: <strong>15th Mid-Month</strong></span>
          </div>

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
        </div>
      </div>

      {/* KPI Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-[#0c121e] border border-slate-800">
          <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
            Mid-Month Bonus Allocated
          </span>
          <p className="text-2xl font-bold font-mono text-emerald-400 mt-1">
            +{totalBonusPool.toLocaleString()} <span className="text-xs text-slate-400">RS (PKR)</span>
          </p>
          <span className="text-[10px] text-slate-400">Disbursed separately on 15th for {selectedMonth}</span>
        </div>

        <div className="p-4 rounded-xl bg-[#0c121e] border border-slate-800">
          <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider block">
            Average Score (10-Point Model)
          </span>
          <p className="text-2xl font-bold font-mono text-cyan-400 mt-1">
            {avgKPI} <span className="text-sm font-normal text-slate-400">/ 10 Points ({Math.round(Number(avgKPI) * 10)}%)</span>
          </p>
          <span className="text-[10px] text-cyan-500">Split: 3 HR + 7 Productivity</span>
        </div>

        <div className="p-4 rounded-xl bg-[#0c121e] border border-slate-800">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Appraised Staff
          </span>
          <p className="text-2xl font-bold font-mono text-white mt-1">
            {monthKPIs.length} / {allEmployees.length}
          </p>
          <span className="text-[10px] text-slate-500">Medical billing & RCM specialists</span>
        </div>
      </div>

      {/* KPI Appraisal Table */}
      <div className="rounded-2xl bg-[#0c121e] border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-white font-['Space_Grotesk']">
              Performance Appraisals for {selectedMonth}
            </h2>
            <p className="text-xs text-slate-400">
              Scored on 10 points (3 HR + 7 Productivity) for separate mid-month bonus advice.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search employee..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 placeholder-slate-500 text-xs"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3.5">Employee</th>
                <th className="p-3.5">Department</th>
                <th className="p-3.5">HR Points (3 Max)</th>
                <th className="p-3.5">Productivity (7 Max)</th>
                <th className="p-3.5">Total KPI Score</th>
                <th className="p-3.5">Mid-Month Bonus</th>
                <th className="p-3.5">Cycle</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredEmployees.map(emp => {
                const kpi = monthKPIs.find(k => k.employeeId === emp.id);
                const hrPts = kpi?.hrPoints !== undefined ? kpi.hrPoints : (kpi ? 3.0 : null);
                const prodPts = kpi?.productivityPoints !== undefined ? kpi.productivityPoints : (kpi ? 6.5 : null);
                const totPts = kpi?.totalPoints !== undefined ? kpi.totalPoints : (kpi ? Number(((kpi.kpiScore / 100) * 10).toFixed(1)) : null);

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
                      {hrPts !== null ? (
                        <span className="px-2 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-800/60 font-mono font-bold">
                          {hrPts} / 3
                        </span>
                      ) : (
                        <span className="text-slate-500">-- / 3</span>
                      )}
                    </td>

                    <td className="p-3.5">
                      {prodPts !== null ? (
                        <span className="px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-800/60 font-mono font-bold">
                          {prodPts} / 7
                        </span>
                      ) : (
                        <span className="text-slate-500">-- / 7</span>
                      )}
                    </td>

                    <td className="p-3.5">
                      {totPts !== null ? (
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-black text-cyan-300 text-sm">
                            {totPts} / 10
                          </span>
                          <span className="text-[10px] text-slate-400">({Math.round((totPts / 10) * 100)}%)</span>
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        </div>
                      ) : (
                        <span className="text-slate-500">Unscored</span>
                      )}
                    </td>

                    <td className="p-3.5 font-mono font-bold text-emerald-400">
                      {kpi ? `+${kpi.bonusAmount.toLocaleString()} RS` : '--'}
                    </td>

                    <td className="p-3.5">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-amber-950/80 text-amber-300 border border-amber-800/60 uppercase">
                        15th Mid-Month
                      </span>
                    </td>

                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleOpenEdit(emp.id)}
                        className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition-colors shadow-sm cursor-pointer"
                      >
                        {kpi ? 'Edit Score' : 'Appraise (10-Pt)'}
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredEmployees.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    No employees matching the search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 10-Point Appraisal Modal */}
      {editingEmployeeId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-2xl my-8 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white font-['Space_Grotesk']">
                  10-Point KPI Appraisal & Mid-Month Bonus
                </h3>
              </div>
              <button
                onClick={() => setEditingEmployeeId(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Total Points Live Counter */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-cyan-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                  Total Calculated KPI Score (10 Points Model)
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="text-3xl font-black font-mono text-white">
                    {currentTotalFormPoints} <span className="text-lg font-normal text-slate-400">/ 10.0</span>
                  </span>
                  <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 text-xs font-bold font-mono">
                    {currentTotalFormPct}% Rating
                  </span>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  Disbursed Mid-Month Bonus
                </span>
                <div className="text-2xl font-black font-mono text-emerald-400">
                  +{formState.bonusAmount.toLocaleString()} <span className="text-xs text-slate-400">RS</span>
                </div>
                <span className="text-[10px] text-amber-400">Paid on 15th (Separate Advice)</span>
              </div>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              {/* Part 1: HR Bonus (3 Points) */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-blue-900/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-blue-900/60 text-blue-300 text-[10px] font-bold uppercase tracking-wider">
                      Part 1
                    </span>
                    <h4 className="font-bold text-white text-sm">
                      HR Bonus Points (3 Points Maximum)
                    </h4>
                  </div>
                  <span className="font-mono font-bold text-blue-300 text-sm">
                    {formState.hrPoints} / 3.0 Points
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Evaluated on Shift Attendance, Punctuality, Grace Period Compliance, Break Discipline, and Professional Conduct.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      HR Score (0.0 to 3.0 Points) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="3"
                      step="0.1"
                      required
                      value={formState.hrPoints}
                      onChange={e => handleHrPointsChange(Number(e.target.value))}
                      className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono font-bold text-blue-300 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      HR Evaluation Remarks
                    </label>
                    <input
                      type="text"
                      value={formState.hrRemarks}
                      onChange={e => setFormState({ ...formState, hrRemarks: e.target.value })}
                      placeholder="e.g. 100% on-time check-in, exemplary break discipline."
                      className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Part 2: Productivity Bonus (7 Points) */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-purple-900/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-purple-900/60 text-purple-300 text-[10px] font-bold uppercase tracking-wider">
                      Part 2
                    </span>
                    <h4 className="font-bold text-white text-sm">
                      Productivity Bonus Points (7 Points Maximum)
                    </h4>
                  </div>
                  <span className="font-mono font-bold text-purple-300 text-sm">
                    {formState.productivityPoints} / 7.0 Points
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Evaluated on Claims Turnaround Speed, First-Pass Accuracy, Denial Mitigation, and Monthly Target Delivery.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Productivity Score (0.0 to 7.0 Points) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="7"
                      step="0.1"
                      required
                      value={formState.productivityPoints}
                      onChange={e => handleProductivityPointsChange(Number(e.target.value))}
                      className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono font-bold text-purple-300 focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Claims / Tasks Processed
                    </label>
                    <input
                      type="number"
                      value={formState.claimsProcessed}
                      onChange={e => setFormState({ ...formState, claimsProcessed: Number(e.target.value) })}
                      className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      First-Pass Accuracy (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formState.accuracyRate}
                      onChange={e => setFormState({ ...formState, accuracyRate: Number(e.target.value) })}
                      className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Productivity Remarks
                  </label>
                  <input
                    type="text"
                    value={formState.productivityRemarks}
                    onChange={e => setFormState({ ...formState, productivityRemarks: e.target.value })}
                    placeholder="e.g. Achieved 99.4% billing accuracy, zero compliance infractions."
                    className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>
              </div>

              {/* Bonus Payout Calculation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Eligible Max Bonus Pool (RS)
                  </label>
                  <input
                    type="number"
                    value={formState.maxBonusPool}
                    onChange={e => {
                      const pool = Number(e.target.value);
                      const recBonus = Math.round((currentTotalFormPoints / 10) * pool);
                      setFormState({ ...formState, maxBonusPool: pool, bonusAmount: recBonus });
                    }}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Approved Mid-Month Bonus (PKR / RS) *
                  </label>
                  <input
                    type="number"
                    required
                    value={formState.bonusAmount}
                    onChange={e => setFormState({ ...formState, bonusAmount: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-emerald-400 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Bonus Allocation Reason / Title *
                </label>
                <input
                  type="text"
                  required
                  value={formState.bonusReason}
                  onChange={e => setFormState({ ...formState, bonusReason: e.target.value })}
                  placeholder="e.g. 10/10 Score: Exceptional Quality & Punctuality Incentive"
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingEmployeeId(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer"
                >
                  Authorize 10-Pt KPI Bonus
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
