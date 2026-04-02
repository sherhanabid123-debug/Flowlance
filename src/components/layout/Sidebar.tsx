'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Briefcase, Users, LogOut, UserPlus, Lock, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/useAuthStore';
import { useUIStore } from '@/store/useUIStore';
import { useRouter } from 'next/navigation';

export function Sidebar() {
  const pathname = usePathname();
  const { logout, user, isAuthenticated, openLoginModal } = useAuthStore();
  const { isSidebarOpen, closeSidebar } = useUIStore();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    logout();
    router.push('/login');
    closeSidebar();
  };

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Client management', href: '/dashboard/clients', icon: Briefcase },
    { name: 'Team', href: '/dashboard/team', icon: Users, locked: !isAuthenticated },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSidebar}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
          />
        )}
      </AnimatePresence>

      <motion.aside
        className={`fixed left-0 top-0 h-screen glass border-r z-[70] flex flex-col p-6 transition-all duration-300 w-64
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="flex items-center justify-between mb-10 w-full">
          <div className="flex flex-col">
            <div className="text-2xl font-bold text-primary tracking-tight">Flowlance</div>
            {isAuthenticated && user?.userType === 'agency' && user?.agencyName && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-40 mt-1 pl-1 truncate max-w-[140px]"
              >
                {user.agencyName}
              </motion.div>
            )}
          </div>
          <button 
            onClick={closeSidebar}
            className="lg:hidden p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full"
          >
            <X size={20} />
          </button>
        </div>
        
        <nav className="w-full flex-1 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            
            return (
              <Link 
                key={item.href} 
                href={item.href}
                onClick={closeSidebar}
                className={`flex items-center justify-between w-full p-3 rounded-xl transition-all
                  ${isActive ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'hover:bg-black/5 dark:hover:bg-white/5 opacity-70 hover:opacity-100'}`}
              >
                <div className="flex items-center space-x-3">
                  <item.icon size={20} />
                  <span className="font-semibold text-sm">{item.name}</span>
                </div>
                {item.locked && (
                  <div className="bg-white/10 p-1 rounded-md">
                     <Lock size={12} className="opacity-40" />
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-6 border-t border-[var(--border)] overflow-hidden">
          {isAuthenticated ? (
            <button 
              onClick={handleLogout}
              className="flex items-center space-x-3 w-full p-3 rounded-xl text-destructive hover:bg-destructive/10 transition-colors font-bold text-sm"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          ) : (
            <button 
              onClick={() => {
                openLoginModal();
                closeSidebar();
              }}
              className="flex items-center space-x-3 w-full p-3 rounded-xl text-primary hover:bg-primary/10 transition-colors font-bold text-sm"
            >
              <UserPlus size={20} />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </motion.aside>
    </>
  );
}
