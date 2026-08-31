'use client';
import { CapacityManager } from '@/components/hospital/CapacityManager';

export default function BedsPage() {
  return (
    <div className="space-y-6 w-full px-2 sm:px-4 lg:px-6 pb-16">
      <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Emergency Department Bed &amp; Trauma Bay Capacity</h2>
      <CapacityManager />
    </div>
  );
}
