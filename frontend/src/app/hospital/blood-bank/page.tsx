'use client';
import { HospitalBloodBank } from '@/components/hospital/HospitalBloodBank';

export default function BloodBankPage() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">Facility Blood Bank Inventory &amp; Rapid Transfusion</h2>
      <HospitalBloodBank />
    </div>
  );
}
