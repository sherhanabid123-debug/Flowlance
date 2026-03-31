'use client';

import { ThemeToggle } from './ThemeToggle';
import { useAuthStore } from '@/store/useAuthStore';
import { motion } from 'framer-motion';

export function TopNav() {
  const { user } = useAuthStore();
  
  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="h-16 flex items-center justify-between px-8 glass border-b sticky top-0 z-40 ml-64"
    >
      <h2 className="text-xl font-semibold opacity-80">Welcome, {user?.email?.split('@')[0] || 'User'}!</h2>
      <div className="flex items-center space-x-4">
        <ThemeToggle />
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
          {user?.email?.[0].toUpperCase() || 'U'}
        </div>
      </div>
    </motion.header>
  );
}
