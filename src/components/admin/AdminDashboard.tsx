import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getLiveDateStr } from '../../utils/dateUtils';
import { ProfileEditModal } from '../common/ProfileEditModal';
import {
  Users,
  UserCheck,
  Clock,
  Coffee,
  AlertTriangle,
  Award,
  DollarSign,
  TrendingUp,
  TimerReset,
  ShieldCheck,
  ArrowUpRight,
  UserPlus,
  Settings,
  Sparkles,
  Layers,
  Calendar,
  CheckCircle2,
  MoreVertical,
  ChevronRight,
  Plus,
  Trash2,
  Edit3,
  X,
  Check,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    currentUser,
    updateCurrentUserProfile,
    allEmployees,
    attendanceRecords,
    salaryRecords,
    departments,
    setActiveTab,
    companyTasks,
    addCompanyTask,
    toggleCompanyTask,
    deleteCompanyTask,
  } = useApp();

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // New task form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskCategory, setTaskCategory] = useState('Medical Billing');
  const [taskTimeSlot, setTaskTimeSlot] = useState('10:00 AM PKT');
  const [taskDueDate, setTaskDueDate] = useState('Today');
  const [taskAssignee, setTaskAssignee] = useState('');

  // Profile form state
  const [profileName, setProfileName] = useState(currentUser?.fullName || '');
  const [profileAvatar, setProfileAvatar] = useState(currentUser?.avatar || '');

  // Today's date calculations
  const todayStr = getLiveDateStr();
  const todayRecords = attendanceRecords.filter(a => a.date === todayStr);

  // Real employee calculations
  const totalStaff = allEmployees.length;
  const activeStaff = allEmployees.filter(
    e => e.employmentStatus === 'Active' || e.employmentStatus === 'Confirmed' || e.employmentStatus === 'Probation'
  ).length;
  const onProbation = allEmployees.filter(e => e.employmentStatus === 'Probation' || e.probationStatus === 'Under Probation').length;
  const probationCleared = allEmployees.filter(e => e.probationStatus === 'Probation Cleared').length;
  const presentToday = todayRecords.filter(r => r.status === 'Present' || r.status === 'Late').length;
  const lateToday = todayRecords.filter(r => r.isLate).length;
  const onBreakNow = todayRecords.filter(r => r.breaks && r.breaks.some(b => b.endTime === null)).length;

  // Real payroll cost
  const totalPayrollCost = salaryRecords.length > 0
    ? salaryRecords.reduce((acc, s) => acc + s.netSalary, 0)
    : allEmployees.reduce((acc, e) => acc + (e.monthlySalary || 0), 0);

  // Working format distribution
  const officeCount = allEmployees.filter(
    e => !e.employmentType || e.employmentType.toLowerCase().includes('full') || e.employmentType.toLowerCase().includes('office') || e.employmentType.toLowerCase().includes('night')
  ).length;
  const hybridCount = allEmployees.filter(
    e => e.employmentType && e.employmentType.toLowerCase().includes('hybrid')
  ).length;
  const remoteCount = allEmployees.filter(
    e => e.employmentType && (e.employmentType.toLowerCase().includes('contract') || e.employmentType.toLowerCase().includes('remote'))
  ).length;

  const officePct = totalStaff > 0 ? Math.round((officeCount / totalStaff) * 100) : 0;
  const hybridPct = totalStaff > 0 ? Math.round((hybridCount / totalStaff) * 100) : 0;
  const remotePct = totalStaff > 0 ? Math.max(0, 100 - officePct - hybridPct) : 0;

  // Concentric ring calculations
  // Ring 1 (Cyan: Office): r=44, circ=276.46
  const ring1Offset = totalStaff > 0 ? 276 - (276 * officePct) / 100 : 276;
  // Ring 2 (Lime: Hybrid): r=40, circ=251.32
  const ring2Offset = totalStaff > 0 ? 251 - (251 * hybridPct) / 100 : 251;
  // Ring 3 (Violet: Remote): r=36, circ=226.19
  const ring3Offset = totalStaff > 0 ? 226 - (226 * remotePct) / 100 : 226;

  // Real Tasks calculation
  const completedTasksCount = companyTasks.filter(t => t.completed).length;
  const taskProgressPct = companyTasks.length > 0 ? Math.round((completedTasksCount / companyTasks.length) * 100) : 0;

  const handleAddTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    addCompanyTask({
      title: taskTitle.trim(),
      category: taskCategory,
      timeSlot: taskTimeSlot,
      dueDate: taskDueDate,
      assignedTo: taskAssignee || currentUser?.fullName || 'All Team',
    });
    setTaskTitle('');
    setShowTaskModal(false);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateCurrentUserProfile({
      fullName: profileName.trim() || currentUser?.fullName,
      avatar: profileAvatar.trim() || currentUser?.avatar,
    });
    setShowProfileModal(false);
  };

  // Calendar dates for current week
  const currDate = new Date();
  const currentMonthYear = currDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  const weekDays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

  return (
    <div className="space-y-6">
      
      {/* Top Bento Row: Hero Portrait Card + Working Format Gauge + Onboarding Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* 1. Hero Card with Translucent Badge & Edit Profile (4 Cols) */}
        <div className="lg:col-span-3 relative h-[380px] rounded-3xl overflow-hidden shadow-xs group bg-[#141619]">
          {currentUser?.avatar ? (
            <img
              src={currentUser.avatar}
              alt={currentUser.fullName}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white p-6 text-center">
              <div className="w-24 h-24 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center text-3xl font-black text-white mb-3">
                {currentUser?.fullName ? currentUser.fullName.slice(0, 2).toUpperCase() : 'AD'}
              </div>
              <p className="text-xs text-slate-400 font-mono">Profile Photo</p>
            </div>
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />

          {/* Quick Edit Profile Button at Top Right */}
          <button
            onClick={() => {
              setProfileName(currentUser?.fullName || '');
              setProfileAvatar(currentUser?.avatar || '');
              setShowProfileModal(true);
            }}
            title="Edit Profile Information"
            className="absolute top-4 right-4 p-2.5 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md border border-white/30 text-white transition-all cursor-pointer shadow-md"
          >
            <Edit3 className="w-4 h-4" />
          </button>

          {/* Floating Frosted Pill Badge at Bottom */}
          <div className="absolute bottom-4 inset-x-4 p-4 rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30 text-white shadow-lg">
            <h2 className="text-lg font-bold font-['Outfit'] tracking-tight leading-tight drop-shadow-xs">
              {currentUser?.fullName || 'System Administrator'}
            </h2>
            <div className="flex items-center justify-between mt-1">
              <p className="text-[10px] text-[#d6f932] uppercase font-mono font-bold tracking-wider">
                {currentUser?.role === 'admin' ? 'SYSTEM ADMINISTRATOR' : 'STAFF MEMBER'}
              </p>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-black/40 text-slate-200 font-mono">
                {totalStaff} Staff
              </span>
            </div>
          </div>
        </div>

        {/* 2. Working Format / Shift Attendance Donut Gauge (4 Cols) */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-white border border-slate-200/60 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-[#141619] font-['Outfit']">
                Working format
              </h3>
              <p className="text-[10px] text-slate-500 font-medium">Real-time workforce distribution</p>
            </div>
            <button
              onClick={() => setActiveTab('admin-employees')}
              className="p-1.5 rounded-full text-slate-400 hover:text-black hover:bg-slate-100 transition-colors cursor-pointer"
              title="Manage Staff & Formats"
            >
              <Users className="w-4 h-4" />
            </button>
          </div>

          {/* Concentric Gauge Graphic */}
          <div className="flex flex-col items-center justify-center my-3 relative">
            <div className="relative w-44 h-44 flex items-center justify-center">
              {/* Ring 1 (Outer Cyan: Office) */}
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="44" stroke="#f1f5f9" strokeWidth="4" fill="none" />
                <circle
                  cx="50"
                  cy="50"
                  r="44"
                  stroke="#22d3ee"
                  strokeWidth="4"
                  strokeDasharray="276.46"
                  strokeDashoffset={ring1Offset}
                  strokeLinecap="round"
                  fill="none"
                  className="transition-all duration-700"
                />
              </svg>
              {/* Ring 2 (Middle Lime: Hybrid) */}
              <svg className="absolute inset-0 w-full h-full -rotate-90 p-2.5" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" stroke="#f1f5f9" strokeWidth="4.5" fill="none" />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="#84cc16"
                  strokeWidth="4.5"
                  strokeDasharray="251.32"
                  strokeDashoffset={ring2Offset}
                  strokeLinecap="round"
                  fill="none"
                  className="transition-all duration-700"
                />
              </svg>
              {/* Ring 3 (Inner Violet: Remote) */}
              <svg className="absolute inset-0 w-full h-full -rotate-90 p-5" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="36" stroke="#f1f5f9" strokeWidth="5" fill="none" />
                <circle
                  cx="50"
                  cy="50"
                  r="36"
                  stroke="#c084fc"
                  strokeWidth="5"
                  strokeDasharray="226.19"
                  strokeDashoffset={ring3Offset}
                  strokeLinecap="round"
                  fill="none"
                  className="transition-all duration-700"
                />
              </svg>

              {/* Center Counter */}
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-[#141619] font-['Outfit'] leading-none">
                  {totalStaff}
                </span>
                <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-widest mt-1">
                  STAFF
                </span>
              </div>
            </div>
          </div>

          {/* Legend Pills */}
          <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] font-bold text-slate-600">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#22d3ee]"></span>
              <span>{officePct}% OFFICE ({officeCount})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#84cc16]"></span>
              <span>{hybridPct}% HYBRID ({hybridCount})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#c084fc]"></span>
              <span>{remotePct}% REMOTE ({remoteCount})</span>
            </div>
          </div>
        </div>

        {/* 3. Live Onboarding Tasks & Checklist (5 Cols) */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-[#e3e1da] border border-[#d6d4cb] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="text-base font-extrabold text-[#141619] font-['Outfit']">
                  Company Tasks & Milestones
                </h3>
                <p className="text-[10px] text-slate-600 font-medium">
                  {completedTasksCount} of {companyTasks.length} tasks completed
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-black font-['Outfit'] text-[#141619]">
                  {taskProgressPct}%
                </span>
                <button
                  onClick={() => setShowTaskModal(true)}
                  className="px-3 py-1.5 rounded-full bg-black text-white text-[11px] font-extrabold hover:bg-slate-800 transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5 text-[#d6f932]" />
                  <span>Add Task</span>
                </button>
              </div>
            </div>

            {/* Progress Track */}
            <div className="w-full h-1.5 bg-slate-300 rounded-full overflow-hidden mb-1">
              <div
                className="h-full bg-[#84cc16] rounded-full transition-all duration-500"
                style={{ width: `${taskProgressPct}%` }}
              />
            </div>
            <div className="flex justify-between text-[9px] font-bold text-slate-500 mb-3">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>

            {/* Task Item List */}
            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
              {companyTasks.length === 0 ? (
                <div className="py-6 text-center bg-white/50 rounded-2xl border border-dashed border-slate-300">
                  <p className="text-xs font-bold text-slate-600">No tasks added yet</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Click "Add Task" to create your first operational milestone</p>
                  <button
                    onClick={() => setShowTaskModal(true)}
                    className="mt-3 px-3 py-1 rounded-full bg-black text-white text-xs font-bold hover:bg-slate-800 cursor-pointer"
                  >
                    + Create Task
                  </button>
                </div>
              ) : (
                companyTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`flex items-center justify-between p-2.5 rounded-2xl transition-all ${
                      task.completed ? 'bg-white/40 opacity-75' : 'bg-white shadow-xs'
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0 pr-2">
                      <button
                        onClick={() => toggleCompanyTask(task.id)}
                        className={`w-5 h-5 rounded-full flex items-center justify-center border transition-colors cursor-pointer shrink-0 ${
                          task.completed
                            ? 'bg-black text-white border-black'
                            : 'border-slate-400 text-transparent hover:border-black'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <div className="truncate">
                        <p className={`text-[11px] font-extrabold tracking-wide font-mono leading-tight truncate ${
                          task.completed ? 'line-through text-slate-400' : 'text-[#141619]'
                        }`}>
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 text-[9px] font-bold text-slate-500 mt-0.5">
                          <span>{task.category}</span>
                          <span>•</span>
                          <span>{task.timeSlot || task.dueDate}</span>
                          {task.assignedTo && (
                            <>
                              <span>•</span>
                              <span className="text-slate-700">{task.assignedTo}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => deleteCompanyTask(task.id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Middle Row: Live Shifts & Schedule Strip */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/60 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-black" />
            <h3 className="text-lg font-black font-['Outfit'] text-[#141619] tracking-tight">
              Live Operations & Shift Schedule — {currentMonthYear}
            </h3>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
              {presentToday} Active Check-in{presentToday !== 1 ? 's' : ''} Today
            </span>
            <button
              onClick={() => setActiveTab('admin-attendance')}
              className="px-3 py-1 rounded-full bg-black text-white text-xs font-bold hover:bg-slate-800 cursor-pointer"
            >
              View Attendance
            </button>
          </div>
        </div>

        {/* Live Shifts Strip */}
        <div className="py-2 space-y-3">
          {todayRecords.length > 0 ? (
            todayRecords.map((att) => {
              const emp = allEmployees.find(e => e.id === att.employeeId);
              return (
                <div key={att.id} className="flex items-center gap-4">
                  <span className="text-[11px] font-bold font-mono text-slate-500 w-20">
                    {att.checkInTime || '09:00 AM'}
                  </span>
                  <div className="flex-1 p-2.5 rounded-full bg-[#141619] text-white text-xs font-bold flex items-center justify-between px-5 shadow-xs">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[11px] tracking-wider text-[#d6f932]">
                        {emp?.fullName || att.employeeId}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {emp?.department || 'RCM Operations'} • {emp?.designation || 'Specialist'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        att.isLate ? 'bg-amber-400 text-black' : 'bg-emerald-400 text-black'
                      }`}>
                        {att.status}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-6 text-center bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-xs font-bold text-slate-600">No shift check-ins recorded for today yet.</p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Staff can log check-ins in real-time from their employee dashboard or you can record attendance manually.
              </p>
              <button
                onClick={() => setActiveTab('admin-attendance')}
                className="mt-3 px-4 py-1.5 rounded-full bg-black text-white text-xs font-bold hover:bg-slate-800 transition-all cursor-pointer"
              >
                Go to Attendance Manager
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Bento Row: 5 Stats Cards exactly linked to live data */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Card 1: Total Staff / Headcount (White Card) */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/60 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-3xl font-black font-['Outfit'] text-[#141619]">
              {totalStaff}
            </span>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-1">
              TOTAL STAFF ONBOARDED
            </p>
            <p className="text-[9px] font-bold text-emerald-600 mt-0.5">
              {activeStaff} ACTIVE CONTRACTS
            </p>
          </div>

          <button
            onClick={() => setActiveTab('admin-employees')}
            className="w-full py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-900 text-[10px] font-extrabold uppercase tracking-wider shadow-xs mt-4 cursor-pointer"
          >
            MANAGE STAFF
          </button>
        </div>

        {/* Card 2: Completed Evaluations / Probation Cleared (Butter Card) */}
        <div className="p-5 rounded-3xl bg-[#fbf5e6] border border-[#f2ead3] shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-3xl font-black font-['Outfit'] text-[#141619]">
              {probationCleared}
            </span>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-700 mt-1">
              CONFIRMED EMPLOYEES
            </p>
            <p className="text-[9px] font-bold text-slate-500 mt-0.5">
              {onProbation} IN PROBATION
            </p>
          </div>

          <button
            onClick={() => setActiveTab('admin-probation')}
            className="w-full py-2 rounded-full bg-white hover:bg-slate-50 text-slate-900 text-[10px] font-extrabold uppercase tracking-wider shadow-xs mt-4 cursor-pointer"
          >
            VIEW PROBATION
          </button>
        </div>

        {/* Card 3: Active on Shift Today (Soft Stone Gray Card) */}
        <div className="p-5 rounded-3xl bg-[#e3e1da] border border-[#d6d4cb] shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-3xl font-black font-['Outfit'] text-[#141619]">
              {presentToday}
            </span>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-700 mt-1">
              ON DUTY TODAY
            </p>
            <p className="text-[9px] font-bold text-slate-500 mt-0.5">
              {onBreakNow} CURRENTLY ON BREAK
            </p>
          </div>

          <button
            onClick={() => setActiveTab('admin-attendance')}
            className="w-full py-2 rounded-full bg-white hover:bg-slate-50 text-slate-900 text-[10px] font-extrabold uppercase tracking-wider shadow-xs mt-4 cursor-pointer"
          >
            VIEW ATTENDANCE
          </button>
        </div>

        {/* Card 4: Monthly Payroll Budget (Metallic Gradient Card) */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-[#cfd6df] via-[#e6eae4] to-[#d5dbd3] border border-white/60 shadow-xs flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-transparent">.</span>
            <Sparkles className="w-5 h-5 text-slate-400" />
          </div>

          <div className="text-center my-2">
            <span className="text-2xl font-black font-['Outfit'] text-[#141619]">
              RS {totalPayrollCost.toLocaleString()}
            </span>
            <p className="text-[9px] font-bold text-slate-700 mt-0.5">
              MONTHLY PAYROLL
            </p>
          </div>

          <button
            onClick={() => setActiveTab('admin-salary')}
            className="w-full py-1.5 rounded-full bg-white/90 hover:bg-white text-slate-900 text-[10px] font-extrabold uppercase tracking-wider shadow-xs cursor-pointer text-center"
          >
            PAYSLIPS & SALARY
          </button>
        </div>

        {/* Card 5: Staff Roster Quick Access (Black Card) */}
        <div className="p-5 rounded-3xl bg-[#141619] text-white border border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <ShieldCheck className="w-5 h-5 text-[#d6f932]" />
              <span className="text-[9px] font-mono uppercase text-slate-400">PORTAL</span>
            </div>
            <h4 className="text-base font-extrabold font-['Outfit'] text-white mt-2">
              Staff Directory
            </h4>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {departments.length} active departments
            </p>
          </div>

          <button
            onClick={() => setActiveTab('admin-employees')}
            className="w-full py-2 rounded-full bg-[#d6f932] hover:bg-lime-400 text-black text-[10px] font-extrabold uppercase tracking-wider shadow-xs mt-4 cursor-pointer transition-colors"
          >
            ONBOARD STAFF
          </button>
        </div>

      </div>

      {/* Add Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white border border-slate-200 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900 font-['Outfit']">
                Add Company Task / Operational Milestone
              </h3>
              <button
                onClick={() => setShowTaskModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-black"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddTaskSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Medical Billing Denial Audit"
                  value={taskTitle}
                  onChange={e => setTaskTitle(e.target.value)}
                  className="w-full p-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    value={taskCategory}
                    onChange={e => setTaskCategory(e.target.value)}
                    className="w-full p-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-black"
                  >
                    <option value="Medical Billing">Medical Billing</option>
                    <option value="Clinical Coding">Clinical Coding</option>
                    <option value="AR Follow-up">AR Follow-up</option>
                    <option value="Credentialing">Credentialing</option>
                    <option value="HR & Operations">HR & Operations</option>
                    <option value="Policy & Compliance">Policy & Compliance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Time Slot / Schedule
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 10:00 AM PKT"
                    value={taskTimeSlot}
                    onChange={e => setTaskTimeSlot(e.target.value)}
                    className="w-full p-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Assigned Employee / Team
                </label>
                <select
                  value={taskAssignee}
                  onChange={e => setTaskAssignee(e.target.value)}
                  className="w-full p-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-black"
                >
                  <option value="All Team">All Team (General)</option>
                  {allEmployees.map(emp => (
                    <option key={emp.id} value={emp.fullName}>
                      {emp.fullName} ({emp.department})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="px-4 py-2 rounded-full bg-slate-100 text-xs font-semibold text-slate-700 hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-black text-xs font-bold text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Profile Modal with Computer File Upload & Presets */}
      <ProfileEditModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />

    </div>
  );
};
