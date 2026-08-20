import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  User,
  Building,
  Calendar,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Award,
  DollarSign,
  AlertTriangle,
  Clock,
  HeartHandshake,
  CheckCircle2,
  KeyRound,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';

export const EmployeeProfile: React.FC = () => {
  const { currentEmployee, currentUser, canAccessEmployeeData, updateOwnPassword } = useApp();

  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [passNotice, setPassNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!currentEmployee || !canAccessEmployeeData(currentEmployee.id)) {
    return (
      <div className="p-8 text-center text-red-400 bg-red-950/40 rounded-2xl border border-red-800">
        Access Denied: You do not have permission to view this profile.
      </div>
    );
  }

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPassNotice(null);
    const res = updateOwnPassword(currentPass, newPass);
    if (res.success) {
      setPassNotice({ type: 'success', text: 'Password successfully updated!' });
      setCurrentPass('');
      setNewPass('');
    } else {
      setPassNotice({ type: 'error', text: res.error || 'Failed to update password.' });
    }
  };

  // Calculate probation countdown if in probation
  const joinDate = new Date(currentEmployee.dateOfJoining);
  const probationEnd = new Date(currentEmployee.probationEndDate);
  const now = new Date('2026-08-20');
  const diffTime = probationEnd.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return (
    <div className="space-y-6">
      {/* Profile Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-[#0c121e] border border-slate-800 p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={currentEmployee.profilePhoto}
              alt={currentEmployee.fullName}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-cyan-500 shadow-xl shadow-cyan-950/40"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-cyan-400">
                  {currentEmployee.id}
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                  {currentEmployee.employmentStatus}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold font-['Space_Grotesk'] text-white">
                {currentEmployee.fullName}
              </h1>
              <p className="text-xs text-slate-300">
                {currentEmployee.designation} • <strong className="text-cyan-300">{currentEmployee.department}</strong>
              </p>
            </div>
          </div>

          {/* Probation Status Callout Card */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-xs sm:text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Probation Milestone
            </span>
            <div className="flex items-center sm:justify-end gap-1.5 mt-0.5">
              {currentEmployee.probationStatus === 'Probation Cleared' ? (
                <span className="font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Cleared & Confirmed
                </span>
              ) : diffDays > 0 ? (
                <span className="font-bold text-amber-400 flex items-center gap-1">
                  🟡 {diffDays} Days Remaining
                </span>
              ) : (
                <span className="font-bold text-cyan-400 flex items-center gap-1">
                  Review Required
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Joined: {currentEmployee.dateOfJoining} • Ends: {currentEmployee.probationEndDate}
            </p>
          </div>
        </div>
      </div>

      {/* 3 Main Profile Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 1. Personal Information */}
        <div className="rounded-2xl bg-[#0c121e] border border-slate-800 p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <User className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-white font-['Space_Grotesk']">
              Personal Information
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-[11px] text-slate-400 block">Full Legal Name</span>
              <span className="font-semibold text-slate-200">{currentEmployee.fullName}</span>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 block">Date of Birth & Gender</span>
              <span className="text-slate-200">{currentEmployee.dateOfBirth} • {currentEmployee.gender}</span>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 block">Corporate Email</span>
              <span className="font-mono text-cyan-300">{currentEmployee.email}</span>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 block">Contact Phone Number</span>
              <span className="text-slate-200">{currentEmployee.phone}</span>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 block">Residential Address</span>
              <span className="text-slate-300 leading-relaxed">{currentEmployee.address}</span>
            </div>

            <div className="pt-2 border-t border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Emergency Contact
              </span>
              <p className="text-slate-200 mt-1 font-semibold">
                {currentEmployee.emergencyContact} ({currentEmployee.emergencyContactRelation})
              </p>
              <p className="font-mono text-cyan-400 text-[11px] mt-0.5">
                {currentEmployee.emergencyContactPhone}
              </p>
            </div>
          </div>
        </div>

        {/* 2. Employment & Shift Information */}
        <div className="rounded-2xl bg-[#0c121e] border border-slate-800 p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Building className="w-5 h-5 text-sky-400" />
            <h3 className="text-sm font-bold text-white font-['Space_Grotesk']">
              Employment Details
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-[11px] text-slate-400 block">Designation</span>
              <span className="font-semibold text-slate-200">{currentEmployee.designation}</span>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 block">Department</span>
              <span className="font-semibold text-cyan-300">{currentEmployee.department}</span>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 block">Date of Joining</span>
              <span className="text-slate-200">{currentEmployee.dateOfJoining}</span>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 block">Employment Type & Shift</span>
              <span className="text-slate-200">{currentEmployee.employmentType}</span>
              <span className="block font-mono text-[11px] text-slate-400 mt-0.5">
                {currentEmployee.shiftTiming}
              </span>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 block">Reporting Manager</span>
              <span className="text-slate-200">{currentEmployee.reportingManager}</span>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 block">Work Location</span>
              <span className="text-slate-300">{currentEmployee.workLocation}</span>
            </div>

            <div className="pt-2 border-t border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                3-Month Probation Rule
              </span>
              <p className="text-[11px] text-slate-300 mt-1">
                Standard Rhinomds probation period is 3 months from Date of Joining.
              </p>
            </div>
          </div>
        </div>

        {/* 3. Compensation Information (Strictly Scoped) */}
        <div className="rounded-2xl bg-[#0c121e] border border-slate-800 p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white font-['Space_Grotesk']">
              Compensation Details
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Monthly Base Salary</span>
              <div className="text-xl font-bold font-mono text-white mt-0.5">
                {currentEmployee.monthlySalary.toLocaleString()} <span className="text-xs text-slate-400">RS (PKR)</span>
              </div>
              <span className="text-[10px] text-slate-500">Effective from {currentEmployee.salaryEffectiveDate}</span>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 block">Payment Frequency</span>
              <span className="text-slate-200">{currentEmployee.paymentFrequency} (1st of each month)</span>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 block">Current Approved Bonus</span>
              <span className="font-mono font-semibold text-emerald-400">
                +{currentEmployee.currentBonus.toLocaleString()} RS
              </span>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 block">Current Applied Deductions</span>
              <span className="font-mono font-semibold text-red-400">
                -{currentEmployee.currentDeductions.toLocaleString()} RS
              </span>
            </div>

            <div className="pt-2 border-t border-slate-800">
              <span className="text-[11px] text-slate-400 block">Disbursement Bank Account</span>
              {currentEmployee.bankName ? (
                <>
                  <p className="font-semibold text-slate-200">{currentEmployee.bankName}</p>
                  <p className="font-mono text-cyan-400 text-[11px]">
                    {currentEmployee.bankAccountNumber || 'No Account Number Recorded'}
                  </p>
                </>
              ) : (
                <p className="text-slate-500 italic text-[11px] mt-1">Not configured / Direct Disbursement</p>
              )}
            </div>
          </div>
        </div>

        {/* 4. Portal Sign-In & Security Credentials Card */}
        <div className="rounded-2xl bg-[#0c121e] border border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-cyan-400" />
              <h3 className="text-sm font-bold text-white font-['Space_Grotesk']">
                Portal Sign-In & Credentials
              </h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-cyan-950 text-cyan-300 border border-cyan-800">
              Admin Managed
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-[11px]">Assigned Username:</span>
                <span className="font-mono font-bold text-cyan-300">@{currentUser?.username}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-[11px]">Role Permission:</span>
                <span className="font-semibold text-white capitalize">{currentUser?.role}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-[11px]">Assigned By:</span>
                <span className="text-slate-300">{currentUser?.assignedBy || 'HR Administration'}</span>
              </div>
            </div>

            {/* Change Password Form */}
            <form onSubmit={handlePasswordChange} className="space-y-2.5 pt-2 border-t border-slate-800">
              <span className="text-[11px] font-bold text-slate-300 block">
                Update Account Password
              </span>

              {passNotice && (
                <div
                  className={`p-2 rounded-lg text-[11px] ${
                    passNotice.type === 'success'
                      ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                      : 'bg-red-950/80 text-red-300 border border-red-800'
                  }`}
                >
                  {passNotice.text}
                </div>
              )}

              <div>
                <input
                  type="password"
                  required
                  value={currentPass}
                  onChange={e => setCurrentPass(e.target.value)}
                  placeholder="Current Password"
                  className="w-full p-2 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  value={newPass}
                  onChange={e => setNewPass(e.target.value)}
                  placeholder="New Password (min 6 chars)"
                  className="w-full p-2 pr-8 rounded-lg bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:ring-1 focus:ring-cyan-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-2.5 top-2 text-slate-400 hover:text-white"
                >
                  {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-2 rounded-xl bg-cyan-950/90 hover:bg-cyan-900 border border-cyan-700/80 text-cyan-300 font-bold text-xs transition-colors"
              >
                Change Password
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};
