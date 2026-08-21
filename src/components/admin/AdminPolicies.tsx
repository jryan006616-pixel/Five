import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck,
  Clock,
  Coffee,
  AlertTriangle,
  Save,
  CheckCircle2,
  Calendar,
  Sun,
  Snowflake,
  Sliders,
  RefreshCw,
  Info,
  Sparkles,
  Zap,
} from 'lucide-react';
import { ShiftSeason, ShiftTimingConfig } from '../../types';
import {
  DEFAULT_SHIFT_CONFIG,
  formatMinutesTo12Hour,
  parseTimeToMinutes,
  evaluateCheckIn,
} from '../../utils/shiftUtils';

export const AdminPolicies: React.FC = () => {
  const { policy, updatePolicy, updateShiftTiming, recalculateAllAttendance } = useApp();

  const [formData, setFormData] = useState({
    ...policy,
    shiftConfig: policy.shiftConfig || DEFAULT_SHIFT_CONFIG,
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [recalcSuccess, setRecalcSuccess] = useState(false);

  // Test Simulator state
  const [testTime, setTestTime] = useState('21:01'); // 9:01 PM PKT as requested by user

  useEffect(() => {
    setFormData({
      ...policy,
      shiftConfig: policy.shiftConfig || DEFAULT_SHIFT_CONFIG,
    });
  }, [policy]);

  const currentShift = formData.shiftConfig || DEFAULT_SHIFT_CONFIG;

  const handleSeasonPreset = (season: ShiftSeason) => {
    let start = currentShift.startTime;
    let end = currentShift.endTime;

    if (season === 'Winter') {
      start = currentShift.winterStartTime || '19:00';
      end = currentShift.winterEndTime || '04:00';
    } else if (season === 'Summer' || season === 'Regular') {
      start = currentShift.summerStartTime || '18:00';
      end = currentShift.summerEndTime || '03:00';
    }

    const updatedShift: ShiftTimingConfig = {
      ...currentShift,
      season,
      startTime: start,
      endTime: end,
    };

    setFormData(prev => ({
      ...prev,
      shiftConfig: updatedShift,
      shiftType: `${updatedShift.shiftName} [${season}: ${formatMinutesTo12Hour(parseTimeToMinutes(start))} - ${formatMinutesTo12Hour(parseTimeToMinutes(end))} PKT]`,
    }));
  };

  const handleShiftConfigChange = (field: keyof ShiftTimingConfig, value: any) => {
    const updatedShift: ShiftTimingConfig = {
      ...currentShift,
      [field]: value,
    };

    setFormData(prev => ({
      ...prev,
      shiftConfig: updatedShift,
      shiftType: `${updatedShift.shiftName} [${updatedShift.season}: ${formatMinutesTo12Hour(parseTimeToMinutes(updatedShift.startTime))} - ${formatMinutesTo12Hour(parseTimeToMinutes(updatedShift.endTime))} PKT]`,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateShiftTiming(formData.shiftConfig);
    updatePolicy(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  const handleRecalculate = () => {
    recalculateAllAttendance();
    setRecalcSuccess(true);
    setTimeout(() => setRecalcSuccess(false), 3500);
  };

  // Run test simulation on active shift
  const simResult = evaluateCheckIn(testTime, currentShift, formData.gracePeriodMinutes);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-[#0c121e] border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl font-bold font-['Space_Grotesk'] text-white">
              Shift Timing, Seasonal Schedule & Attendance Policies
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage company work shifts, Winter / Summer timing transitions (6:00 PM – 3:00 AM PKT / 7:00 PM – 4:00 AM PKT), grace periods, and late arrival detection.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {savedSuccess && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-bold animate-in fade-in">
              <CheckCircle2 className="w-4 h-4" />
              <span>Shift policy updated system-wide!</span>
            </div>
          )}
          {recalcSuccess && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-cyan-950 text-cyan-300 border border-cyan-800 text-xs font-bold animate-in fade-in">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>All records re-evaluated!</span>
            </div>
          )}
          <button
            type="button"
            onClick={handleRecalculate}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all cursor-pointer"
            title="Re-run shift late evaluation on all existing attendance records"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Re-evaluate Attendance</span>
          </button>
        </div>
      </div>

      {/* Seasonal & Shift Timing Control Panel */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-[#0e1726] to-[#0c121e] border border-cyan-900/40 shadow-xl space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-cyan-400" />
              <h2 className="text-base font-bold text-white font-['Space_Grotesk']">
                Company Working Shift & Seasonal Timings (Pakistan PKT)
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Switch easily between Regular/Summer (6:00 PM - 3:00 AM) and Winter Timing (7:00 PM - 4:00 AM) or define custom timings.
            </p>
          </div>

          {/* Quick Seasonal Preset Buttons */}
          <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => handleSeasonPreset('Regular')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                currentShift.season === 'Regular' || currentShift.season === 'Summer'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span>Summer / Regular (6PM – 3AM)</span>
            </button>

            <button
              type="button"
              onClick={() => handleSeasonPreset('Winter')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                currentShift.season === 'Winter'
                  ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Snowflake className="w-3.5 h-3.5" />
              <span>Winter Timing (7PM – 4AM)</span>
            </button>

            <button
              type="button"
              onClick={() => handleSeasonPreset('Custom')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                currentShift.season === 'Custom'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Custom Shift</span>
            </button>
          </div>
        </div>

        {/* Shift Timing Details Form */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
            <label className="block text-[11px] font-semibold text-slate-400">
              Shift Start Time (PKT)
            </label>
            <input
              type="time"
              value={currentShift.startTime}
              onChange={e => handleShiftConfigChange('startTime', e.target.value)}
              className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-sm"
            />
            <span className="text-[10px] text-cyan-400 font-medium block">
              Formatted: {formatMinutesTo12Hour(parseTimeToMinutes(currentShift.startTime))} PKT
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
            <label className="block text-[11px] font-semibold text-slate-400">
              Shift End Time (PKT)
            </label>
            <input
              type="time"
              value={currentShift.endTime}
              onChange={e => handleShiftConfigChange('endTime', e.target.value)}
              className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-sm"
            />
            <span className="text-[10px] text-cyan-400 font-medium block">
              Formatted: {formatMinutesTo12Hour(parseTimeToMinutes(currentShift.endTime))} PKT (Next day)
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
            <label className="block text-[11px] font-semibold text-slate-400">
              Grace Period (Minutes)
            </label>
            <input
              type="number"
              min={0}
              max={60}
              value={currentShift.gracePeriodMinutes}
              onChange={e => {
                const val = Number(e.target.value);
                handleShiftConfigChange('gracePeriodMinutes', val);
                setFormData(prev => ({ ...prev, gracePeriodMinutes: val, lateArrivalThresholdMinutes: val }));
              }}
              className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-sm"
            />
            <span className="text-[10px] text-emerald-400 block">
              Check-in on/before {formatMinutesTo12Hour(parseTimeToMinutes(currentShift.startTime) + currentShift.gracePeriodMinutes)} is On-Time.
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
            <label className="block text-[11px] font-semibold text-slate-400">
              Half-Day Threshold (Minutes Late)
            </label>
            <input
              type="number"
              min={60}
              max={360}
              step={15}
              value={currentShift.halfDayThresholdMinutes || 180}
              onChange={e => handleShiftConfigChange('halfDayThresholdMinutes', Number(e.target.value))}
              className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-sm"
            />
            <span className="text-[10px] text-amber-400 block">
              3+ hours late (180 mins) logs status as Half Day.
            </span>
          </div>
        </div>

        {/* Live Active Shift Banner */}
        <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-800/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-white">Active Shift Specification:</span>
              <span className="text-cyan-300 ml-2 font-mono">
                {currentShift.shiftName} • {formatMinutesTo12Hour(parseTimeToMinutes(currentShift.startTime))} to {formatMinutesTo12Hour(parseTimeToMinutes(currentShift.endTime))} PKT ({currentShift.season} Schedule)
              </span>
            </div>
          </div>
          <div className="text-[11px] text-slate-400 font-medium">
            Timezone: <span className="text-slate-200">{currentShift.timezone}</span>
          </div>
        </div>
      </div>

      {/* Real-Time Check-In & Late Arrival Simulator */}
      <div className="p-6 rounded-2xl bg-[#0c121e] border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 text-amber-400">
          <Sparkles className="w-5 h-5" />
          <h2 className="text-sm font-bold text-white font-['Space_Grotesk']">
            Live Late Arrival Calculation Verification & Test Tool
          </h2>
        </div>
        <p className="text-xs text-slate-400">
          Test any check-in time (e.g. 9:01 PM / 21:01 PKT for a 6:00 PM shift) to confirm that late arrival is correctly calculated:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center bg-slate-950 p-4 rounded-xl border border-slate-800">
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              Simulated Check-In Time
            </label>
            <input
              type="time"
              value={testTime}
              onChange={e => setTestTime(e.target.value)}
              className="w-full p-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-sm"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">
              E.g. 21:01 (9:01 PM PKT)
            </span>
          </div>

          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1 text-xs">
            <div className="text-slate-400 text-[11px]">Shift Expected Start:</div>
            <div className="text-white font-bold font-mono">
              {simResult.shiftExpectedStart12h} PKT (Grace: {currentShift.gracePeriodMinutes}m)
            </div>
            <div className="text-slate-400 text-[11px] mt-2">Tested Arrival:</div>
            <div className="text-cyan-300 font-bold font-mono">{simResult.checkIn12h} PKT</div>
          </div>

          <div className={`p-4 rounded-xl border flex flex-col justify-center ${
            simResult.isLate
              ? 'bg-rose-950/40 border-rose-800 text-rose-200'
              : 'bg-emerald-950/40 border-emerald-800 text-emerald-200'
          }`}>
            <div className="flex items-center justify-between font-bold text-sm mb-1">
              <span>Status: {simResult.status}</span>
              <span>{simResult.isLate ? `+${simResult.lateMinutes} mins late` : 'On Time'}</span>
            </div>
            <p className="text-[11px] opacity-90">{simResult.notes}</p>
          </div>
        </div>
      </div>

      {/* Standard Policy Configuration Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Workstation & Break Rules */}
          <div className="p-6 rounded-2xl bg-[#0c121e] border border-slate-800 space-y-4 text-xs">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-amber-400">
              <Coffee className="w-5 h-5" />
              <h2 className="text-sm font-bold text-white font-['Space_Grotesk']">
                Break & Outside Workstation Allowances
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
              <span className="text-[10px] text-slate-500 mt-0.5 block">Total permitted break time per shift (e.g. 60 mins total: 30m Dinner + 2x15m Tea)</span>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Max Single Break Duration (Minutes)</label>
              <input
                type="number"
                value={formData.maxSingleBreakMinutes}
                onChange={e => setFormData({ ...formData, maxSingleBreakMinutes: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">Single break duration limit before flagging excess break (e.g. 45 mins)</span>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Early Departure Threshold (Minutes)</label>
              <input
                type="number"
                value={formData.earlyDepartureThresholdMinutes}
                onChange={e => setFormData({ ...formData, earlyDepartureThresholdMinutes: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono"
              />
            </div>
          </div>

          {/* Overtime & Workday Rules */}
          <div className="p-6 rounded-2xl bg-[#0c121e] border border-slate-800 space-y-4 text-xs">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800 text-cyan-400">
              <Calendar className="w-5 h-5" />
              <h2 className="text-sm font-bold text-white font-['Space_Grotesk']">
                Working Days & Overtime Rates
              </h2>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Standard Daily Work Hours</label>
              <input
                type="number"
                value={formData.standardDailyHours}
                onChange={e => setFormData({ ...formData, standardDailyHours: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono"
              />
              <span className="text-[10px] text-slate-500 mt-0.5 block">Total daily roster time (9 hours including break)</span>
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
              <span className="text-[10px] text-slate-500 mt-0.5 block">Multiplier for hours worked beyond shift duration (e.g. 1.5x)</span>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Weekend Schedule Rules</label>
              <input
                type="text"
                value={formData.weekendRules}
                onChange={e => setFormData({ ...formData, weekendRules: e.target.value })}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white font-bold text-xs shadow-lg shadow-cyan-950/40 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save & Apply Company Shift Policies</span>
          </button>
        </div>
      </form>
    </div>
  );
};
