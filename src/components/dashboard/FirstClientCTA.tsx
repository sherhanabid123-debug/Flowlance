'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, X, ArrowRight, Loader2, Plus } from 'lucide-react';
import { useClientStore } from '@/store/useClientStore';
import { useToastStore } from '@/store/useToastStore';

export function FirstClientCTA() {
  const { clients, addClient } = useClientStore();
  const { addToast } = useToastStore();
  
  const [isVisible, setIsVisible] = useState(true);
  const [isExpanding, setIsExpanding] = useState(false);
  const [clientName, setClientName] = useState('');
  const [projectName, setProjectName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Only show if no clients and is explicitely visible
  if (clients.length > 0 || !isVisible) return null;

  const handleSubmit = async () => {
    if (!clientName.trim() || !projectName.trim()) {
      addToast('Please fill in both fields', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: clientName.trim(),
          projectName: projectName.trim(),
          status: 'potential',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add client');

      addClient(data);
      addToast('First client added successfully!', 'success');
      setIsVisible(false);
    } catch (err: any) {
      addToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 max-w-[calc(100vw-3rem)] md:max-w-md w-full pointer-events-none">
      <AnimatePresence mode="wait">
        {!isExpanding ? (
          <motion.button
            key="collapsed"
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            onClick={() => setIsExpanding(true)}
            className="pointer-events-auto ml-auto group flex items-center gap-3 bg-primary text-white px-6 py-4 rounded-2xl shadow-2xl shadow-primary/40 hover:scale-105 active:scale-95 transition-all"
          >
            <div className="relative">
              <Zap size={20} className="fill-white group-hover:animate-pulse" />
              <div className="absolute inset-0 bg-white blur-md opacity-20 group-hover:opacity-40 transition-opacity" />
            </div>
            <span className="font-bold tracking-tight">Add your first client</span>
            <Plus size={18} className="opacity-60" />
          </motion.button>
        ) : (
          <motion.div
            key="expanded"
            initial={{ scale: 0.9, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 50 }}
            className="pointer-events-auto w-full glass border border-primary/20 rounded-[2rem] p-6 shadow-2xl relative overflow-hidden"
          >
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[60px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            <div className="flex items-start justify-between mb-6 relative">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <Zap size={20} className="text-primary fill-primary/20" />
                </div>
                <h3 className="font-bold text-lg tracking-tight">Spark your workspace!</h3>
              </div>
              <button 
                onClick={() => setIsExpanding(false)}
                className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors"
              >
                <X size={18} className="opacity-40" />
              </button>
            </div>

            <p className="text-sm text-[var(--text-muted)] mb-6 leading-relaxed">
              Your dashboard looks a bit empty. Let's add your first project to get things moving.
            </p>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 px-1">Client Name</label>
                <input
                  type="text"
                  placeholder="e.g. Acme Studio"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full bg-[var(--background)]/50 border border-[var(--border)] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 px-1">Project Name</label>
                <input
                  type="text"
                  placeholder="e.g. Logo Design"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full bg-[var(--background)]/50 border border-[var(--border)] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                />
              </div>

              <button
                disabled={isSubmitting}
                onClick={handleSubmit}
                className="w-full h-14 bg-primary text-white font-bold rounded-xl flex items-center justify-center gap-3 hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95 disabled:opacity-50 mt-2"
              >
                {isSubmitting ? <Loader2 className="animate-spin" /> : (
                  <>
                    <span>Launch Project</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
              
              <button 
                onClick={() => setIsVisible(false)}
                className="w-full py-2 text-[10px] font-bold uppercase tracking-widest opacity-30 hover:opacity-100 transition-opacity"
              >
                Dismiss forever
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
