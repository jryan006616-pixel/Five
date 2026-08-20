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

  // Chart 1: Department Distribution Data (Dynamic)
  const deptCountMap: Record<string, number> = {};
  allEmployees.forEach(e => {
    deptCountMap[e.department] = (deptCountMap[e.department] || 0) + 1;
  });
  const deptChartData = Object.entries(deptCountMap).map(([name, count]) => ({
    name,
    count,
  }));

  // Chart 2: Weekly Attendance Trend (Dynamic)
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

  // Chart 3: Department Payroll Cost (Dynamic from actual company staff)
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

  const PIE_COLORS = ['#06b6d4', '#0ea5e9', '#38bdf8', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#6366f1'];

  return (
    <div className="space-y-6">
      
      {/* 1. Header Banner */}
      <div className="p-6 rounded-2xl bg-[#0c121e] border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-amber-950 text-amber-300 border border-amber-800/60 font-bold text-xs uppercase font-mono">
              Admin Command Center
            </span>
            <h1 className="text-xl font-bold font-['Space_Grotesk'] text-white">
              Enterprise Workforce & Operations
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time shift oversight, employee management, and payroll figures for your organization.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('admin-employees')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add New Employee</span>
          </button>
          <button
            onClick={() => setActiveTab('admin-users')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs shadow-md transition-colors cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Manage User Logins</span>
          </button>
        </div>
      </div>

      {/* Zero Employees Welcome / Setup Notice */}
      {totalStaff === 0 && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-slate-900 to-slate-900 border border-cyan-800/50 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <h2 className="text-base font-bold text-white font-['Space_Grotesk']">
                  Clean Slate Ready for Your Company Data
                </h2>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                All demo accounts and mock figures have been removed. You can now configure your organization by adding your real employees, assigning usernames and passwords, defining salary structures, and tracking live shift attendance.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                onClick={() => setActiveTab('admin-employees')}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-lg shadow-cyan-950/50 transition-all cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Onboard First Employee</span>
              </button>
              <button
                onClick={() => setActiveTab('attendance-shifts')}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-all cursor-pointer"
              >
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Shift Settings</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Overview 8 KPI Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {/* Total Staff */}
        <div className="p-3.5 rounded-xl bg-[#0c121e] border border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Staff</span>
          <p className="text-xl font-black font-mono text-white mt-1">{totalStaff}</p>
          <span className="text-[9px] text-cyan-400">Headcount</span>
        </div>

        {/* Active Staff */}
        <div className="p-3.5 rounded-xl bg-[#0c121e] border border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Roster</span>
          <p className="text-xl font-black font-mono text-emerald-400 mt-1">{activeStaff}</p>
          <span className="text-[9px] text-emerald-500">{totalStaff > 0 ? '100% Operational' : '0 Added'}</span>
        </div>

        {/* On Probation */}
        <div className="p-3.5 rounded-xl bg-[#0c121e] border border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">On Probation</span>
          <p className="text-xl font-black font-mono text-amber-400 mt-1">{onProbation}</p>
          <span className="text-[9px] text-amber-500">3-Month Track</span>
        </div>

        {/* Probation Cleared */}
        <div className="p-3.5 rounded-xl bg-[#0c121e] border border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Cleared</span>
          <p className="text-xl font-black font-mono text-cyan-400 mt-1">{probationCleared}</p>
          <span className="text-[9px] text-cyan-500">Confirmed</span>
        </div>

        {/* Present Today */}
        <div className="p-3.5 rounded-xl bg-[#0c121e] border border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Present Today</span>
          <p className="text-xl font-black font-mono text-emerald-400 mt-1">{presentToday}</p>
          <span className="text-[9px] text-emerald-500">Shift In</span>
        </div>

        {/* Late Today */}
        <div className="p-3.5 rounded-xl bg-[#0c121e] border border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Late Arrival</span>
          <p className="text-xl font-black font-mono text-rose-400 mt-1">{lateToday}</p>
          <span className="text-[9px] text-rose-500">&gt;{policy.gracePeriodMinutes || 15}m Grace</span>
        </div>

        {/* On Break */}
        <div className="p-3.5 rounded-xl bg-[#0c121e] border border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">On Break</span>
          <p className="text-xl font-black font-mono text-amber-400 mt-1">{onBreakNow}</p>
          <span className="text-[9px] text-amber-500">Outside Time</span>
        </div>

        {/* Absent */}
        <div className="p-3.5 rounded-xl bg-[#0c121e] border border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Absent / Leave</span>
          <p className="text-xl font-black font-mono text-slate-400 mt-1">{absentToday}</p>
          <span className="text-[9px] text-slate-500">Off Shift</span>
        </div>
      </div>

      {/* 3. Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Weekly Attendance Trend */}
        <div className="p-5 rounded-2xl bg-[#0c121e] border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white font-['Space_Grotesk']">
                Shift Attendance & Punctuality
              </h3>
              <p className="text-[11px] text-slate-400">Total staff present vs late arrivals per shift day</p>
            </div>
            <span className="text-xs font-mono text-cyan-400">{attendanceRecords.length} Records</span>
          </div>

          <div className="h-64 w-full">
            {attendanceRecords.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-800 rounded-xl">
                <Clock className="w-8 h-8 text-slate-600 mb-2" />
                <p className="text-xs font-semibold text-slate-400">No Attendance Records Yet</p>
                <p className="text-[11px] text-slate-500 mt-1 max-w-xs">
                  Attendance logs will appear automatically as employees check in and record shift breaks.
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyAttendanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Bar dataKey="present" fill="#06b6d4" name="Present Staff" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="late" fill="#f43f5e" name="Late Arrivals" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 2: Department Headcount Distribution */}
        <div className="p-5 rounded-2xl bg-[#0c121e] border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white font-['Space_Grotesk']">
                Workforce Distribution by Department
              </h3>
              <p className="text-[11px] text-slate-400">Headcount distribution across company departments</p>
            </div>
            <span className="text-xs font-mono text-emerald-400">{allEmployees.length} Staff Members</span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            {deptChartData.length === 0 ? (
              <div className="h-full w-full flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-800 rounded-xl">
                <Users className="w-8 h-8 text-slate-600 mb-2" />
                <p className="text-xs font-semibold text-slate-400">No Employees Added Yet</p>
                <p className="text-[11px] text-slate-500 mt-1 max-w-xs">
                  Add staff members in Employee Management to visualize department headcount distribution.
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deptChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="count"
                    nameKey="name"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {deptChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 3: Department Payroll & Performance Bonus Expenses */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-[#0c121e] border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white font-['Space_Grotesk']">
                Company Payroll & Performance Bonus Allocation
              </h3>
              <p className="text-[11px] text-slate-400">Total company payroll expenditure: <strong>{totalPayrollCost.toLocaleString()} RS</strong> • Performance bonuses: <strong>{totalBonusPaid.toLocaleString()} RS</strong></p>
            </div>
            <span className="text-xs font-mono text-cyan-400 uppercase font-bold">PKR Currency</span>
          </div>

          <div className="h-64 w-full">
            {totalStaff === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-800 rounded-xl">
                <DollarSign className="w-8 h-8 text-slate-600 mb-2" />
                <p className="text-xs font-semibold text-slate-400">No Salary or Payroll Records</p>
                <p className="text-[11px] text-slate-500 mt-1 max-w-xs">
                  Salary liability and bonus analytics will populate automatically as you add employee salaries and bonuses.
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptCostData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="department" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                    formatter={(val: number) => [`${val.toLocaleString()} RS`, '']}
                  />
                  <Bar dataKey="base" fill="#38bdf8" name="Base Salaries (RS)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="bonus" fill="#10b981" name="KPI Bonuses (RS)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
