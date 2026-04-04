'use client';
import { motion } from 'framer-motion';
import { PlusCircle, Target, Trophy } from 'lucide-react';

export function HowItWorks() {
  const steps = [
    { title: "Add Clients", desc: "Just their name and project scope. Simple as that.", icon: PlusCircle },
    { title: "Track Progress", desc: "Our visual pipeline shows you exactly what's next.", icon: Target },
    { title: "Close Deals", desc: "Send invoices & track revenue. Indian Rupee support built-in.", icon: Trophy },
  ];

  return (
    <section className="py-24 bg-black/5 dark:bg-white/5 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16 space-y-4">
           <h2 className="text-xs font-bold text-primary uppercase tracking-widest">The Process</h2>
           <h3 className="text-4xl font-bold tracking-tight">Three steps to clarity.</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {steps.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-[32px] bg-white dark:bg-black/40 border border-transparent hover:border-primary/20 transition-all group"
              >
                 <div className="w-14 h-14 rounded-2xl bg-black/5 dark:bg-white/5 flex items-center justify-center text-primary mb-6 transition-transform group-hover:rotate-6">
                    <s.icon size={26} />
                 </div>
                 <div className="space-y-3">
                    <h4 className="text-xl font-bold tracking-tight">Step 0{i+1}: {s.title}</h4>
                    <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                       {s.desc}
                    </p>
                 </div>
              </motion.div>
           ))}
        </div>
      </div>
    </section>
  );
}
