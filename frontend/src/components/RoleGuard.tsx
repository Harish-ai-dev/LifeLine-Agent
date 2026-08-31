'use client';

import React, { useEffect } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { useRouter } from 'next/navigation';
import { ShieldAlert, ArrowRight, Activity, Lock } from 'lucide-react';
import Link from 'next/link';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: ('hospital_staff' | 'blood_donor' | 'government_authority')[];
}

export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { currentUser, authToken, logout, isAuthLoading } = useDashboard();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthLoading && (!authToken || !currentUser)) {
      router.push('/');
    }
  }, [authToken, currentUser, router, isAuthLoading]);

  if (isAuthLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!authToken || !currentUser) {
    return null; // Let the redirect trigger
  }

  const hasAccess = allowedRoles.includes(currentUser.role as any);

  if (!hasAccess) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center max-w-lg mx-auto space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/30 text-red-600 border border-red-200 dark:border-red-500/30 flex items-center justify-center shadow-lg shadow-red-500/10">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase font-mono">
            Access Restrained
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            SECURITY DISPATCH LEVEL VERIFICATION FAILURE
          </p>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          Your current session role (**{currentUser.role.replace('_', ' ').toUpperCase()}**) does not possess 
          accreditation credentials to enter this operational sector. Access is locked under regulatory health privacy acts.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 w-full justify-center pt-2">
          <button
            onClick={() => {
              if (currentUser.role === 'blood_donor') router.push('/donor');
              else if (currentUser.role === 'hospital_staff') router.push('/hospital');
              else if (currentUser.role === 'government_authority') router.push('/government');
            }}
            className="flex-1 max-w-[200px] py-2.5 px-4 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-mono font-bold text-[11px] rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <span>Return to Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          
          <button
            onClick={logout}
            className="flex-1 max-w-[200px] py-2.5 px-4 bg-red-50 dark:bg-red-950/20 text-red-600 hover:bg-red-100 border border-red-200 dark:border-red-500/30 font-mono font-bold text-[11px] rounded-xl transition-all"
          >
            Switch Accounts
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
