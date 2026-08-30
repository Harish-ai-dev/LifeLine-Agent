'use client';

import React, { useState, useEffect } from 'react';
import LoadingScreen from '../LoadingScreen';
import { usePathname, useRouter } from 'next/navigation';
import { useDashboard } from '../../context/DashboardContext';
import { RoleGuard } from '../RoleGuard';

export function AppWrapper({ children }: { children: React.ReactNode }) {
  const [initializing, setInitializing] = useState(true);
  const [transitioning, setTransitioning] = useState(false);
  const pathname = usePathname();
  const { currentUser, authToken } = useDashboard();
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      setInitializing(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (initializing) return;

    setTransitioning(true);
    const timer = setTimeout(() => {
      setTransitioning(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [pathname, initializing]);

  if (initializing || transitioning) {
    return <LoadingScreen />;
  }

  // Define route rules
  const isHospitalRoute = pathname.startsWith('/hospital');
  const isGovRoute = pathname.startsWith('/government');
  const isDonorRoute = pathname.startsWith('/donor');

  if ((isHospitalRoute || isGovRoute || isDonorRoute) && (!authToken || !currentUser)) {
    return null; // The redirect in RoleGuard/page will take care of it
  }

  if (isHospitalRoute) {
    return (
      <RoleGuard allowedRoles={['hospital_staff']}>
        {children}
      </RoleGuard>
    );
  }

  if (isGovRoute) {
    return (
      <RoleGuard allowedRoles={['government_authority']}>
        {children}
      </RoleGuard>
    );
  }

  if (isDonorRoute) {
    return (
      <RoleGuard allowedRoles={['blood_donor']}>
        {children}
      </RoleGuard>
    );
  }

  return <>{children}</>;
}
