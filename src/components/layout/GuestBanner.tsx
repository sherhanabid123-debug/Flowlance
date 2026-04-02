'use client';

import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/useAuthStore';
import { Zap, ArrowRight, ShieldCheck } from 'lucide-react';

export function GuestBanner() {
  const { isAuthenticated, openLoginModal } = useAuthStore();

  if (isAuthenticated) return null;

  return (
    <motion.div
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-20 left-0 lg:left-[280px] right-0 z-[35] flex items-center justify-center p-2 sm:p-4"
    >
      <div className="bg-[var(--card)]/80 backdrop-blur-xl border border-primary/30 px-3 sm:px-6 py-2 rounded-2xl flex flex-col sm:flex-row items-center gap-2 sm:gap-4 shadow-2xl shadow-primary/10 border-b-2 max-w-[95vw] sm:max-w-none">
        <div className="flex items-center gap-2">
          <div className="bg-primary/20 p-1 rounded-lg sm:p-1.5">
            <Zap size={16} className="text-primary animate-pulseFill sm:size-[18px]" />
          </div>
          <p className="text-[10px] sm:text-sm font-bold tracking-tight">
            Preview Mode: <span className="text-primary/90 opacity-90 font-medium hidden xs:inline">Sign in to save your progress</span>
          </p>
        </div>
        <div className="hidden sm:block h-6 w-px bg-primary/20 mx-1" />
        <button
          onClick={() => openLoginModal()}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest hover:scale-105 transition-all active:scale-95 shadow-lg shadow-primary/20 group whitespace-nowrap"
        >
          Sign In <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform sm:size-[14px]" />
        </button>
      </div>
    </motion.div>
  );
}
