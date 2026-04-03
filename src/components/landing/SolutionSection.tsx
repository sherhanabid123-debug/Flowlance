'use client';
import { motion } from 'framer-motion';
import { CheckCheck, MessageCircle, PieChart, BellRing } from 'lucide-react';

export function SolutionSection() {
  const solutions = [
    { title: "Visual Pipeline", desc: "See exactly which stage every lead is in at a single glance.", icon: PieChart },
    { title: "Smart Reminders", desc: "Automated prompts so you never forget to send that proposal.", icon: BellRing },
    { title: "Direct Contact", desc: "One-click WhatsApp or email triggers directly from the dashboard.", icon: MessageCircle },
  ];

  return (
    <section className="py-24 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-16">
           <motion.div 
             initial={{ opacity: 0, x: -30 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
             className="flex-1 space-y-8"
           >
              <h2 className="text-xs font-bold text-emerald-500 uppercase tracking-widest">The Solution</h2>
              <h3 className="text-4xl sm:text-5xl font-bold tracking-tight">The antidote to chaos.</h3>
              <p className="text-lg text-[var(--text-muted)] leading-relaxed">
                 Finally, a tool that works as hard as you do. Flowlance brings all your leads, projects, and revenue together for a unified, organized agency experience.
              </p>
              
              <div className="space-y-4">
                 {solutions.map((s, i) => (
                    <div key={i} className="flex items-start gap-4">
                       <div className="mt-1 p-1 bg-emerald-500/10 text-emerald-500 rounded-lg">
                          <CheckCheck size={18} />
                       </div>
                       <div>
                          <p className="font-bold">{s.title}</p>
                          <p className="text-sm text-[var(--text-muted)]">{s.desc}</p>
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
              <div className="glass border rounded-[40px] p-2 sm:p-4 rotate-1 hover:rotate-0 transition-transform duration-700 shadow-2xl bg-indigo-600/10 dark:bg-primary/5">
                 <div className="glass border-2 border-white/20 rounded-[30px] overflow-hidden shadow-inner relative aspect-[16/10]">
                    <img 
                      src="/dashboard-preview.png" 
                      alt="Flowlance Dashboard Preview" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 ring-1 ring-inset ring-white/10" />
                 </div>
              </div>
           </motion.div>
        </div>
      </div>
    </section>
  );
}
