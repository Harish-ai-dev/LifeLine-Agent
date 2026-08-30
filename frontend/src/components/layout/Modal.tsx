'use client';
import { useRouter } from 'next/navigation';
import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export function Modal({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Lock body scroll when modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const onDismiss = React.useCallback(() => {
    router.back();
  }, [router]);

  const onOverlayClick = React.useCallback(
    (e: React.MouseEvent) => {
      if (e.target === overlayRef.current) {
        if (onDismiss) onDismiss();
      }
    },
    [onDismiss, overlayRef]
  );

  const onKeyDown = React.useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onDismiss();
    },
    [onDismiss]
  );

  useEffect(() => {
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onKeyDown]);

  return (
    <div
      ref={overlayRef}
      onClick={onOverlayClick}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6"
    >
      <div className="relative w-full w-full max-h-[90vh] bg-white dark:bg-[#060a12] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in-up">
        <button
          onClick={onDismiss}
          className="absolute top-4 right-4 z-50 p-2 rounded-full bg-slate-100/50 hover:bg-slate-200 dark:bg-slate-800/50 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
