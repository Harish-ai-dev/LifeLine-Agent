import { DashboardProvider } from '@/context/DashboardContext';
import { AppWrapper } from '@/components/layout/AppWrapper';

export default function AppLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="h-screen w-full overflow-hidden flex select-none">
      <DashboardProvider>
        <AppWrapper>
          {children}
        </AppWrapper>
      </DashboardProvider>
    </div>
  );
}
