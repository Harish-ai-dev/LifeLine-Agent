'use client';
import { HospitalInventoryManager } from '@/components/hospital/HospitalInventoryManager';

export default function InventoryPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Pharmacy &amp; Critical Emergency Supply Inventory</h2>
      <HospitalInventoryManager />
    </div>
  );
}
