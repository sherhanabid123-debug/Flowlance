'use client';

import { ThemeToggle } from './ThemeToggle';
import { UserDropdown } from './UserDropdown';
import { NotificationDropdown } from './NotificationDropdown';
import { useAuthStore } from '@/store/useAuthStore';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { Menu, Users } from 'lucide-react';
import { useUIStore } from '@/store/useUIStore';

export function TopNav() {
  const { user, openLoginModal, isAuthenticated } = useAuthStore();
  const { workspace, fetchWorkspace } = useWorkspaceStore();
  const { toggleSidebar } = useUIStore();

  useEffect(() => {
    if (isAuthenticated) {
      fetchWorkspace();
    }
  }, [isAuthenticated, fetchWorkspace]);
  
  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="h-20 flex items-center justify-between px-4 lg:px-8 glass border-b sticky top-0 z-40 lg:ml-[280px]"
    >
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="lg:hidden p-2 hover:bg-black/5 rounded-xl transition-colors"
        >
          <Menu size={24} />
        </button>
        
        <div className="flex flex-col">
          {isAuthenticated && user?.userType === 'agency' && user?.agencyName && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 mb-0.5"
            >
              <span className="bg-primary/10 text-primary text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-md border border-primary/20 tracking-wider">Agency</span>
              <span className="hidden sm:inline text-xs font-bold opacity-80 uppercase tracking-widest">{user.agencyName}</span>
            </motion.div>
          )}
          <h2 className="text-lg sm:text-xl font-bold tracking-tight truncate max-w-[150px] sm:max-w-none">
            Hello, {isAuthenticated ? (user?.name || user?.email?.split('@')[0] || 'User') : 'Guest'}!
          </h2>
          <div className="flex items-center gap-1.5 text-xs opacity-50 font-medium">
            <Users size={12} className="text-primary" />
            <span className="truncate max-w-[150px] sm:max-w-none">{isAuthenticated ? (workspace?.name || 'Loading Workspace...') : 'Preview Workspace'}</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-1 sm:space-x-2">
        <NotificationDropdown />
        <ThemeToggle />
        <div className="h-8 w-px bg-[var(--border)] mx-1 sm:mx-3 opacity-50" />
        {isAuthenticated ? (
          <UserDropdown />
        ) : (
          <button 
            onClick={() => openLoginModal()}
            className="bg-primary text-primary-foreground px-3 sm:px-5 py-2 rounded-xl font-bold text-xs sm:text-sm hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-primary/20"
          >
            Sign In
          </button>
        )}
      </div>
    </motion.header>
  );
}
