import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User, UserRole } from '../../types';
import {
  KeyRound,
  Shield,
  Search,
  Eye,
  EyeOff,
  Copy,
  Check,
  RefreshCw,
  UserCheck,
  Lock,
  Sparkles,
  AlertCircle,
  Edit,
  Plus,
  FileText,
  Building,
  CheckCircle2,
  X,
  ExternalLink,
  ShieldAlert,
  UserPlus,
} from 'lucide-react';

export const AdminUserCredentials: React.FC = () => {
  const {
    allUsers,
    allEmployees,
    adminUpdateUserCredentials,
    adminResetPassword,
    adminCreateUserAccount,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'All' | 'admin' | 'employee'>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Suspended'>('All');

  // Password visibility map { [userId]: boolean }
  const [revealedPasswords, setRevealedPasswords] = useState<{ [key: string]: boolean }>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Edit / Reset Modal State
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<User | null>(null);
  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('employee');
  const [editStatus, setEditStatus] = useState<'Active' | 'Suspended' | 'Locked'>('Active');
  const [showModalPassword, setShowModalPassword] = useState(false);
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  // Create New User Account Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createEmployeeId, setCreateEmployeeId] = useState('');
  const [createUsername, setCreateUsername] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [createRole, setCreateRole] = useState<UserRole>('employee');

  // Credential Card Modal
  const [credentialCardUser, setCredentialCardUser] = useState<User | null>(null);

  // Toggle reveal
  const togglePasswordReveal = (userId: string) => {
    setRevealedPasswords(prev => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  // Copy helper
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Filter users
  const filteredUsers = allUsers.filter(u => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      u.fullName.toLowerCase().includes(query) ||
      u.username.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query) ||
      u.employeeId.toLowerCase().includes(query);

    const matchesRole = roleFilter === 'All' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'All' || (u.accountStatus || 'Active') === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Open Edit Modal
  const handleOpenEdit = (user: User) => {
    setSelectedUserForEdit(user);
    setEditUsername(user.username);
    setEditPassword(user.password || '');
    setEditRole(user.role);
    setEditStatus(user.accountStatus || 'Active');
    setShowModalPassword(true);
    setFeedbackNotice(null);
  };

  // Generate strong random password
  const generateRandomPassword = (name?: string) => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%';
    let rand = '';
    for (let i = 0; i < 4; i++) {
      rand += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const cleanName = name ? name.split(' ')[0] : 'Rhino';
    return `${cleanName}@${rand}`;
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForEdit) return;

    if (!editUsername.trim() || !editPassword.trim()) {
      setFeedbackNotice('Username and password cannot be empty.');
      return;
    }

    adminUpdateUserCredentials(
      selectedUserForEdit.id,
      editUsername,
      editPassword,
      editRole,
      editStatus
    );

    setFeedbackNotice('✅ Credentials successfully updated by Admin!');
    setTimeout(() => {
      setSelectedUserForEdit(null);
      setFeedbackNotice(null);
    }, 900);
  };

  const handleQuickReset = (user: User) => {
    const newPass = adminResetPassword(user.id);
    setRevealedPasswords(prev => ({ ...prev, [user.id]: true }));
    setFeedbackNotice(`Password for @${user.username} was reset to: ${newPass}`);
    setTimeout(() => setFeedbackNotice(null), 4000);
  };

  const handleCreateUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createEmployeeId || !createUsername || !createPassword) return;

    const created = adminCreateUserAccount(createEmployeeId, createUsername, createPassword, createRole);
    setShowCreateModal(false);
    setCredentialCardUser(created);
    setCreateEmployeeId('');
    setCreateUsername('');
    setCreatePassword('');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-[#0c121e] border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-700/60 text-cyan-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold font-['Space_Grotesk'] text-white">
                User Accounts & Password Management
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Admin-governed authentication authority. Assign, view, change, and reset usernames & passwords for all workforce accounts.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setShowCreateModal(true);
              setCreatePassword(generateRandomPassword());
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white font-bold text-xs shadow-lg shadow-cyan-950/40 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Create New Login</span>
          </button>
        </div>
      </div>

      {feedbackNotice && (
        <div className="p-3.5 rounded-xl bg-cyan-950/70 border border-cyan-600/80 text-cyan-200 text-xs flex items-center justify-between animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{feedbackNotice}</span>
          </div>
          <button onClick={() => setFeedbackNotice(null)} className="text-cyan-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[#0c121e] border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Total Portal Accounts</span>
            <UserCheck className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-white">{allUsers.length}</p>
          <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
            <Check className="w-3 h-3" /> All accounts verified
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#0c121e] border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Admin Authorities</span>
            <Shield className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-white">
            {allUsers.filter(u => u.role === 'admin').length}
          </p>
          <p className="text-[11px] text-amber-400 mt-1">Full control over employee credentials</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#0c121e] border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Employee Logins</span>
            <Lock className="w-4 h-4 text-sky-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-white">
            {allUsers.filter(u => u.role === 'employee').length}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Staff portal sign-in enabled</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#0c121e] border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Encryption Standard</span>
            <Sparkles className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-sm font-bold font-mono text-cyan-300 mt-1">SHA-256 / HIPAA</p>
          <p className="text-[11px] text-slate-400 mt-1">Admin signed password policy</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-[#0c121e] border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by name, username, email, ID..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 text-xs"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Role:</span>
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value as any)}
              className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:ring-2 focus:ring-cyan-500"
            >
              <option value="All">All Roles</option>
              <option value="admin">Admin</option>
              <option value="employee">Employee</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Status:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:ring-2 focus:ring-cyan-500"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* User Accounts Credentials Table */}
      <div className="overflow-hidden rounded-2xl bg-[#0c121e] border border-slate-800 shadow-xl">
        <div className="p-4 border-b border-slate-800/80 bg-slate-900/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Active User Credentials Directory ({filteredUsers.length})
            </span>
          </div>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            * Passwords can be viewed, copied, and edited directly by HR Admin
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80 text-[11px] uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">User / Employee</th>
                <th className="py-3 px-4">Sign-In Username</th>
                <th className="py-3 px-4">Assigned Password</th>
                <th className="py-3 px-4">Role & Status</th>
                <th className="py-3 px-4">Assigned By / Updated</th>
                <th className="py-3 px-4 text-right">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredUsers.map(user => {
                const isRevealed = revealedPasswords[user.id];
                const isCopied = copiedKey === user.id;
                const emp = allEmployees.find(e => e.id === user.employeeId);

                return (
                  <tr key={user.id} className="hover:bg-slate-800/30 transition-colors">
                    {/* User info */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                          alt={user.fullName}
                          className="w-9 h-9 rounded-xl object-cover border border-slate-700 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-white leading-tight truncate">{user.fullName}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="font-mono text-[10px] text-cyan-400 font-semibold">{user.employeeId}</span>
                            <span className="text-[10px] text-slate-400 truncate">• {emp?.department || 'RCM Operations'}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Username */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700/80 font-mono text-cyan-300 font-bold text-xs">
                          @{user.username}
                        </span>
                        <button
                          onClick={() => handleCopy(user.username, `user_${user.id}`)}
                          className="p-1 text-slate-500 hover:text-cyan-400 rounded-md hover:bg-slate-800"
                          title="Copy Username"
                        >
                          {copiedKey === `user_${user.id}` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                      <span className="text-[10px] text-slate-500 block mt-0.5">{user.email}</span>
                    </td>

                    {/* Password with Show/Hide & Copy */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <div className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700/80 font-mono text-xs font-semibold text-slate-200 min-w-[120px]">
                          {isRevealed ? (
                            <span className="text-emerald-400 font-bold">{user.password}</span>
                          ) : (
                            <span className="text-slate-500 tracking-widest font-mono">••••••••</span>
                          )}
                        </div>

                        <button
                          onClick={() => togglePasswordReveal(user.id)}
                          className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-900/80 border border-slate-700 hover:bg-slate-800"
                          title={isRevealed ? 'Hide Password' : 'Show Password'}
                        >
                          {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          onClick={() => handleCopy(user.password, `pass_${user.id}`)}
                          className="p-1.5 text-slate-400 hover:text-cyan-400 rounded-lg bg-slate-900/80 border border-slate-700 hover:bg-slate-800"
                          title="Copy Password"
                        >
                          {copiedKey === `pass_${user.id}` ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Role & Status */}
                    <td className="py-3 px-4">
                      <div className="flex flex-col gap-1 items-start">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            user.role === 'admin'
                              ? 'bg-amber-950/80 text-amber-300 border border-amber-800'
                              : 'bg-cyan-950/80 text-cyan-300 border border-cyan-800'
                          }`}
                        >
                          {user.role === 'admin' ? '👑 Admin' : '👤 Employee'}
                        </span>

                        <span
                          className={`text-[10px] font-semibold flex items-center gap-1 ${
                            user.accountStatus === 'Suspended' ? 'text-red-400' : 'text-emerald-400'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              user.accountStatus === 'Suspended' ? 'bg-red-400' : 'bg-emerald-400 animate-pulse'
                            }`}
                          />
                          {user.accountStatus || 'Active'}
                        </span>
                      </div>
                    </td>

                    {/* Assigned By */}
                    <td className="py-3 px-4">
                      <p className="text-[11px] font-medium text-slate-300">
                        {user.assignedBy || 'HR Admin (Sarah Jenkins)'}
                      </p>
                      <span className="text-[10px] text-slate-500">
                        Updated: {user.passwordUpdatedAt || '2026-08-01'}
                      </span>
                    </td>

                    {/* Admin Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setCredentialCardUser(user)}
                          className="p-1.5 text-slate-400 hover:text-cyan-300 rounded-lg bg-slate-900 border border-slate-700 hover:bg-slate-800 transition-colors"
                          title="Generate & View Employee Credential Card"
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleQuickReset(user)}
                          className="p-1.5 text-amber-400 hover:text-amber-300 rounded-lg bg-slate-900 border border-slate-700 hover:bg-slate-800 transition-colors"
                          title="Quick 1-Click Password Reset"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleOpenEdit(user)}
                          className="px-2.5 py-1 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-700/80 text-cyan-300 font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Edit className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Credentials Modal */}
      {selectedUserForEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl bg-[#0f172a] border border-slate-700 shadow-2xl p-6 relative">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white font-['Space_Grotesk']">
                  Edit Credentials for {selectedUserForEdit.fullName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedUserForEdit(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-3">
                <img
                  src={selectedUserForEdit.avatar}
                  alt={selectedUserForEdit.fullName}
                  className="w-10 h-10 rounded-xl object-cover border border-cyan-500"
                />
                <div>
                  <p className="font-bold text-white text-sm">{selectedUserForEdit.fullName}</p>
                  <p className="text-slate-400 text-[11px]">
                    Employee ID: <span className="font-mono text-cyan-400">{selectedUserForEdit.employeeId}</span> • {selectedUserForEdit.email}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Portal Username (Sign-in Identifier)
                </label>
                <input
                  type="text"
                  required
                  value={editUsername}
                  onChange={e => setEditUsername(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:ring-2 focus:ring-cyan-500"
                  placeholder="e.g. tariq.mahmood"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-300 font-semibold">
                    Assigned Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setEditPassword(generateRandomPassword(selectedUserForEdit.fullName))}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" /> Generate Strong Password
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showModalPassword ? 'text' : 'password'}
                    required
                    value={editPassword}
                    onChange={e => setEditPassword(e.target.value)}
                    className="w-full p-2.5 pr-10 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:ring-2 focus:ring-cyan-500"
                    placeholder="Enter password..."
                  />
                  <button
                    type="button"
                    onClick={() => setShowModalPassword(!showModalPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                  >
                    {showModalPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  * HR Admin sets this password. The user will use this exact password to sign in.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    System Role
                  </label>
                  <select
                    value={editRole}
                    onChange={e => setEditRole(e.target.value as UserRole)}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="employee">Employee (Standard Access)</option>
                    <option value="admin">Administrator (HR / Full Access)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Account Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={e => setEditStatus(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-cyan-500"
                  >
                    <option value="Active">Active (Permitted)</option>
                    <option value="Suspended">Suspended (Blocked)</option>
                    <option value="Locked">Locked</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedUserForEdit(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white font-bold text-xs shadow-lg shadow-cyan-950/40"
                >
                  Save & Apply Credentials
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create New User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl bg-[#0f172a] border border-slate-700 shadow-2xl p-6 relative">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white font-['Space_Grotesk']">
                  Create Sign-In Credentials
                </h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUserSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Select Employee
                </label>
                <select
                  required
                  value={createEmployeeId}
                  onChange={e => {
                    setCreateEmployeeId(e.target.value);
                    const emp = allEmployees.find(emp => emp.id === e.target.value);
                    if (emp) {
                      setCreateUsername(emp.fullName.toLowerCase().replace(/\s+/g, '.'));
                      setCreatePassword(generateRandomPassword(emp.fullName));
                    }
                  }}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="">-- Choose Employee --</option>
                  {allEmployees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.fullName} ({emp.id} - {emp.designation})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Username
                </label>
                <input
                  type="text"
                  required
                  value={createUsername}
                  onChange={e => setCreateUsername(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:ring-2 focus:ring-cyan-500"
                  placeholder="e.g. employee.name"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-300 font-semibold">
                    Assigned Initial Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setCreatePassword(generateRandomPassword())}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" /> Auto-Generate
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={createPassword}
                  onChange={e => setCreatePassword(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:ring-2 focus:ring-cyan-500"
                  placeholder="Password..."
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Role
                </label>
                <select
                  value={createRole}
                  onChange={e => setCreateRole(e.target.value as UserRole)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="employee">Employee</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white font-bold text-xs shadow-lg shadow-cyan-950/40"
                >
                  Create & Issue Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Employee Credential Card / Slip Modal */}
      {credentialCardUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-3xl bg-[#090d16] border-2 border-cyan-500/60 shadow-2xl p-6 relative overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800 relative z-10">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Rhinomds Portal Credential Slip
                </h3>
              </div>
              <button
                onClick={() => setCredentialCardUser(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs relative z-10">
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-700/80 text-center">
                <img
                  src={credentialCardUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
                  alt={credentialCardUser.fullName}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-cyan-400 mx-auto shadow-lg shadow-cyan-950/40"
                />
                <h4 className="text-base font-bold text-white mt-2.5 font-['Space_Grotesk']">
                  {credentialCardUser.fullName}
                </h4>
                <p className="text-cyan-400 text-xs font-mono font-semibold">
                  {credentialCardUser.employeeId}
                </p>
                <p className="text-slate-400 text-[11px]">{credentialCardUser.email}</p>
              </div>

              <div className="p-4 rounded-2xl bg-[#0c121e] border border-cyan-800/60 space-y-2.5">
                <div className="flex items-center justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Portal URL:</span>
                  <span className="font-mono text-cyan-300 font-semibold">https://portal.rhinomds.com</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Username:</span>
                  <span className="font-mono text-white font-bold bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-700">
                    {credentialCardUser.username}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Assigned Password:</span>
                  <span className="font-mono text-emerald-400 font-bold bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-700">
                    {credentialCardUser.password}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-400">Assigned Role:</span>
                  <span className="font-semibold text-cyan-400 capitalize">
                    {credentialCardUser.role} Access
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  Please keep your credentials confidential. Passwords are case-sensitive and registered by HR Admin.
                </span>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => {
                    const slipText = `RHINOMDS EMPLOYEE PORTAL CREDENTIALS\nName: ${credentialCardUser.fullName}\nEmployee ID: ${credentialCardUser.employeeId}\nPortal URL: https://portal.rhinomds.com\nUsername: ${credentialCardUser.username}\nPassword: ${credentialCardUser.password}\nRole: ${credentialCardUser.role}\nAssigned by: Sarah Jenkins (HR Admin)`;
                    navigator.clipboard.writeText(slipText);
                    setFeedbackNotice('✅ Credential slip copied to clipboard!');
                    setTimeout(() => setFeedbackNotice(null), 3000);
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-700/80 text-cyan-300 font-bold text-xs transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy Full Slip</span>
                </button>

                <button
                  onClick={() => setCredentialCardUser(null)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
