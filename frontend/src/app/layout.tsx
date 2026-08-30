import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { DashboardProvider } from '@/context/DashboardContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { AppWrapper } from '@/components/layout/AppWrapper';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'LifeLine Agent · Autonomous Emergency Hospital Command System',
  description: 'Autonomous Emergency Dispatch, Multi-Level Agent Supervision & Hospital Operations Platform',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-slate-50 text-slate-900 dark:bg-[#080c14] dark:text-slate-100 h-screen overflow-hidden flex select-none`}>
        <ErrorBoundary isRoot={true}>
          <ThemeProvider>
            <DashboardProvider>
              <AppWrapper>
                <Sidebar />
                <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
                  <Topbar />
                  <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50 dark:bg-[#080c14] text-slate-900 dark:text-slate-100 transition-colors duration-150">
                    {children}
                  </main>
                </div>
              </AppWrapper>
            </DashboardProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
