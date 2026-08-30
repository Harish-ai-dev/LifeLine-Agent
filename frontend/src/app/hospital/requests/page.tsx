'use client';
import { DonorNotificationPanel } from '@/components/hospital/DonorNotificationPanel';

export default function RequestsPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Resource Requests &amp; Inbound Donors</h2>
      <DonorNotificationPanel />
    </div>
  );
}
