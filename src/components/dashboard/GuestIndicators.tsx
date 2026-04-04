'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, LogIn, X } from 'lucide-react';
import { useState, useEffect } from 'react';

export function GuestIndicators() {
  const { isAuthenticated, openLoginModal } = useAuthStore();
  const [showReminder, setShowReminder] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || isAuthenticated) return null;

  return (
    <>
      {/* Top Preview Banner */}
      <motion.div 
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 left-0 right-0 z-[60] bg-primary/10 border-b border-primary/20 backdrop-blur-md py-2 px-4 flex items-center justify-center gap-3 lg:ml-[280px]"
      >
        <div className="flex items-center gap-2 text-primary font-bold text-[10px] sm:text-xs uppercase tracking-widest">
           <Info size={14} />
           Preview Mode
        </div>
        <div className="h-3 w-px bg-primary/20" />
        <p className="text-[10px] sm:text-xs font-medium opacity-60">You are viewing a sample workspace. Some features may be restricted.</p>
      </motion.div>

      {/* Bottom Corner Reminder */}
      <AnimatePresence>
        {showReminder && (
          <motion.div 
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            className="fixed bottom-6 right-6 z-[60] w-[280px] glass border p-5 rounded-3xl shadow-2xl flex flex-col gap-4"
          >
            <button 
              onClick={() => setShowReminder(false)}
              className="absolute top-3 right-3 opacity-40 hover:opacity-100 transition-opacity"
            >
              <X size={16} />
            </button>
            
            <div className="space-y-1">
               <h4 className="font-bold text-sm">Save your progress?</h4>
               <p className="text-xs opacity-60 leading-relaxed">Sign in to sync your data across all devices and invite your team members.</p>
            </div>
            
            <button 
              onClick={() => openLoginModal()}
              className="w-full py-2.5 bg-primary text-white text-xs font-bold rounded-2xl flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-primary/20"
            >
              <LogIn size={14} />
              Sign In to Flowlance
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
