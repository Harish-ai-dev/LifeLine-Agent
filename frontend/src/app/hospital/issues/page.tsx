'use client';
import { HospitalIssueTracker } from '@/components/hospital/HospitalIssueTracker';

export default function IssuesPage() {
  return (
    <div className="space-y-6 w-full px-2 sm:px-4 lg:px-6 pb-16">
      <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Facility Operational Issue &amp; Defect Tracker</h2>
      <HospitalIssueTracker />
    </div>
  );
}
