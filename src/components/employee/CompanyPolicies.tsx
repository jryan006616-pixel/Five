import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldAlert,
  Clock,
  Coffee,
  Calendar,
  AlertTriangle,
  FileText,
  Building,
  CheckCircle2,
} from 'lucide-react';

export const CompanyPolicies: React.FC = () => {
  const { policy } = useApp();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-[#0c121e] border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl font-bold font-['Space_Grotesk'] text-white">
              Rhinomds Enterprise Attendance Policies
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Standard operating rules governing shift timings, workstation breaks, and punctuality standards.
          </p>
        </div>

        <div className="text-xs text-slate-400 font-mono">
          Last Revised: <strong>{policy.lastUpdated}</strong>
        </div>
      </div>

      {/* Policy Clauses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Clause 1: Standard Hours & Shift */}
        <div className="p-5 rounded-2xl bg-[#0c121e] border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-cyan-400">
            <Clock className="w-5 h-5" />
            <h3 className="text-sm font-bold text-white font-['Space_Grotesk']">
              Standard Shift & Working Hours
            </h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Standard full-time shifts comprise <strong>{policy.standardDailyHours} total hours</strong> ({policy.requiredDailyMinutes / 60} billable hours + {policy.breakAllowanceMinutes} minutes break allocation).
          </p>
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-1">
            <p className="text-slate-400">Primary US Operational Shift:</p>
            <p className="font-mono text-cyan-300 font-semibold">{policy.shiftType}</p>
          </div>
        </div>

        {/* Clause 2: Grace Period & Late Arrival */}
        <div className="p-5 rounded-2xl bg-[#0c121e] border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-amber-400">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="text-sm font-bold text-white font-['Space_Grotesk']">
              Grace Period & Late Arrival
            </h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Employees are granted a <strong>{policy.gracePeriodMinutes}-minute grace period</strong> at shift commencement (up to 06:15 PM PKT).
          </p>
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-1">
            <p className="text-slate-400">Late Penalty Clause:</p>
            <p className="text-amber-300 font-medium">
              Arrivals beyond {policy.lateArrivalThresholdMinutes} mins without prior approval incur automated prorated salary deductions per policy 4.2.
            </p>
          </div>
        </div>

        {/* Clause 3: Workstation Break Allowances */}
        <div className="p-5 rounded-2xl bg-[#0c121e] border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400">
            <Coffee className="w-5 h-5" />
            <h3 className="text-sm font-bold text-white font-['Space_Grotesk']">
              Break Allowance & Outside Time
            </h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Daily cumulative break allowance is <strong>{policy.breakAllowanceMinutes} minutes</strong>. Maximum single meal/dinner break duration is <strong>{policy.maxSingleBreakMinutes} minutes</strong>.
          </p>
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-1">
            <p className="text-slate-400">Outside Time Review:</p>
            <p className="text-slate-300">
              Absence exceeding {policy.maxSingleBreakMinutes}m without supervisor authorization is flagged for HR review.
            </p>
          </div>
        </div>

        {/* Clause 4: Overtime Rules */}
        <div className="p-5 rounded-2xl bg-[#0c121e] border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-sky-400">
            <CheckCircle2 className="w-5 h-5" />
            <h3 className="text-sm font-bold text-white font-['Space_Grotesk']">
              Overtime Calculation
            </h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Authorized overtime logged beyond standard 8 net hours is compensated at <strong>{policy.overtimeRules.rateMultiplier}x standard hourly rate</strong> (minimum 60 mins required to qualify).
          </p>
        </div>

        {/* Clause 5: Working Days & Weekends */}
        <div className="p-5 rounded-2xl bg-[#0c121e] border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-purple-400">
            <Calendar className="w-5 h-5" />
            <h3 className="text-sm font-bold text-white font-['Space_Grotesk']">
              Working Days & Weekends
            </h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {policy.weekendRules}
          </p>
          <p className="text-xs text-slate-400">
            Official Days: <strong>{policy.workingDays.join(', ')}</strong>
          </p>
        </div>

        {/* Clause 6: 3-Month Probation Governance */}
        <div className="p-5 rounded-2xl bg-[#0c121e] border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-rose-400">
            <Building className="w-5 h-5" />
            <h3 className="text-sm font-bold text-white font-['Space_Grotesk']">
              3-Month Probation Rule
            </h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            All newly onboarded RCM specialists undertake a mandatory 3-month evaluation period from Date of Joining. Confirmation is awarded upon review by the HR Director.
          </p>
        </div>
      </div>
    </div>
  );
};
