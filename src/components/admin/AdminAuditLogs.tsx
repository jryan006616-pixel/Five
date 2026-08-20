import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldAlert,
  Search,
  Filter,
  Lock,
  User,
  Clock,
  CheckCircle2,
  FileCheck,
} from 'lucide-react';

export const AdminAuditLogs: React.FC = () => {
  const { auditLogs } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const filteredLogs = auditLogs.filter(log => {
    const matchQuery =
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.performedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.targetUser.toLowerCase().includes(searchQuery.toLowerCase());

    const matchCategory = categoryFilter === 'All' || log.category === categoryFilter;

    return matchQuery && matchCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-[#0c121e] border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl font-bold font-['Space_Grotesk'] text-white">
              Enterprise Security & Audit Trail
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            HIPAA-compliant, immutable logging of all administrative actions, salary adjustments, and status transitions.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs">
          <Lock className="w-4 h-4 text-emerald-400" />
          <span className="text-slate-300">256-Bit Cryptographic Ledger</span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="p-4 rounded-2xl bg-[#0c121e] border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search audit trail..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 placeholder-slate-500 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-slate-400">Category:</span>
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs"
          >
            <option value="All">All Categories</option>
            <option value="Authentication">Authentication</option>
            <option value="Attendance">Attendance</option>
            <option value="Probation">Probation</option>
            <option value="Payroll">Payroll</option>
            <option value="KPI">KPI</option>
            <option value="Policy">Policy</option>
          </select>
        </div>
      </div>

      {/* Audit Log Timeline / Table */}
      <div className="rounded-2xl bg-[#0c121e] border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white font-['Space_Grotesk']">
            Security Audit Events ({filteredLogs.length})
          </h2>
          <span className="text-xs font-mono text-cyan-400">Tamper-Proof Stream</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Action Executed</th>
                <th className="p-3.5">Operator</th>
                <th className="p-3.5">Target</th>
                <th className="p-3.5">Detailed Audit Context</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-3.5 text-slate-400 text-[11px]">
                    {log.timestamp}
                  </td>

                  <td className="p-3.5 font-sans">
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-slate-900 text-cyan-300 border border-slate-700 uppercase">
                      {log.category}
                    </span>
                  </td>

                  <td className="p-3.5 font-sans font-semibold text-white">
                    {log.action}
                  </td>

                  <td className="p-3.5 font-sans text-slate-300">
                    {log.performedBy}
                  </td>

                  <td className="p-3.5 font-sans text-cyan-300 font-medium">
                    {log.targetUser}
                  </td>

                  <td className="p-3.5 font-sans text-[11px] text-slate-300 max-w-sm leading-relaxed">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
