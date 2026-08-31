import { DashboardProvider } from '@/context/DashboardContext';
import { NextAuthProvider } from '@/components/auth/NextAuthProvider';
import { AppWrapper } from '@/components/layout/AppWrapper';

export default function AppLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="h-screen w-full overflow-hidden flex select-none">
      <NextAuthProvider>
        <DashboardProvider>
          <AppWrapper>
            {children}
          </AppWrapper>
        </DashboardProvider>
      </NextAuthProvider>
    </div>
  );
}
