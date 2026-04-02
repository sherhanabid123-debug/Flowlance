'use client';

import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/useAuthStore';
import { Zap, ArrowRight, ShieldCheck } from 'lucide-react';

export function GuestBanner() {
  const { isAuthenticated, openLoginModal } = useAuthStore();

  if (isAuthenticated) return null;

  return (
    <motion.div
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-64 right-0 z-[45] flex items-center justify-center p-2"
    >
      <div className="bg-primary/10 backdrop-blur-md border border-primary/20 px-4 py-1.5 rounded-full flex items-center gap-3 shadow-lg shadow-primary/5">
        <div className="flex items-center gap-1.5">
          <Zap size={14} className="text-primary animate-pulse" />
          <span className="text-[11px] font-bold tracking-tight text-foreground/80">
            Preview Mode: <span className="text-primary">Sign in to save your progress</span>
          </span>
        </div>
        <div className="h-4 w-px bg-primary/20 mx-1" />
        <button
          onClick={() => openLoginModal()}
          className="flex items-center gap-1 text-[11px] font-bold text-primary hover:text-primary/80 transition-colors group"
        >
          Get Started <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
}
