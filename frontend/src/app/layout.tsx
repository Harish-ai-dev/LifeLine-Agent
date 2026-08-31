import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { DashboardProvider } from '@/context/DashboardContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { NextAuthProvider } from '@/components/auth/NextAuthProvider';


import { AppWrapper } from '@/components/layout/AppWrapper';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'LifeLine Agent · Autonomous Emergency Hospital Command System',
  description: 'Autonomous Emergency Dispatch, Multi-Level Agent Supervision & Hospital Operations Platform',
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="">
      <body className={`${inter.className} h-screen overflow-hidden flex select-none bg-slate-50 text-slate-900`}>
        <ErrorBoundary isRoot={true}>
          <NextAuthProvider>
            <ThemeProvider>
              <DashboardProvider>
                <AppWrapper>
                  {children}
                </AppWrapper>
              </DashboardProvider>
            </ThemeProvider>
          </NextAuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
