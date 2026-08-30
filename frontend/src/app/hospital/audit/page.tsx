'use client';
import { HospitalAuditLog } from '@/components/hospital/HospitalAuditLog';

export default function AuditPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Facility Decision &amp; Dispatch Audit Trail</h2>
      <HospitalAuditLog />
    </div>
  );
}
