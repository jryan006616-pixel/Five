import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ProbationStatus } from '../../types';
import {
  TimerReset,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Calendar,
  Sparkles,
  Award,
  Users,
  X,
  FileCheck,
} from 'lucide-react';

export const AdminProbationTracker: React.FC = () => {
  const { allEmployees, updateProbationStatus } = useApp();
  const [selectedEmpId, setSelectedEmpId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'Clear' | 'Extend'>('Clear');
  const [extensionDays, setExtensionDays] = useState(30);
  const [remarks, setRemarks] = useState('');
  const [showCelebration, setShowCelebration] = useState(false);

  const now = new Date();

  // Categorize employees by probation status
  const employeesWithProbation = allEmployees.map(emp => {
    const pEnd = new Date(emp.probationEndDate);
    const diffTime = pEnd.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return {
      ...emp,
      diffDays,
    };
  });

  const underProbation = employeesWithProbation.filter(
    e => e.probationStatus === 'Under Probation' || e.probationStatus === 'Probation Extended'
  );
  const reviewRequired = employeesWithProbation.filter(
    e => e.diffDays <= 0 && e.probationStatus === 'Under Probation'
  );
  const cleared = employeesWithProbation.filter(e => e.probationStatus === 'Probation Cleared');

  const handleActionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpId) return;

    if (actionType === 'Clear') {
      updateProbationStatus(selectedEmpId, 'Probation Cleared', remarks || '3-Month Evaluation successfully cleared and confirmed.');
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
    } else {
      updateProbationStatus(selectedEmpId, 'Probation Extended', remarks || `Probation extended by ${extensionDays} days for additional evaluation.`);
    }

    setSelectedEmpId(null);
    setRemarks('');
  };

  const selectedEmp = allEmployees.find(e => e.id === selectedEmpId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-[#0c121e] border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <TimerReset className="w-5 h-5 text-amber-400" />
            <h1 className="text-xl font-bold font-['Space_Grotesk'] text-white">
              3-Month Probation Governance Center
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Automated tracking of mandatory 3-month evaluation periods from Date of Joining, milestone countdowns, and confirmation governance.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <span className="text-slate-300">Standard Rule: <strong>DOJ + 90 Days</strong></span>
        </div>
      </div>

      {/* Confetti Banner upon Clearing */}
      {showCelebration && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950 to-teal-950 border border-emerald-600 text-emerald-200 text-xs flex items-center justify-between animate-in fade-in zoom-in-95">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400 animate-spin" />
            <span className="font-bold text-white text-sm">
              🎉 Employee Probation Confirmed & Permanent Employment Awarded!
            </span>
          </div>
          <span className="font-mono text-emerald-400 font-bold">Status: Confirmed</span>
        </div>
      )}

      {/* Probation Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-[#0c121e] border border-slate-800">
          <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
            Currently Under Probation
          </span>
          <p className="text-2xl font-bold font-mono text-amber-400 mt-1">
            {underProbation.length} Staff
          </p>
          <span className="text-[10px] text-slate-400">90-Day evaluation active</span>
        </div>

        <div className="p-4 rounded-xl bg-[#0c121e] border border-slate-800">
          <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider block">
            Review Required / Completed
          </span>
          <p className="text-2xl font-bold font-mono text-rose-400 mt-1">
            {reviewRequired.length} Staff
          </p>
          <span className="text-[10px] text-slate-400">3 Months Completed</span>
        </div>

        <div className="p-4 rounded-xl bg-[#0c121e] border border-slate-800">
          <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
            Permanently Confirmed
          </span>
          <p className="text-2xl font-bold font-mono text-emerald-400 mt-1">
            {cleared.length} Staff
          </p>
          <span className="text-[10px] text-emerald-500">Probation Cleared</span>
        </div>
      </div>

      {/* Probation Active Queue Table */}
      <div className="rounded-2xl bg-[#0c121e] border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white font-['Space_Grotesk']">
            Probation Pipeline & Evaluation Queue
          </h2>
          <span className="text-xs font-mono text-slate-400">{allEmployees.length} Total Workforce</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3.5">Employee</th>
                <th className="p-3.5">Department</th>
                <th className="p-3.5">Joining Date</th>
                <th className="p-3.5">Probation End Date</th>
                <th className="p-3.5">Countdown / Time Left</th>
                <th className="p-3.5">Probation Status</th>
                <th className="p-3.5 text-right">Admin Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {employeesWithProbation.map(emp => (
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
                    <span className="text-slate-200 block font-medium">{emp.designation}</span>
                    <span className="text-[11px] text-slate-400">{emp.department}</span>
                  </td>

                  <td className="p-3.5 font-mono text-slate-300">
                    {emp.dateOfJoining}
                  </td>

                  <td className="p-3.5 font-mono font-semibold text-white">
                    {emp.probationEndDate}
                  </td>

                  {/* Countdown */}
                  <td className="p-3.5">
                    {emp.probationStatus === 'Probation Cleared' ? (
                      <span className="font-mono text-emerald-400 font-bold">
                        Cleared & Permanent
                      </span>
                    ) : emp.diffDays > 0 ? (
                      <span className="font-mono font-bold text-amber-400">
                        ⏳ {emp.diffDays} Days Remaining
                      </span>
                    ) : (
                      <span className="font-mono font-bold text-rose-400 animate-pulse">
                        ⚠️ 3 Months Complete
                      </span>
                    )}
                  </td>

                  {/* Status Badge */}
                  <td className="p-3.5">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase ${
                        emp.probationStatus === 'Probation Cleared'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                          : emp.diffDays <= 0
                          ? 'bg-rose-950 text-rose-300 border border-rose-800/60'
                          : 'bg-amber-950 text-amber-300 border border-amber-800/60'
                      }`}
                    >
                      {emp.probationStatus}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="p-3.5 text-right">
                    {emp.probationStatus !== 'Probation Cleared' ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedEmpId(emp.id);
                            setActionType('Clear');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition-colors"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => {
                            setSelectedEmpId(emp.id);
                            setActionType('Extend');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition-colors"
                        >
                          Extend
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-500 italic">Confirmed</span>
                    )}
                  </td>
                </tr>
              ))}

              {allEmployees.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <TimerReset className="w-10 h-10 text-slate-600" />
                      <p className="text-sm font-bold text-slate-300">No Employees on Probation</p>
                      <p className="text-xs text-slate-500">
                        When you onboard new employees, their 3-month probation countdowns and evaluation milestones will track here automatically.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation / Extension Modal */}
      {selectedEmpId && selectedEmp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <TimerReset className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white font-['Space_Grotesk']">
                  Probation Evaluation Decision
                </h3>
              </div>
              <button
                onClick={() => setSelectedEmpId(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <p className="font-bold text-white">{selectedEmp.fullName} ({selectedEmp.id})</p>
              <p className="text-slate-400">{selectedEmp.designation} • {selectedEmp.department}</p>
              <p className="text-[11px] text-cyan-400 mt-1 font-mono">
                DOJ: {selectedEmp.dateOfJoining} • Scheduled End: {selectedEmp.probationEndDate}
              </p>
            </div>

            <form onSubmit={handleActionSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Evaluation Decision</label>
                <select
                  value={actionType}
                  onChange={e => setActionType(e.target.value as 'Clear' | 'Extend')}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                >
                  <option value="Clear">✓ Clear Probation & Confirm Permanent Employment</option>
                  <option value="Extend">⏳ Extend Probation Period</option>
                </select>
              </div>

              {actionType === 'Extend' && (
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Extension Duration (Days)</label>
                  <select
                    value={extensionDays}
                    onChange={e => setExtensionDays(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  >
                    <option value={30}>30 Additional Days</option>
                    <option value={60}>60 Additional Days</option>
                    <option value={90}>90 Additional Days</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Official Review Remarks</label>
                <textarea
                  rows={3}
                  value={remarks}
                  onChange={e => setRemarks(e.target.value)}
                  placeholder="e.g. Demonstrated exceptional RCM accuracy and attendance throughout the 3-month probation."
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedEmpId(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 rounded-xl font-bold text-white ${
                    actionType === 'Clear'
                      ? 'bg-emerald-600 hover:bg-emerald-500'
                      : 'bg-amber-600 hover:bg-amber-500'
                  }`}
                >
                  Confirm Decision
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
