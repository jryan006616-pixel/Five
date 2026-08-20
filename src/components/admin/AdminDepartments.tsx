import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Building,
  Users,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
} from 'lucide-react';

export const AdminDepartments: React.FC = () => {
  const { departments, allEmployees } = useApp();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-[#0c121e] border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl font-bold font-['Space_Grotesk'] text-white">
              Departments & RCM Operations Units
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage corporate business units, operational leads, and headcount distribution across Rhinomds.
          </p>
        </div>

        <div className="text-xs font-mono text-cyan-400">
          <strong>{departments.length} Operational Units</strong> Active
        </div>
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map(dept => {
          const empList = allEmployees.filter(e => e.department === dept.name);

          return (
            <div
              key={dept.id}
              className="rounded-2xl bg-[#0c121e] border border-slate-800 p-5 shadow-lg space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold text-cyan-400 uppercase">
                    {dept.code}
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-cyan-950 text-cyan-300 border border-cyan-800">
                    {empList.length} Staff
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white font-['Space_Grotesk']">
                    {dept.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {dept.description}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Department Lead</span>
                  <p className="font-semibold text-slate-200 mt-0.5">{dept.lead}</p>
                </div>
              </div>

              {/* Staff Avatars */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <div className="flex -space-x-2">
                  {empList.slice(0, 4).map(emp => (
                    <img
                      key={emp.id}
                      src={emp.profilePhoto}
                      alt={emp.fullName}
                      title={emp.fullName}
                      className="w-7 h-7 rounded-full object-cover border-2 border-slate-900"
                    />
                  ))}
                </div>
                <span className="text-[11px] text-slate-400">
                  {empList.length} Active Specialists
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
