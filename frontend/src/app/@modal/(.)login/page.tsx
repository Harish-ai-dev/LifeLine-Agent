'use client';
import { Suspense } from 'react';
import { LoginView } from '@/components/auth/LoginView';
import { Modal } from '@/components/layout/Modal';

export default function InterceptedLogin() {
  return (
    <Modal>
      <Suspense fallback={<div className="h-full bg-slate-50 dark:bg-slate-900" />}>
        <LoginView isModal={true} />
      </Suspense>
    </Modal>
  );
}
