'use client';
import { useUIStore } from '@/store/useUIStore';
import { X, LayoutDashboard, Briefcase, Users, LogOut, UserPlus, Lock } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/useAuthStore';
import { useState, useEffect } from 'react';

export function Sidebar() {
  const pathname = usePathname();
  const { logout, user, isAuthenticated, openLoginModal } = useAuthStore();
  const { isSidebarOpen, closeSidebar } = useUIStore();
  const router = useRouter();
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkIsDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    checkIsDesktop();
    window.addEventListener('resize', checkIsDesktop);
    return () => window.removeEventListener('resize', checkIsDesktop);
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    logout();
    router.push('/login');
    closeSidebar();
  };

  return (
    <>
      <AnimatePresence>
        {!isDesktop && isSidebarOpen && (
          <>
            {/* Mobile Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeSidebar}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-[45] lg:hidden"
            />

            {/* Mobile Sidebar Content */}
            <motion.div 
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-[280px] h-screen fixed left-0 top-0 glass border-r z-50 flex flex-col items-start p-6 lg:hidden"
            >
              <SidebarContent closeSidebar={closeSidebar} pathname={pathname} user={user} isAuthenticated={isAuthenticated} openLoginModal={openLoginModal} handleLogout={handleLogout} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar (Static) */}
      {isDesktop && (
        <div className="w-[280px] h-screen fixed left-0 top-0 glass border-r z-50 hidden lg:flex flex-col items-start p-6">
          <SidebarContent closeSidebar={closeSidebar} pathname={pathname} user={user} isAuthenticated={isAuthenticated} openLoginModal={openLoginModal} handleLogout={handleLogout} />
        </div>
      )}
    </>
  );
}

function SidebarContent({ closeSidebar, pathname, user, isAuthenticated, openLoginModal, handleLogout }: any) {
  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Client management', href: '/dashboard/clients', icon: Briefcase },
    { name: 'Team', href: '/dashboard/team', icon: Users, locked: !isAuthenticated },
  ];

  return (
    <>
      <div className="flex items-center justify-between mb-10 w-full text-left">
        <div className="flex flex-col">
          <div className="text-2xl font-bold text-primary tracking-tight">Flowlance</div>
          {isAuthenticated && user?.userType === 'agency' && user?.agencyName && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-40 mt-1 pl-1 truncate"
            >
              {user.agencyName}
            </motion.div>
          )}
        </div>
        <button onClick={closeSidebar} className="lg:hidden p-2 hover:bg-black/10 rounded-full transition-colors">
          <X size={20} />
        </button>
      </div>
      
      <nav className="w-full flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const isDesktop = typeof window !== 'undefined' ? window.innerWidth >= 1024 : true;
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              onClick={() => !isDesktop && closeSidebar()}
              className={`flex items-center justify-between w-full p-3 rounded-lg transition-all
                ${isActive ? 'bg-primary text-primary-foreground shadow-md' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
            >
              <div className="flex items-center space-x-3">
                <item.icon size={20} />
                <span className="font-medium text-left">{item.name}</span>
              </div>
              {item.locked && (
                <div className="bg-white/10 p-1 rounded-md">
                   <Lock size={12} className="opacity-40" />
                </div>
              )}
            </Link>
          )
        })}
      </nav>

      {isAuthenticated ? (
        <button 
          onClick={handleLogout}
          className="flex items-center space-x-3 w-full p-3 rounded-lg text-destructive hover:bg-destructive/10 transition-colors mt-auto"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      ) : (
        <button 
          onClick={() => {
            openLoginModal();
            closeSidebar();
          }}
          className="flex items-center space-x-3 w-full p-3 rounded-lg text-primary hover:bg-primary/10 transition-colors mt-auto font-bold"
        >
          <UserPlus size={20} />
          <span className="font-medium">Sign In</span>
        </button>
      )}
    </>
  );
}
