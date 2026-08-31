import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/context/ThemeContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';

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
      <body className={`${inter.className} min-h-screen flex flex-col bg-slate-50 text-slate-900`}>
        <ErrorBoundary isRoot={true}>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
