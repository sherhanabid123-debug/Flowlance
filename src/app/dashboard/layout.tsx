import { Sidebar } from '@/components/layout/Sidebar';
import { TopNav } from '@/components/layout/TopNav';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Sidebar />
      <TopNav />
      <main className="transition-all duration-300 lg:pl-64 p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}
