'use client';
import { motion } from 'framer-motion';
import { Zap, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';

export function FinalCTA() {
  const { openLoginModal } = useAuthStore();

  const benefits = ["No credit card required", "Unlimited clients", "Instant setup"];

  return (
    <section className="py-20 sm:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-primary/10 dark:bg-primary/5 -mt-20 blur-[100px] pointer-events-none" />
      
      <div className="max-w-5xl mx-auto px-6 relative z-10">
        <motion.div 
           initial={{ opacity: 0, scale: 0.95 }}
           whileInView={{ opacity: 1, scale: 1 }}
           viewport={{ once: true }}
           className="glass p-8 sm:p-20 rounded-[32px] sm:rounded-[48px] bg-gradient-to-br from-primary/20 to-indigo-600/20 border-primary/20 text-center space-y-8 sm:space-y-10 relative overflow-hidden"
        >
           <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12 hidden sm:block">
              <Zap size={120} className="text-white fill-current" />
           </div>
 
           <div className="space-y-4 max-w-2xl mx-auto">
              <h2 className="text-3xl sm:text-5xl font-bold tracking-tight px-2 sm:px-0 leading-tight sm:leading-normal text-white">Start managing your clients <span className="text-primary italic font-black">today</span>.</h2>
              <p className="text-base sm:text-lg opacity-70 px-4 sm:px-0">Focus on your work, not the follow ups. Join 200+ businesses growing their revenue with Flowlance.</p>
           </div>
           
           <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 pt-4 sm:pt-0">
              <button 
                onClick={() => window.location.href = 'https://flowlance-one.vercel.app/dashboard'}
                className="w-full sm:w-auto h-14 sm:h-16 px-10 sm:px-12 bg-primary text-white font-bold rounded-2xl hover:opacity-90 transition-all shadow-xl shadow-primary/30 active:scale-95 flex items-center justify-center gap-2 text-base sm:text-lg"
              >
                 Get Started Free
                 <ArrowRight size={20} />
              </button>
           </div>
 
           <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 pt-4">
              {benefits.map((b, i) => (
                 <div key={i} className="flex items-center gap-2 opacity-60">
                    <CheckCircle2 size={18} className="text-primary" />
                    <span className="text-[10px] sm:text-sm font-semibold uppercase tracking-wider">{b}</span>
                 </div>
              ))}
           </div>
        </motion.div>
      </div>
    </section>
  );
}
