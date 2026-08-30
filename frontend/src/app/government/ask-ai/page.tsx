'use client';
import { NetworkQueryConsole } from '@/components/authority/NetworkQueryConsole';

export default function AskAIPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Ask AI - Regional Intelligence Query Engine</h2>
      <NetworkQueryConsole />
    </div>
  );
}
