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
      className="fixed top-0 left-64 right-0 z-[45] flex items-center justify-center p-4 h-20"
    >
      <div className="bg-[var(--card)]/40 backdrop-blur-xl border border-primary/30 px-6 py-2.5 rounded-2xl flex items-center gap-4 shadow-2xl shadow-primary/10 border-b-2">
        <div className="flex items-center gap-2">
          <div className="bg-primary/20 p-1.5 rounded-lg">
            <Zap size={18} className="text-primary animate-pulseFill" />
          </div>
          <p className="text-sm font-bold tracking-tight">
            Preview Mode: <span className="text-primary/90 opacity-90 font-medium">Your progress isn't being saved</span>
          </p>
        </div>
        <div className="h-6 w-px bg-primary/20 mx-1" />
        <button
          onClick={() => openLoginModal()}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all active:scale-95 shadow-lg shadow-primary/20 group"
        >
          Sign In <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
}
