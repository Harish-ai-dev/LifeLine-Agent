'use client';
import { NetworkQueryConsole } from '@/components/authority/NetworkQueryConsole';

export default function AskAIPage() {
  return (
    <div className="space-y-6 w-full px-2 sm:px-4 lg:px-6 pb-16">
      <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Ask AI - Regional Intelligence Query Engine</h2>
      <NetworkQueryConsole />
    </div>
  );
}
