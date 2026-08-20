import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck,
  Clock,
  Coffee,
  AlertTriangle,
  Save,
  CheckCircle2,
  Calendar,
  DollarSign,
} from 'lucide-react';

export const AdminPolicies: React.FC = () => {
  const { policy, updatePolicy } = useApp();
  const [formData, setFormData] = useState({ ...policy });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updatePolicy(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-[#0c121e] border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl font-bold font-['Space_Grotesk'] text-white">
              Attendance, Shift & Grace Policy Settings
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Configure enterprise shift thresholds, grace periods, outside workstation allowances, and overtime multipliers.
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-bold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>Policy updated system-wide!</span>
          </div>
        )}
      </div>

      {/* Policy Edit Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Shift & Grace Period Config */}
          <div className="p-6 rounded-2xl bg-[#0c121e] border border-slate-800 space-y-4 text-xs">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-cyan-400">
              <Clock className="w-5 h-5" />
              <h2 className="text-sm font-bold text-white font-['Space_Grotesk']">
                Shift & Punctuality Rules
              </h2>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Standard Daily Total Hours</label>
              <input
                type="number"
                value={formData.standardDailyHours}
                onChange={e => setFormData({ ...formData, standardDailyHours: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">Standard full-time shift (e.g. 9 hours)</span>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Grace Period Threshold (Minutes)</label>
              <input
                type="number"
                value={formData.gracePeriodMinutes}
                onChange={e => setFormData({ ...formData, gracePeriodMinutes: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">Permitted late check-in before flagging (e.g. 15 mins)</span>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Late Arrival Threshold (Minutes)</label>
              <input
                type="number"
                value={formData.lateArrivalThresholdMinutes}
                onChange={e => setFormData({ ...formData, lateArrivalThresholdMinutes: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono"
              />
            </div>
          </div>

          {/* Break & Outside Time Config */}
          <div className="p-6 rounded-2xl bg-[#0c121e] border border-slate-800 space-y-4 text-xs">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-amber-400">
              <Coffee className="w-5 h-5" />
              <h2 className="text-sm font-bold text-white font-['Space_Grotesk']">
                Break & Outside Workstation Rules
              </h2>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Total Daily Break Allowance (Minutes)</label>
              <input
                type="number"
                value={formData.breakAllowanceMinutes}
                onChange={e => setFormData({ ...formData, breakAllowanceMinutes: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">Total permitted break time per shift (e.g. 60 mins)</span>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Max Single Break Duration (Minutes)</label>
              <input
                type="number"
                value={formData.maxSingleBreakMinutes}
                onChange={e => setFormData({ ...formData, maxSingleBreakMinutes: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">Single break limit before triggering violation flag (e.g. 45 mins)</span>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Overtime Hourly Rate Multiplier</label>
              <input
                type="number"
                step="0.1"
                value={formData.overtimeRules.rateMultiplier}
                onChange={e =>
                  setFormData({
                    ...formData,
                    overtimeRules: { ...formData.overtimeRules, rateMultiplier: Number(e.target.value) },
                  })
                }
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono"
              />
            </div>
          </div>

        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white font-bold text-xs shadow-lg shadow-cyan-950/40 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save & Deploy Policy Updates</span>
          </button>
        </div>
      </form>
    </div>
  );
};
