import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Employee, EmploymentStatus } from '../../types';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Edit2,
  Trash2,
  DollarSign,
  Award,
  CheckCircle2,
  AlertTriangle,
  X,
  Building,
  Calendar,
  Lock,
  Mail,
  Phone,
  ShieldCheck,
  TimerReset,
  KeyRound,
  Sparkles,
} from 'lucide-react';

export const EmployeeManagement: React.FC = () => {
  const {
    allEmployees,
    departments,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    setSelectedPayslipForModal,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // New Employee Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    dateOfBirth: '1995-01-01',
    address: '',
    emergencyContact: '',
    emergencyContactRelation: 'Parent / Spouse',
    emergencyContactPhone: '',
    department: 'Medical Billing',
    designation: 'Senior Medical Billing Specialist',
    dateOfJoining: '2026-08-20',
    employmentType: 'Full-Time (US Shift)',
    shiftTiming: '06:00 PM - 03:00 AM PKT (08:00 AM - 05:00 PM EST)',
    reportingManager: 'HR Admin',
    monthlySalary: 85000,
    bankName: 'Meezan Bank',
    bankAccountNumber: '',
  });

  // Admin Assigned Credentials for New Employee
  const [customUsername, setCustomUsername] = useState('');
  const [customPassword, setCustomPassword] = useState('Rhino@2026');
  const [customRole, setCustomRole] = useState<'employee' | 'admin'>('employee');

  // Filtered employees
  const filtered = allEmployees.filter(emp => {
    const matchesSearch =
      emp.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.designation.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept = selectedDept === 'All' || emp.department === selectedDept;
    const matchesStatus =
      selectedStatus === 'All' ||
      (selectedStatus === 'Probation' && emp.employmentStatus === 'Probation') ||
      (selectedStatus === 'Active' && (emp.employmentStatus === 'Active' || emp.employmentStatus === 'Confirmed'));

    return matchesSearch && matchesDept && matchesStatus;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addEmployee(formData, formData.monthlySalary, {
      username: customUsername || formData.fullName.toLowerCase().replace(/\s+/g, '.'),
      password: customPassword,
      role: customRole,
    });
    setShowAddModal(false);
    // Reset form
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      gender: 'Male',
      dateOfBirth: '1995-01-01',
      address: '',
      emergencyContact: '',
      emergencyContactRelation: 'Parent / Spouse',
      emergencyContactPhone: '',
      department: 'Medical Billing',
      designation: 'Senior Medical Billing Specialist',
      dateOfJoining: '2026-08-20',
      employmentType: 'Full-Time (US Shift)',
      shiftTiming: '06:00 PM - 03:00 AM PKT (08:00 AM - 05:00 PM EST)',
      reportingManager: 'HR Admin',
      monthlySalary: 85000,
      bankName: 'Meezan Bank',
      bankAccountNumber: '',
    });
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee) return;
    updateEmployee(editingEmployee);
    setEditingEmployee(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-[#0c121e] border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl font-bold font-['Space_Grotesk'] text-white">
              Employee Management Directory
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Maintain employee master profiles, role assignments, salary structures, and automated 3-month probation rules.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white font-bold text-xs shadow-lg shadow-cyan-950/40 transition-all cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Employee</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-[#0c121e] border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by name, ID, role..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 text-xs"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Department:</span>
            <select
              value={selectedDept}
              onChange={e => setSelectedDept(e.target.value)}
              className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:ring-2 focus:ring-cyan-500"
            >
              <option value="All">All Departments</option>
              {departments.map(d => (
                <option key={d.id} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Status:</span>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:ring-2 focus:ring-cyan-500"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active / Confirmed</option>
              <option value="Probation">On Probation</option>
            </select>
          </div>
        </div>
      </div>

      {/* Employees Directory Table */}
      <div className="rounded-2xl bg-[#0c121e] border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white font-['Space_Grotesk']">
            Master Employee Roster ({filtered.length})
          </h2>
          <span className="text-xs font-mono text-cyan-400">Active RCM Workforce</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3.5">Employee</th>
                <th className="p-3.5">Department & Role</th>
                <th className="p-3.5">Date of Joining</th>
                <th className="p-3.5">3-Month Probation</th>
                <th className="p-3.5">Base Salary (RS)</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map(emp => (
                <tr key={emp.id} className="hover:bg-slate-800/30 transition-colors">
                  {/* Employee Info */}
                  <td className="p-3.5">
                    <div className="flex items-center gap-3">
                      <img
                        src={emp.profilePhoto}
                        alt={emp.fullName}
                        className="w-9 h-9 rounded-xl object-cover border border-slate-700 shrink-0"
                      />
                      <div>
                        <span className="font-bold text-white block">{emp.fullName}</span>
                        <span className="font-mono text-[11px] text-cyan-400">{emp.id}</span>
                      </div>
                    </div>
                  </td>

                  {/* Department & Role */}
                  <td className="p-3.5">
                    <span className="font-semibold text-slate-200 block">{emp.designation}</span>
                    <span className="text-[11px] text-slate-400">{emp.department}</span>
                  </td>

                  {/* Date of Joining */}
                  <td className="p-3.5 font-mono text-slate-300">
                    {emp.dateOfJoining}
                  </td>

                  {/* Probation Status & Countdown */}
                  <td className="p-3.5">
                    {emp.probationStatus === 'Probation Cleared' ? (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-950 text-emerald-300 border border-emerald-800/60 uppercase">
                        ✓ Cleared
                      </span>
                    ) : emp.probationStatus === 'Under Probation' ? (
                      <div>
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-amber-950 text-amber-300 border border-amber-800/60 uppercase">
                          🟡 Under Probation
                        </span>
                        <span className="block font-mono text-[10px] text-slate-400 mt-0.5">
                          Ends: {emp.probationEndDate}
                        </span>
                      </div>
                    ) : (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-cyan-950 text-cyan-300 border border-cyan-800/60 uppercase">
                        Review Required
                      </span>
                    )}
                  </td>

                  {/* Base Salary */}
                  <td className="p-3.5 font-mono font-bold text-emerald-400">
                    {emp.monthlySalary.toLocaleString()} RS
                  </td>

                  {/* Status */}
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-slate-900 text-slate-300 border border-slate-700 uppercase">
                      {emp.employmentStatus}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setEditingEmployee(emp)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        title="Edit Profile"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete ${emp.fullName}?`)) {
                            deleteEmployee(emp.id);
                          }
                        }}
                        className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 text-red-400 hover:text-red-200 transition-colors"
                        title="Delete Profile"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <Users className="w-10 h-10 text-slate-600" />
                      <div>
                        <p className="text-sm font-bold text-slate-300">No Employees Found</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {allEmployees.length === 0
                            ? 'Get started by onboarding your first company employee.'
                            : 'No employee matched your search filter criteria.'}
                        </p>
                      </div>
                      <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer mt-2"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>Onboard Employee</span>
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-2xl my-8 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white font-['Space_Grotesk']">
                  Onboard New Employee
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Full Legal Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. Zainab Mirza"
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Corporate Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="zainab.mirza@rhinomds.com"
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+92 300 1234567"
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Department *</label>
                  <select
                    value={formData.department}
                    onChange={e => setFormData({ ...formData, department: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:ring-2 focus:ring-cyan-500"
                  >
                    {departments.map(d => (
                      <option key={d.id} value={d.name}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Designation *</label>
                  <input
                    type="text"
                    required
                    value={formData.designation}
                    onChange={e => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Date of Joining *</label>
                  <input
                    type="date"
                    required
                    value={formData.dateOfJoining}
                    onChange={e => setFormData({ ...formData, dateOfJoining: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Base Monthly Salary (PKR / RS) *</label>
                  <input
                    type="number"
                    required
                    value={formData.monthlySalary}
                    onChange={e => setFormData({ ...formData, monthlySalary: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:ring-2 focus:ring-cyan-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Reporting Supervisor</label>
                  <input
                    type="text"
                    value={formData.reportingManager}
                    onChange={e => setFormData({ ...formData, reportingManager: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              {/* Automated Probation Notice */}
              <div className="p-3.5 rounded-xl bg-cyan-950/60 border border-cyan-800/80 text-cyan-200">
                <p className="font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <span>Automated 3-Month Probation Rule Applied:</span>
                </p>
                <p className="text-[11px] text-cyan-300/80 mt-1">
                  Upon creation, probation end date will automatically be computed as exact 3 months from Date of Joining ({formData.dateOfJoining}).
                </p>
              </div>

              {/* Admin Sign-In Credentials Assignment Section */}
              <div className="p-4 rounded-xl bg-slate-950 border border-cyan-700/60 space-y-3">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-cyan-400" />
                  <span className="font-bold text-white text-xs">
                    🔐 Sign-In Access & Password Setup (Admin Provisioned)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Assigned Username
                    </label>
                    <input
                      type="text"
                      value={customUsername}
                      onChange={e => setCustomUsername(e.target.value)}
                      placeholder={formData.fullName ? formData.fullName.toLowerCase().replace(/\s+/g, '.') : 'username'}
                      className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-slate-300 font-semibold">
                        Assigned Password
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const rand = Math.floor(1000 + Math.random() * 9000);
                          setCustomPassword(`Rhino@${rand}`);
                        }}
                        className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5"
                      >
                        <Sparkles className="w-2.5 h-2.5" /> Randomize
                      </button>
                    </div>
                    <input
                      type="text"
                      required
                      value={customPassword}
                      onChange={e => setCustomPassword(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Portal Access Role
                    </label>
                    <select
                      value={customRole}
                      onChange={e => setCustomRole(e.target.value as any)}
                      className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-cyan-500"
                    >
                      <option value="employee">Employee Access</option>
                      <option value="admin">HR Admin Privileges</option>
                    </select>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400">
                  * HR Admin sets this username & password. The employee will sign in using these exact credentials.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition-colors"
                >
                  Create & Enroll Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {editingEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white font-['Space_Grotesk']">
                  Edit Profile: {editingEmployee.fullName}
                </h3>
              </div>
              <button
                onClick={() => setEditingEmployee(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editingEmployee.fullName}
                    onChange={e => setEditingEmployee({ ...editingEmployee, fullName: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Designation</label>
                  <input
                    type="text"
                    value={editingEmployee.designation}
                    onChange={e => setEditingEmployee({ ...editingEmployee, designation: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Monthly Base Salary (RS)</label>
                  <input
                    type="number"
                    value={editingEmployee.monthlySalary}
                    onChange={e => setEditingEmployee({ ...editingEmployee, monthlySalary: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Employment Status</label>
                  <select
                    value={editingEmployee.employmentStatus}
                    onChange={e => setEditingEmployee({ ...editingEmployee, employmentStatus: e.target.value as EmploymentStatus })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Probation">Probation</option>
                    <option value="Resigned">Resigned</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingEmployee(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
