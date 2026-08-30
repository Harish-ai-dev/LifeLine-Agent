'use client';

import React, { useState } from 'react';
import {
  MessageSquareCode,
  Sparkles,
  Send,
  Building2,
  Clock,
  HelpCircle,
  Activity,
  CheckCircle2,
  Copy,
  Check,
  Bot,
  Search,
} from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import { NaturalLanguageQueryResponse } from '../../types/dashboard';
import { SAMPLE_NL_QUERIES } from '../../data/mockDashboardData';

export const NetworkQueryConsole: React.FC = () => {
  const { queryNetworkState } = useDashboard();

  const [inputQuery, setInputQuery] = useState('');
  const [isQuerying, setIsQuerying] = useState(false);
  const [history, setHistory] = useState<NaturalLanguageQueryResponse[]>(
    SAMPLE_NL_QUERIES.map((s) => s.response)
  );
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleExecuteQuery = async (queryText: string) => {
    if (!queryText.trim()) return;
    setIsQuerying(true);

    try {
      const response = await queryNetworkState(queryText.trim());
      setHistory((prev) => [response, ...prev]);
      setInputQuery('');
    } finally {
      setIsQuerying(false);
    }
  };

  const handleCopyAnswer = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="bg-white dark:bg-[#0e1424] rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-5">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-600/20 border border-purple-200 dark:border-purple-500/30 text-purple-700 dark:text-purple-400 flex items-center justify-center font-black shrink-0">
            <Bot className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider bg-purple-100 dark:bg-purple-500/20 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-400/30 px-2.5 py-0.5 rounded-full flex items-center gap-1 font-mono">
                <Sparkles className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                <span>NATURAL LANGUAGE QUERY ASSISTANT</span>
              </span>
              <span className="text-xs font-mono font-bold bg-slate-100 dark:bg-[#111728] text-slate-700 dark:text-slate-300 px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                Gemini 3.5 Flash Inspector
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
              Ask AI Regional Intelligence Inspector
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
              Query cross-hospital bed capacity, incident histories, diversion logs, and blood reserves.
            </p>
          </div>
        </div>
      </div>

      {/* ── Search Input & Execute ────────────────────────────────────────── */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleExecuteQuery(inputQuery);
        }}
        className="space-y-3"
      >
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-[#080d16] border border-slate-200 dark:border-slate-700/80 rounded-2xl p-2 pl-4 focus-within:border-purple-500 transition-colors shadow-inner">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask anything (e.g., 'Which hospitals have neuro-trauma capacity?', 'Why is KEM diverting?')..."
            className="flex-1 bg-transparent text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none font-mono"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || isQuerying}
            className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-40 text-white font-mono font-bold text-xs rounded-xl transition-all shadow-md shadow-purple-600/30 flex items-center gap-1.5 shrink-0"
          >
            {isQuerying ? <Activity className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            <span>{isQuerying ? 'Querying Graph...' : 'Execute Query'}</span>
          </button>
        </div>

        {/* Preset Sample Prompts */}
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
          <span className="text-slate-500">Suggested:</span>
          {SAMPLE_NL_QUERIES.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleExecuteQuery(s.query)}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-[#111728] dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 transition-colors"
            >
              {s.query}
            </button>
          ))}
        </div>
      </form>

      {/* ── Query Responses Feed ─────────────────────────────────────────── */}
      <div className="space-y-4 pt-2">
        <h3 className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Query Execution History &amp; Synthesis ({history.length})
        </h3>

        {history.map((item, index) => (
          <div
            key={index}
            className="p-5 rounded-2xl bg-slate-50 dark:bg-[#111728] border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm"
          >
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 pb-2">
              <span className="text-xs font-mono font-bold text-purple-800 dark:text-purple-300 flex items-center gap-1.5">
                <Bot className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                Query: &quot;{item.query}&quot;
              </span>
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                {item.timestamp ? new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Simulated Telemetry'}
              </span>
            </div>

            <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-sans">
              {item.answer}
            </p>

            {item.referenced_facilities && item.referenced_facilities.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-800/80 text-[10px] font-mono text-slate-500 dark:text-slate-400">
                <span>Referenced Facilities:</span>
                {item.referenced_facilities.map((h, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-white dark:bg-[#080d16] text-sky-700 dark:text-sky-400 border border-slate-200 dark:border-slate-800">
                    {h}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
