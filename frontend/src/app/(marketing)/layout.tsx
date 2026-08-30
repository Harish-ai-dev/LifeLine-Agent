'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/marketing/Navbar';
import { Footer } from '@/components/marketing/Footer';
import { CommandPalette } from '@/components/marketing/CommandPalette';
import { WaitlistModal } from '@/components/marketing/WaitlistModal';

interface MarketingContextType {
  openDemo: () => void;
  openWaitlist: () => void;
  openSearch: () => void;
}

export const MarketingContext = createContext<MarketingContextType>({
  openDemo: () => {},
  openWaitlist: () => {},
  openSearch: () => {},
});

export const useMarketing = () => useContext(MarketingContext);

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [isWaitlistOpen, setIsWaitlistOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Force 100% Light Theme on all marketing pages
    const root = document.documentElement;
    const hasDark = root.classList.contains('dark');
    if (hasDark) {
      root.classList.remove('dark');
    }
    return () => {
      // Restore user theme preference when leaving marketing routes
      const saved = localStorage.getItem('lifeline_theme');
      if (saved === 'dark') {
        root.classList.add('dark');
      }
    };
  }, [pathname]);

  return (
    <MarketingContext.Provider value={{
      openDemo: () => setIsDemoOpen(true),
      openWaitlist: () => setIsWaitlistOpen(true),
      openSearch: () => setIsSearchOpen(true),
    }}>
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] text-slate-800 dark:text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950 flex flex-col justify-between">
        <Navbar 
          onOpenDemo={() => setIsDemoOpen(true)}
          onOpenWaitlist={() => setIsWaitlistOpen(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
          systemStatus="HEALTHY"
        />
        <main className="flex-grow pt-24">
          {children}
        </main>
        <Footer 
          onOpenDemo={() => setIsDemoOpen(true)}
          onOpenWaitlist={() => setIsWaitlistOpen(true)}
        />

        <CommandPalette 
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
        />
        <WaitlistModal 
          isOpen={isWaitlistOpen}
          onClose={() => setIsWaitlistOpen(false)}
        />
        {/* Demo Video Modal */}
        {isDemoOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <div className="relative w-full max-w-4xl rounded-3xl bg-[#080D1A] border border-cyan-800 shadow-2xl overflow-hidden font-mono text-xs">
              <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-slate-700 dark:text-slate-200">
                <span className="font-bold flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                  <span>LifeLine Agent — 4-Minute Hackathon Demo Video</span>
                </span>
                <button 
                  onClick={() => setIsDemoOpen(false)}
                  className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:text-white"
                >
                  Close ✕
                </button>
              </div>
              <div className="aspect-video bg-black flex flex-col items-center justify-center p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/50 flex items-center justify-center text-rose-400 mb-4">
                  <span className="text-2xl">▶</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Full Multi-Agent Walkthrough Video</h3>
                <p className="mt-2 text-slate-400 dark:text-slate-400 max-w-md">
                  Demonstrating live STEMI vitals intake, deterministic NEWS2 scoring on Gemini 3.1 Pro, sub-second OSRM bed matching, and automated trauma SBAR handoff.
                </p>
                <div className="mt-6 flex items-center space-x-3">
                  <button 
                    onClick={() => setIsDemoOpen(false)}
                    className="px-5 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold"
                  >
                    Close Preview
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MarketingContext.Provider>
  );
}
