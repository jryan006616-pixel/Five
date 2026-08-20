import React from 'react';
import { useApp } from '../../context/AppContext';
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
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from 'recharts';

export const AdminDashboard: React.FC = () => {
  const {
    currentUser,
    allEmployees,
    attendanceRecords,
    salaryRecords,
    departments,
    setActiveTab,
    policy,
  } = useApp();

  const today = '2026-08-20';
  const todayRecords = attendanceRecords.filter(a => a.date === today);

  // High-level operational metrics
  const totalStaff = allEmployees.length;
  const activeStaff = allEmployees.filter(e => e.employmentStatus === 'Active' || e.employmentStatus === 'Confirmed' || e.employmentStatus === 'Probation').length;
  const onProbation = allEmployees.filter(e => e.employmentStatus === 'Probation').length;
  const probationCleared = allEmployees.filter(e => e.probationStatus === 'Probation Cleared').length;
  const presentToday = todayRecords.filter(r => r.status === 'Present' || r.status === 'Late').length;
  const lateToday = todayRecords.filter(r => r.isLate).length;
  const onBreakNow = todayRecords.filter(r => r.breaks && r.breaks.some(b => b.endTime === null)).length;
  const absentToday = Math.max(0, totalStaff - presentToday);

  // Total payroll cost for current month calculated from real records or employee base figures
  const totalPayrollCost = salaryRecords.length > 0
    ? salaryRecords.reduce((acc, s) => acc + s.netSalary, 0)
    : allEmployees.reduce((acc, e) => acc + (e.monthlySalary || 0), 0);

  const totalBonusPaid = salaryRecords.length > 0
    ? salaryRecords.reduce((acc, s) => acc + s.bonus, 0)
    : allEmployees.reduce((acc, e) => acc + (e.currentBonus || 0), 0);

  // Department distribution
  const deptCountMap: Record<string, number> = {};
  allEmployees.forEach(e => {
    deptCountMap[e.department] = (deptCountMap[e.department] || 0) + 1;
  });
  const deptChartData = Object.entries(deptCountMap).map(([name, count]) => ({
    name,
    count,
  }));

  // Weekly Attendance Trend
  const dates = ['2026-08-15', '2026-08-16', '2026-08-17', '2026-08-18', '2026-08-19', today];
  const dayNames = ['Mon 08/15', 'Tue 08/16', 'Wed 08/17', 'Thu 08/18', 'Fri 08/19', 'Today (Live)'];
  
  const weeklyAttendanceData = dates.map((d, i) => {
    const dayRecs = attendanceRecords.filter(r => r.date === d);
    return {
      day: dayNames[i],
      present: dayRecs.filter(r => r.status === 'Present' || r.status === 'Late').length,
      late: dayRecs.filter(r => r.isLate).length,
    };
  });

  // Department Payroll Cost
  const deptCostData = departments.map(d => {
    const deptEmps = allEmployees.filter(e => e.department === d.name);
    const baseSum = deptEmps.reduce((acc, e) => acc + (e.monthlySalary || 0), 0);
    const bonusSum = deptEmps.reduce((acc, e) => acc + (e.currentBonus || 0), 0);
    return {
      department: d.code || d.name.slice(0, 8),
      fullName: d.name,
      base: baseSum,
      bonus: bonusSum,
      staffCount: deptEmps.length,
    };
  }).filter(d => d.base > 0 || d.bonus > 0 || totalStaff === 0);

  const PIE_COLORS = ['#141619', '#d6f932', '#06b6d4', '#8b5cf6', '#f59e0b', '#ec4899'];

  return (
    <div className="space-y-6">
      
      {/* Top Bento Row: Hero Portrait Card + Working Format Gauge + Onboarding Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* 1. Hero Card with Translucent Badge (4 Cols) */}
        <div className="lg:col-span-3 relative h-[380px] rounded-3xl overflow-hidden shadow-sm group">
          <img
            src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop"
            alt="Director of Operations"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

          {/* Floating Frosted Pill Badge at Bottom */}
          <div className="absolute bottom-4 inset-x-4 p-4 rounded-2xl bg-white/20 backdrop-blur-xl border border-white/30 text-white shadow-lg">
            <h2 className="text-lg font-bold font-['Outfit'] tracking-tight leading-tight drop-shadow-sm">
              {currentUser?.fullName || 'Director of Operations'}
            </h2>
            <p className="text-[11px] text-white/90 uppercase font-mono font-bold tracking-wider mt-0.5">
              RCM OPERATIONS LEAD
            </p>
          </div>
        </div>

        {/* 2. Working Format / Shift Attendance Donut Gauge (4 Cols) */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-white border border-slate-200/60 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-[#141619] font-['Outfit']">
              Working format
            </h3>
            <button className="text-slate-400 hover:text-black">
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>

          {/* Concentric Gauge Graphic */}
          <div className="flex flex-col items-center justify-center my-3 relative">
            <div className="relative w-44 h-44 flex items-center justify-center">
              {/* Ring 1 (Outer Cyan) */}
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="44" stroke="#f1f5f9" strokeWidth="4" fill="none" />
                <circle cx="50" cy="50" r="44" stroke="#22d3ee" strokeWidth="4" strokeDasharray="276" strokeDashoffset="60" strokeLinecap="round" fill="none" />
              </svg>
              {/* Ring 2 (Middle Lime) */}
              <svg className="absolute inset-0 w-full h-full -rotate-90 p-2.5" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" stroke="#f1f5f9" strokeWidth="4.5" fill="none" />
                <circle cx="50" cy="50" r="40" stroke="#84cc16" strokeWidth="4.5" strokeDasharray="251" strokeDashoffset="75" strokeLinecap="round" fill="none" />
              </svg>
              {/* Ring 3 (Inner Violet) */}
              <svg className="absolute inset-0 w-full h-full -rotate-90 p-5" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="36" stroke="#f1f5f9" strokeWidth="5" fill="none" />
                <circle cx="50" cy="50" r="36" stroke="#c084fc" strokeWidth="5" strokeDasharray="226" strokeDashoffset="120" strokeLinecap="round" fill="none" />
              </svg>

              {/* Center Counter */}
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-[#141619] font-['Outfit'] leading-none">
                  {totalStaff > 0 ? totalStaff : '500'}
                </span>
                <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-widest mt-0.5">
                  STAFF
                </span>
              </div>
            </div>
          </div>

          {/* Legend Pills */}
          <div className="flex items-center justify-center gap-4 text-[11px] font-bold text-slate-600">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#22d3ee]"></span>
              <span>50% OFFICE</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#84cc16]"></span>
              <span>30% HYBRID</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#c084fc]"></span>
              <span>20% REMOTE</span>
            </div>
          </div>
        </div>

        {/* 3. Onboarding Tasks & RCM Milestones (5 Cols) */}
        <div className="lg:col-span-5 p-6 rounded-3xl bg-[#e3e1da] border border-[#d6d4cb] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-extrabold text-[#141619] font-['Outfit']">
                Onboarding tasks
              </h3>
              <span className="text-2xl font-black font-['Outfit'] text-[#141619]">
                98%
              </span>
            </div>

            {/* Progress Track */}
            <div className="w-full h-1.5 bg-slate-300 rounded-full overflow-hidden mb-1">
              <div className="h-full bg-[#84cc16] rounded-full w-[98%]" />
            </div>
            <div className="flex justify-between text-[9px] font-bold text-slate-500 mb-4">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>

            {/* Task Item List */}
            <div className="space-y-2.5">
              {[
                {
                  title: 'ONBOARDING SESSION',
                  time: 'MON, FEB 3 | 10:00 AM',
                  img: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=200&auto=format&fit=crop',
                  checked: true,
                },
                {
                  title: 'MEDICAL BILLING AUDIT',
                  time: 'MON, FEB 3 | 14:00 PM',
                  img: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=200&auto=format&fit=crop',
                  checked: true,
                },
                {
                  title: 'PAYER ADJUDICATION SYNC',
                  time: 'MON, FEB 3 | 14:30 PM',
                  img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
                  checked: true,
                },
                {
                  title: 'RCM POLICY REVIEW',
                  time: 'MON, FEB 3 | 16:00 PM',
                  img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
                  checked: false,
                },
              ].map((task, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-2xl bg-white/60 hover:bg-white transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={task.img}
                      alt={task.title}
                      className="w-8 h-8 rounded-xl object-cover"
                    />
                    <div>
                      <p className="text-[11px] font-extrabold text-[#141619] tracking-wide font-mono leading-tight">
                        {task.title}
                      </p>
                      <p className="text-[9px] font-bold text-slate-500">
                        {task.time}
                      </p>
                    </div>
                  </div>

                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                      task.checked
                        ? 'bg-black text-white border-black'
                        : 'border-slate-400 text-transparent'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Middle Row: Schedule / Timeline Strip Card */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200/60 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <button className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200">
            &lt; JANUARY
          </button>
          <h3 className="text-lg font-black font-['Outfit'] text-[#141619] tracking-tight">
            February 2025 (Shift Operations)
          </h3>
          <button className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200">
            MARCH &gt;
          </button>
        </div>

        {/* Mini Day Timeline Header */}
        <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-black uppercase tracking-wider text-slate-500 py-2 border-b border-slate-100">
          <span>MON, 3</span>
          <span>TUE, 4</span>
          <span>WED, 5</span>
          <span>THU, 6</span>
          <span>FRI, 7</span>
          <span>SAT, 8</span>
          <span>SUN, 9</span>
        </div>

        {/* Live Shifts Strip */}
        <div className="py-4 space-y-3">
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-bold font-mono text-slate-400 w-16">10:00 AM</span>
            <div className="flex-1 p-2.5 rounded-full bg-black text-white text-xs font-bold flex items-center justify-between px-5 shadow-sm">
              <span className="font-mono text-[11px] tracking-wider">US ADJUDICATION ONBOARDING</span>
              <div className="flex -space-x-1.5">
                <img className="w-5 h-5 rounded-full border border-black object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100" />
                <img className="w-5 h-5 rounded-full border border-black object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-[10px] font-bold font-mono text-slate-400 w-16">12:00 PM</span>
            <div className="flex-1 p-2.5 rounded-full bg-[#202227] text-white text-xs font-bold flex items-center justify-between px-5 shadow-sm ml-20">
              <span className="font-mono text-[11px] tracking-wider text-[#d6f932]">RCM TEAM SYNC & AUDIT</span>
              <div className="flex -space-x-1.5">
                <img className="w-5 h-5 rounded-full border border-black object-cover" src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=100" />
                <img className="w-5 h-5 rounded-full border border-black object-cover" src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=100" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bento Row: 5 Stats Cards exactly like reference image */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Card 1: 500 Days / Headcount (White Card) */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/60 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-3xl font-black font-['Outfit'] text-[#141619]">
              {totalStaff > 0 ? totalStaff : '500'}
            </span>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-1">
              DAYS IN THE COMPANY
            </p>
            <p className="text-[9px] font-bold text-emerald-600 mt-0.5">
              +8% LAST MONTH
            </p>
          </div>

          <div className="mt-4">
            <div className="w-full h-1.5 rounded-full bg-gradient-to-r from-cyan-400 via-lime-400 to-amber-400 mb-1" />
            <div className="flex justify-between text-[9px] font-bold font-mono text-slate-400">
              <span>0</span>
              <span>250</span>
              <span>500</span>
            </div>
          </div>
        </div>

        {/* Card 2: 38 Completed Projects (Butter Card) */}
        <div className="p-5 rounded-3xl bg-[#fbf5e6] border border-[#f2ead3] shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-3xl font-black font-['Outfit'] text-[#141619]">
              38
            </span>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-700 mt-1">
              COMPLETED PROJECTS
            </p>
            <p className="text-[9px] font-bold text-slate-500 mt-0.5">
              +4 LAST MONTH
            </p>
          </div>

          <button
            onClick={() => setActiveTab('admin-employees')}
            className="w-full py-2 rounded-full bg-white hover:bg-slate-50 text-slate-900 text-[10px] font-extrabold uppercase tracking-wider shadow-xs mt-4 cursor-pointer"
          >
            VIEW ALL
          </button>
        </div>

        {/* Card 3: 8 Projects in Progress (Soft Stone Gray Card) */}
        <div className="p-5 rounded-3xl bg-[#e3e1da] border border-[#d6d4cb] shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-3xl font-black font-['Outfit'] text-[#141619]">
              {activeStaff > 0 ? activeStaff : '8'}
            </span>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-700 mt-1">
              PROJECTS IN PROGRESS
            </p>
            <p className="text-[9px] font-bold text-slate-500 mt-0.5">
              +3 LAST MONTH
            </p>
          </div>

          <button
            onClick={() => setActiveTab('admin-attendance')}
            className="w-full py-2 rounded-full bg-white hover:bg-slate-50 text-slate-900 text-[10px] font-extrabold uppercase tracking-wider shadow-xs mt-4 cursor-pointer"
          >
            VIEW ALL
          </button>
        </div>

        {/* Card 4: $6,110 Salary / Metallic Gradient Card with 4-Point Star */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-[#cfd6df] via-[#e6eae4] to-[#d5dbd3] border border-white/60 shadow-xs flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-transparent">.</span>
            <Sparkles className="w-5 h-5 text-slate-400" />
          </div>

          <div className="text-center my-2">
            <span className="text-2xl font-black font-['Outfit'] text-[#141619]">
              ${totalPayrollCost > 0 ? (totalPayrollCost / 280).toFixed(0).toLocaleString() : '6,110'}
            </span>
            <p className="text-[9px] font-bold text-slate-700 mt-0.5">
              +40% LAST MONTH
            </p>
          </div>

          <span className="text-center text-[9px] font-bold uppercase tracking-widest text-slate-500">
            SALARY & PAYROLL
          </span>
        </div>

        {/* Card 5: Personal Data / Office Space Photo Card */}
        <div className="relative rounded-3xl overflow-hidden shadow-xs h-[140px] group">
          <img
            src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=400&auto=format&fit=crop"
            alt="Office workspace"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-black/30 pointer-events-none" />
          
          <button
            onClick={() => setActiveTab('admin-employees')}
            className="absolute bottom-3 inset-x-3 py-1.5 rounded-full bg-white/90 hover:bg-white text-slate-900 text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-md shadow-md cursor-pointer text-center"
          >
            PERSONAL DATA
          </button>
        </div>

      </div>

      {/* Quick Action Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-3xl bg-white border border-slate-200/60 shadow-xs">
        <div className="flex items-center gap-3">
          <span className="p-2 rounded-2xl bg-black text-white">
            <ShieldCheck className="w-4 h-4 text-[#d6f932]" />
          </span>
          <div>
            <h4 className="text-xs font-bold text-[#141619]">Operational Administration</h4>
            <p className="text-[10px] text-slate-500">Roster management, credential control, and payroll generation</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('admin-employees')}
            className="px-4 py-2 rounded-full bg-black text-white text-xs font-bold hover:bg-slate-800 transition-all cursor-pointer"
          >
            Manage Staff
          </button>
          <button
            onClick={() => setActiveTab('admin-users')}
            className="px-4 py-2 rounded-full bg-slate-100 text-slate-800 text-xs font-bold hover:bg-slate-200 transition-all cursor-pointer"
          >
            User Passwords
          </button>
          <button
            onClick={() => setActiveTab('admin-salary')}
            className="px-4 py-2 rounded-full bg-slate-100 text-slate-800 text-xs font-bold hover:bg-slate-200 transition-all cursor-pointer"
          >
            Payroll & Slips
          </button>
        </div>
      </div>

    </div>
  );
};
