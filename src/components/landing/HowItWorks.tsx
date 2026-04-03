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
    <section className="py-24 bg-black/5 dark:bg-white/5">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-16 space-y-4">
           <h2 className="text-xs font-bold text-primary uppercase tracking-widest">The Process</h2>
           <h3 className="text-4xl font-bold tracking-tight">Three steps to clarity.</h3>
        </div>

        <div className="relative flex flex-col md:flex-row items-center justify-between gap-12">
           {/* Connecting Line (Desktop) */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-full h-[1px] bg-[var(--border)] opacity-30 hidden md:block" />

           {steps.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="relative z-10 flex flex-col items-center bg-white dark:bg-black/90 border p-8 rounded-3xl w-full max-w-sm text-center shadow-xl space-y-4"
              >
                 <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center animate-pulse">
                    <s.icon size={28} />
                 </div>
                 <div className="space-y-1">
                    <h4 className="text-xl font-bold tracking-tight">Step {i+1}: {s.title}</h4>
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
