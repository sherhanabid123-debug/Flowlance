'use client';
import { motion } from 'framer-motion';
import { CheckCheck, MessageCircle, PieChart, BellRing } from 'lucide-react';

export function SolutionSection() {
  const solutions = [
    { title: "Visual Pipeline", desc: "See exactly which stage every lead is in at a single glance.", icon: PieChart },
    { title: "Smart Reminders", desc: "Automated prompts so you never forget to send that proposal.", icon: BellRing },
    { title: "Direct Contact", desc: "One click WhatsApp or email triggers directly from the dashboard.", icon: MessageCircle },
  ];

  return (
    <section className="py-20 sm:py-24 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
           <motion.div 
             initial={{ opacity: 0, x: -30 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
             className="flex-1 space-y-6 sm:space-y-8"
           >
              <h2 className="text-xs font-bold text-emerald-500 uppercase tracking-widest">The Solution</h2>
              <h3 className="text-3xl sm:text-5xl font-bold tracking-tight">The antidote to chaos.</h3>
              <p className="text-base sm:text-lg text-[var(--text-muted)] leading-relaxed">
                 Finally, a tool that works as hard as you do. Flowlance brings all your leads, projects, and revenue together for a unified, organized agency experience.
              </p>
              
              <div className="space-y-4 sm:space-y-6">
                 {solutions.map((s, i) => (
                    <div key={i} className="flex items-start gap-3 sm:gap-4">
                       <div className="mt-1 p-1 bg-emerald-500/10 text-emerald-500 rounded-lg">
                          <CheckCheck size={18} />
                       </div>
                       <div>
                          <p className="font-bold text-sm sm:text-base">{s.title}</p>
                          <p className="text-xs sm:text-sm text-[var(--text-muted)]">{s.desc}</p>
                       </div>
                    </div>
                 ))}
              </div>
           </motion.div>
           
           <motion.div 
             initial={{ opacity: 0, scale: 0.95 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true }}
             className="flex-1 w-full"
           >
              <div className="rounded-3xl sm:rounded-[40px] overflow-hidden shadow-2xl relative">
                    <img 
                      src="/Dashboard-preview.png" 
                      alt="Flowlance Dashboard Preview" 
                      className="w-full h-auto"
                    />
              </div>
           </motion.div>
        </div>
      </div>
    </section>
  );
}
