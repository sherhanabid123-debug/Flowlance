'use client';
import { motion } from 'framer-motion';
import { LayoutDashboard, Users, TrendingUp, Zap, MousePointer2 } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

export function HeroSection() {
  const { openLoginModal } = useAuthStore();

  return (
    <div className="relative pt-24 pb-12 sm:pt-32 sm:pb-20 overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[300px] sm:h-[500px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-5xl mx-auto px-6 text-center space-y-6 sm:space-y-8 relative z-10">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-2 sm:mb-4"
        >
          <Zap size={14} className="fill-current" />
          The New Standard for High Growth Teams
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.2] sm:leading-[1.1]"
        >
          Never miss a client <br className="hidden sm:block" />
          <span className="text-primary italic">follow up</span> again
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-sm sm:text-lg lg:text-xl text-[var(--text-muted)] max-w-2xl mx-auto leading-relaxed px-4 sm:px-0"
        >
          Track leads, manage projects, and grow your revenue — all in one place. Built for modern agencies, lean teams, and independent professionals.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-2 sm:pt-4"
        >
          <button 
            onClick={() => window.location.href = 'https://flowlance-one.vercel.app/dashboard'}
            className="w-full sm:w-auto h-12 sm:h-14 px-8 sm:px-10 bg-primary text-white font-bold rounded-xl sm:rounded-2xl hover:opacity-90 transition-all shadow-xl shadow-primary/30 active:scale-95 flex items-center justify-center gap-2"
          >
            Get Started Free
            <Zap size={18} />
          </button>
          <button 
             onClick={() => window.location.href = 'https://flowlance-one.vercel.app/dashboard'}
            className="w-full sm:w-auto h-12 sm:h-14 px-8 sm:px-10 glass border font-bold rounded-xl sm:rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 transition-all active:scale-95 flex items-center justify-center gap-2"
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
           className="mt-12 sm:mt-20 relative px-2 sm:px-4"
        >
          <div className="glass border rounded-[2rem] p-4 sm:p-8 shadow-2xl relative bg-black/40 dark:bg-white/5 overflow-hidden">
             {/* Mock Dashboard UI */}
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 opacity-30 pointer-events-none select-none">
                <div className="h-24 sm:h-32 bg-primary/10 rounded-2xl border border-primary/20 flex flex-col p-4 sm:p-6 space-y-2">
                   <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-primary/20" />
                   <div className="h-3 w-16 sm:h-4 sm:w-20 bg-primary/40 rounded-full" />
                   <div className="h-6 w-24 sm:h-8 sm:w-28 bg-white/20 rounded-lg" />
                </div>
                <div className="h-24 sm:h-32 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 flex flex-col p-4 sm:p-6 space-y-2">
                   <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-indigo-500/20" />
                   <div className="h-3 w-16 sm:h-4 sm:w-20 bg-indigo-500/40 rounded-full" />
                   <div className="h-6 w-24 sm:h-8 sm:w-28 bg-white/20 rounded-lg" />
                </div>
                <div className="h-24 sm:h-32 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 flex flex-col p-4 sm:p-6 space-y-2">
                   <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-emerald-500/20" />
                   <div className="h-3 w-16 sm:h-4 sm:w-20 bg-emerald-500/40 rounded-full" />
                   <div className="h-6 w-24 sm:h-8 sm:w-28 bg-white/20 rounded-lg" />
                </div>
             </div>
             
             {/* Real Feature Callout in Preview */}
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-primary/95 text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl shadow-xl font-bold text-xs sm:text-base flex items-center gap-2 sm:gap-3 animate-bounce">
                   <TrendingUp size={16} />
                   +140% Lead Retention
                </div>
             </div>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute -top-4 -left-4 p-3 glass rounded-xl border hidden sm:block">
             <LayoutDashboard size={20} className="text-primary" />
          </div>
          <div className="absolute -bottom-4 -right-4 p-3 glass rounded-xl border hidden sm:block">
             <Users size={20} className="text-indigo-500" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
