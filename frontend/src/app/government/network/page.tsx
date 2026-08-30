'use client';
import { JurisdictionMap } from '@/components/authority/JurisdictionMap';

export default function NetworkPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Regional Network Overview &amp; Proximity Map</h2>
      <JurisdictionMap />
    </div>
  );
}
