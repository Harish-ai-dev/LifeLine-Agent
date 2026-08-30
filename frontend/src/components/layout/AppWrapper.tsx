'use client';

import React, { useState, useEffect } from 'react';
import LoadingScreen from '../LoadingScreen';
import { usePathname } from 'next/navigation';
import { useDashboard } from '../../context/DashboardContext';
import { RoleGuard } from '../RoleGuard';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { UnifiedCopilotModal } from './UnifiedCopilotModal';

export function AppWrapper({ children }: { children: React.ReactNode }) {
  const [initializing, setInitializing] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    const timer = setTimeout(() => setInitializing(false), 300);
    return () => clearTimeout(timer);
  }, []);

  if (initializing) return <LoadingScreen />;

  const isHospitalRoute = pathname.startsWith('/hospital');
  const isGovRoute = pathname.startsWith('/government');
  const isDonorRoute = pathname.startsWith('/donor');

  let content = <>{children}</>;
  if (isHospitalRoute) {
    content = <RoleGuard allowedRoles={['hospital_staff']}>{children}</RoleGuard>;
  } else if (isGovRoute) {
    content = <RoleGuard allowedRoles={['government_authority']}>{children}</RoleGuard>;
  } else if (isDonorRoute) {
    content = <RoleGuard allowedRoles={['blood_donor']}>{children}</RoleGuard>;
  }

  const isDashboardRoute = isHospitalRoute || isGovRoute || isDonorRoute || pathname.startsWith('/emergency');

  if (isDashboardRoute) {
    const isCopilotPage = pathname.endsWith('/copilot');
    return (
      <>
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
          <Topbar />
          <main
            className={[
              'flex-1 flex flex-col min-h-0',
              'bg-slate-50 dark:bg-[#080c14] text-slate-900 dark:text-slate-100',
              'transition-colors duration-150',
              isCopilotPage
                ? 'overflow-hidden p-4 sm:p-5'
                : 'overflow-y-auto p-4 sm:p-6',
            ].join(' ')}
          >
            {content}
          </main>
          <UnifiedCopilotModal />
        </div>
      </>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto w-full h-full bg-slate-50 text-slate-900 dark:bg-[#080c14] dark:text-slate-100">
      {content}
    </div>
  );
}
