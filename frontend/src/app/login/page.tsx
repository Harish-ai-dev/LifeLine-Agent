'use client';
import { Suspense } from 'react';
import { LoginView } from '@/components/auth/LoginView';

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 dark:bg-slate-900" />}>
      <LoginView />
    </Suspense>
  );
}
