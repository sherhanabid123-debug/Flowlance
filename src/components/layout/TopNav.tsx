'use client';

import { ThemeToggle } from './ThemeToggle';
import { UserDropdown } from './UserDropdown';
import { NotificationDropdown } from './NotificationDropdown';
import { useAuthStore } from '@/store/useAuthStore';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { useUIStore } from '@/store/useUIStore';
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { Users, Menu } from 'lucide-react';

export function TopNav() {
  const { user, openLoginModal, isAuthenticated } = useAuthStore();
  const { workspace, fetchWorkspace } = useWorkspaceStore();
  const { toggleSidebar } = useUIStore();

  useEffect(() => {
    if (isAuthenticated) {
      fetchWorkspace();
    }
  }, [fetchWorkspace, isAuthenticated]);
  
  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="h-20 flex items-center justify-between px-4 md:px-8 glass border-b sticky top-0 z-40 lg:ml-64"
    >
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="lg:hidden p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl text-primary transition-colors"
        >
          <Menu size={24} />
        </button>

        <div className="flex flex-col">
          {isAuthenticated && user?.userType === 'agency' && user?.agencyName && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="hidden sm:flex items-center gap-2 mb-0.5"
            >
              <span className="bg-primary/10 text-primary text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-md border border-primary/20 tracking-wider">Agency</span>
              <span className="text-xs font-bold opacity-80 uppercase tracking-widest truncate max-w-[100px] md:max-w-none">{user.agencyName}</span>
            </motion.div>
          )}
          <h2 className="text-lg md:text-xl font-bold tracking-tight truncate max-w-[150px] md:max-w-none">
            {isAuthenticated ? `Hello, ${user?.name?.split(' ')[0] || 'User'}!` : 'Welcome!'}
          </h2>
          <div className="hidden xs:flex items-center gap-1.5 text-[10px] md:text-xs opacity-50 font-medium whitespace-nowrap">
            <Users size={12} className="text-primary shrink-0" />
            <span className="truncate max-w-[120px] md:max-w-none">{isAuthenticated ? (workspace?.name || 'Loading...') : 'Preview'}</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-1 md:space-x-2">
        <NotificationDropdown />
        <ThemeToggle />
        <div className="h-8 w-px bg-[var(--border)] mx-1 md:mx-3 opacity-50" />
        {isAuthenticated ? (
          <UserDropdown />
        ) : (
          <button 
            onClick={() => openLoginModal()}
            className="bg-primary text-primary-foreground px-4 md:px-5 py-2 rounded-xl font-bold text-xs md:text-sm hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-primary/20 whitespace-nowrap"
          >
            Sign In
          </button>
        )}
      </div>
    </motion.header>
  );
}
