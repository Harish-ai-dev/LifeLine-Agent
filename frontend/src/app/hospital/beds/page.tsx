'use client';
import { CapacityManager } from '@/components/hospital/CapacityManager';

export default function BedsPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Emergency Department Bed &amp; Trauma Bay Capacity</h2>
      <CapacityManager />
    </div>
  );
}
