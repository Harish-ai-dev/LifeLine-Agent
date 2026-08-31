'use client';
import { HospitalInventoryManager } from '@/components/hospital/HospitalInventoryManager';

export default function InventoryPage() {
  return (
    <div className="space-y-6 w-full px-2 sm:px-4 lg:px-6 pb-16">
      <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Pharmacy &amp; Critical Emergency Supply Inventory</h2>
      <HospitalInventoryManager />
    </div>
  );
}
