'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDashboard } from '../context/DashboardContext';
import { Activity } from 'lucide-react';

export default function RootRedirect() {
  const router = useRouter();
  const { currentUser, authToken } = useDashboard();

  useEffect(() => {
    // If no user session is authenticated, route immediately to /login
    if (!authToken || !currentUser) {
      router.push('/login');
    } else {
      if (currentUser.role === 'blood_donor') router.push('/donor');
      else if (currentUser.role === 'hospital_staff') router.push('/hospital');
      else if (currentUser.role === 'government_authority') router.push('/government');
      else router.push('/login');
    }
  }, [currentUser, authToken, router]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080c14] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-sky-600 flex items-center justify-center text-white shadow-lg animate-pulse">
          <Activity className="h-6 w-6" />
        </div>
        <span className="text-xs font-mono font-bold text-slate-500">Routing LifeLine Gateway...</span>
      </div>
    </div>
  );
}
