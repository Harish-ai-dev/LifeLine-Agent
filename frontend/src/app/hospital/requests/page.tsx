'use client';
import { DonorNotificationPanel } from '@/components/hospital/DonorNotificationPanel';

export default function RequestsPage() {
  return (
    <div className="space-y-6 w-full px-2 sm:px-4 lg:px-6 pb-16">
      <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Resource Requests &amp; Inbound Donors</h2>
      <DonorNotificationPanel />
    </div>
  );
}
