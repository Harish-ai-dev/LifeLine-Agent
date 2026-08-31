'use client';
import { JurisdictionAuditLog } from '@/components/authority/JurisdictionAuditLog';

export default function AuditPage() {
  return (
    <div className="space-y-6 w-full px-2 sm:px-4 lg:px-6 pb-16">
      <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Jurisdiction Regulatory &amp; Dispatch Audit Trail</h2>
      <JurisdictionAuditLog />
    </div>
  );
}
