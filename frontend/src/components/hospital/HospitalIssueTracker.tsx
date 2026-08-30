'use client';

import React, { useState } from 'react';
import {
  AlertTriangle,
  PlusCircle,
  CheckCircle2,
  Clock,
  Filter,
  Wrench,
  Building,
  Users,
  Package,
  Check,
  X,
  ShieldAlert,
} from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import { HospitalIssue } from '../../types/dashboard';

export const HospitalIssueTracker: React.FC = () => {
  const { issues, createIssue, resolveIssue, currentHospital, currentUser } = useDashboard();

  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Issue Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<HospitalIssue['category']>('equipment');
  const [severity, setSeverity] = useState<HospitalIssue['severity']>('moderate');

  // Filter issues for current hospital
  const hospitalIssues = issues.filter(
    (i) => i.hospital_id === currentHospital.id || i.hospital_name === currentHospital.name
  );

  const filteredIssues = hospitalIssues.filter((i) => {
    if (categoryFilter !== 'all' && i.category !== categoryFilter) return false;
    if (statusFilter !== 'all' && i.status !== statusFilter) return false;
    return true;
  });

  const activeCount = hospitalIssues.filter((i) => i.status !== 'resolved').length;
  const criticalCount = hospitalIssues.filter(
    (i) => i.status !== 'resolved' && (i.severity === 'critical' || i.severity === 'high')
  ).length;

  const handleCreateIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    createIssue({
      hospital_id: currentHospital.id,
      hospital_name: currentHospital.name,
      category,
      title: title.trim(),
      description: description.trim(),
      severity,
      status: 'investigating',
      reported_by: currentUser.title ? `${currentUser.username} (${currentUser.title})` : currentUser.username,
    });

    setTitle('');
    setDescription('');
    setShowAddModal(false);
  };

  const getCategoryIcon = (cat: HospitalIssue['category']) => {
    switch (cat) {
      case 'equipment':
        return <Wrench className="w-4 h-4 text-sky-600 dark:text-sky-400" />;
      case 'facility':
        return <Building className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />;
      case 'staffing':
        return <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      case 'supplies':
        return <Package className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
    }
  };

  const getSeverityBadge = (sev: HospitalIssue['severity']) => {
    switch (sev) {
      case 'critical':
        return 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-500/40 animate-pulse';
      case 'high':
        return 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-500/40';
      case 'moderate':
        return 'bg-sky-100 dark:bg-sky-500/20 text-sky-800 dark:text-sky-300 border-sky-200 dark:border-sky-500/40';
      case 'low':
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="space-y-4">
      {/* ── Top Bar & Stats ─────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#0e1424] rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              Operational &amp; Biomedical Equipment Incident Board
            </h3>
            <span className="text-xs font-mono font-bold bg-slate-100 dark:bg-[#111728] text-slate-700 dark:text-slate-300 px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
              {activeCount} Active
            </span>
            {criticalCount > 0 && (
              <span className="text-[10px] font-mono font-black uppercase bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-500/40 px-2.5 py-0.5 rounded-full animate-pulse">
                {criticalCount} Critical
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
            Directly impacts BedMatchingCoordinator routing logic for {currentHospital.name}.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 py-2.5 px-4 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-mono font-bold transition shadow-md shadow-sky-600/30"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Report Facility Incident</span>
        </button>
      </div>

      {/* ── Filters ──────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-[#0e1424] p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-mono shadow-sm">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-slate-500 dark:text-slate-400 font-bold px-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Category:</span>
          </span>
          {['all', 'equipment', 'supplies', 'facility', 'staffing'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 rounded-lg font-bold capitalize transition-colors ${
                categoryFilter === cat
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#080d16] p-1 rounded-xl border border-slate-200 dark:border-slate-800">
          {['all', 'investigating', 'resolved'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg font-bold capitalize transition-colors ${
                statusFilter === st
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* ── Issues List ─────────────────────────────────────────────────── */}
      {filteredIssues.length === 0 ? (
        <div className="bg-white dark:bg-[#0e1424] rounded-3xl p-12 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-slate-900 dark:text-white text-sm">No Active Issues in this Category</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
            All facility systems, ventilators, and biomedical equipment operating within normal parameters.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredIssues.map((issue) => {
            const isResolved = issue.status === 'resolved';

            return (
              <div
                key={issue.id}
                className={`bg-white dark:bg-[#0e1424] rounded-2xl p-5 border transition-all duration-200 shadow-sm ${
                  isResolved
                    ? 'border-slate-200 dark:border-slate-800 opacity-60'
                    : issue.severity === 'critical'
                    ? 'border-red-300 dark:border-red-500/50 bg-red-50/70 dark:bg-gradient-to-r dark:from-red-950/20 dark:via-[#0e1424] dark:to-[#0e1424]'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      {getCategoryIcon(issue.category)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase border ${getSeverityBadge(
                            issue.severity
                          )}`}
                        >
                          {issue.severity}
                        </span>
                        <span className="text-xs font-mono text-slate-500 dark:text-slate-400 capitalize">
                          {issue.category}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{issue.title}</h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 font-mono text-xs">
                    {!isResolved ? (
                      <button
                        onClick={() => resolveIssue(issue.id)}
                        className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-600/20 dark:hover:bg-emerald-600/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/40 rounded-xl font-bold transition-colors flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Mark Resolved</span>
                      </button>
                    ) : (
                      <span className="text-slate-500 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Resolved
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans mt-2">
                  {issue.description}
                </p>

                <div className="flex justify-between items-center pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/80 text-[10px] font-mono text-slate-500 dark:text-slate-400">
                  <span>Reported by: <strong className="text-slate-700 dark:text-slate-300">{issue.reported_by}</strong></span>
                  <span>Logged: {new Date(issue.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Add Issue Modal ──────────────────────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#0e1422] border border-slate-200 dark:border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                Report Facility / Operational Issue
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateIssue} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">Issue Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="E.g., CT Scanner 2 Calibration Error, ER Overcrowding..."
                  required
                  className="w-full bg-slate-50 dark:bg-[#080d16] border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-[#080d16] border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="equipment">Biomedical Equipment</option>
                    <option value="supplies">Critical Supplies</option>
                    <option value="facility">Facility &amp; Infrastructure</option>
                    <option value="staffing">Staffing &amp; Clinical Load</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">Severity Level</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-[#080d16] border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="low">Low (Routine)</option>
                    <option value="moderate">Moderate (Impacts 1 Bay)</option>
                    <option value="high">High (Department Delay)</option>
                    <option value="critical">Critical (May Trigger Diversion)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">Detailed Clinical Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  required
                  placeholder="Provide context, affected trauma bays, technician ETA..."
                  className="w-full bg-slate-50 dark:bg-[#080d16] border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500 font-sans"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl shadow-md shadow-sky-600/30"
                >
                  Submit Issue Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
