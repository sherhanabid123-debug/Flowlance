'use client';
import { motion } from 'framer-motion';
import { LayoutDashboard, Users, TrendingUp, Zap, MousePointer2 } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

export function HeroSection() {
  const { openLoginModal } = useAuthStore();

  return (
    <div className="relative pt-32 pb-20 overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-5xl mx-auto px-6 text-center space-y-8 relative z-10">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-4"
        >
          <Zap size={14} className="fill-current" />
          The New Standard for Freelance CRM
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]"
        >
          Never miss a client <br />
          <span className="text-primary italic">follow-up</span> again
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-sm sm:text-lg lg:text-xl text-[var(--text-muted)] max-w-2xl mx-auto leading-relaxed"
        >
          Track leads, manage projects, and grow your freelance business — all in one place. Built for independent creators and modern agencies.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
        >
          <button 
            onClick={() => openLoginModal()}
            className="w-full sm:w-auto h-14 px-10 bg-primary text-white font-bold rounded-2xl hover:opacity-90 transition-all shadow-xl shadow-primary/30 active:scale-95 flex items-center justify-center gap-2"
          >
            Get Started Free
            <Zap size={18} />
          </button>
          <button 
            className="w-full sm:w-auto h-14 px-10 glass border font-bold rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            Try Demo
            <MousePointer2 size={18} />
          </button>
        </motion.div>

        {/* Floating Preview Card */}
        <motion.div
           initial={{ opacity: 0, y: 50, rotateX: 10 }}
           animate={{ opacity: 1, y: 0, rotateX: 0 }}
           transition={{ delay: 0.4, duration: 0.8 }}
           style={{ perspective: 1000 }}
           className="mt-20 relative px-4"
        >
          <div className="glass border rounded-3xl p-4 sm:p-8 shadow-2xl relative bg-black/40 dark:bg-white/5 overflow-hidden">
             {/* Mock Dashboard UI */}
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 opacity-30 pointer-events-none select-none">
                <div className="h-32 bg-primary/10 rounded-2xl border border-primary/20 flex flex-col p-6 space-y-2">
                   <div className="w-8 h-8 rounded-lg bg-primary/20" />
                   <div className="h-4 w-20 bg-primary/40 rounded-full" />
                   <div className="h-8 w-28 bg-white/20 rounded-lg" />
                </div>
                <div className="h-32 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 flex flex-col p-6 space-y-2">
                   <div className="w-8 h-8 rounded-lg bg-indigo-500/20" />
                   <div className="h-4 w-20 bg-indigo-500/40 rounded-full" />
                   <div className="h-8 w-28 bg-white/20 rounded-lg" />
                </div>
                <div className="h-32 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 flex flex-col p-6 space-y-2">
                   <div className="w-8 h-8 rounded-lg bg-emerald-500/20" />
                   <div className="h-4 w-20 bg-emerald-500/40 rounded-full" />
                   <div className="h-8 w-28 bg-white/20 rounded-lg" />
                </div>
             </div>
             
             {/* Real Feature Callout in Preview */}
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-primary/95 text-white px-6 py-3 rounded-2xl shadow-xl font-bold flex items-center gap-3 animate-bounce">
                   <TrendingUp size={20} />
                   +140% Lead Retention
                </div>
             </div>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute -top-6 -left-6 p-4 glass rounded-2xl border hidden sm:block">
             <LayoutDashboard size={24} className="text-primary" />
          </div>
          <div className="absolute -bottom-6 -right-6 p-4 glass rounded-2xl border hidden sm:block">
             <Users size={24} className="text-indigo-500" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
