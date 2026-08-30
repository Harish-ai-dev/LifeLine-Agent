'use client';
import { DailyIntelligenceReportView } from '@/components/authority/DailyIntelligenceReportView';

export default function ReportPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">AI Regional Intelligence Briefing</h2>
      <DailyIntelligenceReportView />
    </div>
  );
}
