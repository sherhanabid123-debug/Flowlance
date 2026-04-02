'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Zap, X, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';

interface FirstClientCTAProps {
  isVisible: boolean;
  onOpenQuickAdd: () => void;
}

export function FirstClientCTA({ isVisible, onOpenQuickAdd }: FirstClientCTAProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  // Auto-dismiss if they add a client elsewhere
  useEffect(() => {
    if (!isVisible) setIsDismissed(false);
  }, [isVisible]);

  if (!isVisible || isDismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.9 }}
        className="fixed bottom-8 right-8 z-50 w-80"
      >
        <div className="glass border-primary/20 p-6 rounded-3xl shadow-2xl shadow-primary/10 relative overflow-hidden group">
          {/* Animated Background Pulse */}
          <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors pointer-events-none" />
          
          <button 
            onClick={() => setIsDismissed(true)}
            className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/10 transition-colors opacity-40 hover:opacity-100"
          >
            <X size={16} />
          </button>

          <div className="relative space-y-4">
            <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary">
              <Zap size={24} className="fill-primary/20" />
            </div>

            <div className="space-y-1">
              <h4 className="font-bold text-lg leading-tight">Ready for your first client?</h4>
              <p className="text-sm opacity-60">Add a client to start tracking projects, revenue, and follow-ups.</p>
            </div>

            <button
              onClick={onOpenQuickAdd}
              className="w-full h-12 bg-primary text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95 group/btn"
            >
              Add First Client
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
