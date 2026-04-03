import { Sidebar } from '@/components/layout/Sidebar';
import { TopNav } from '@/components/layout/TopNav';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--background)] overflow-x-hidden">
      <Sidebar />
      <div className="flex flex-col min-h-screen">
        <TopNav />
        <main className="flex-1 lg:ml-[280px] p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
