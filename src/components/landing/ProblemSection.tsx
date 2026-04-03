'use client';
import { motion } from 'framer-motion';
import { AlertCircle, Ghost, Inbox, XOctagon } from 'lucide-react';

export function ProblemSection() {
  const problems = [
    { title: "Ghosted Leads", desc: "You forget to follow up, and the project goes to someone else. Forever.", icon: Ghost, color: "text-rose-500" },
    { title: "Messy Pipelines", desc: "Sticky notes and spreadsheets are where client details go to die.", icon: XOctagon, color: "text-amber-500" },
    { title: "Lost Revenue", desc: "Missing one follow-up per month costs you thousands in yearly growth.", icon: AlertCircle, color: "text-indigo-500" },
  ];

  return (
    <section className="py-24 bg-black/5 dark:bg-white/5 border-y relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16 space-y-4">
           <h2 className="text-xs font-bold text-rose-500 uppercase tracking-widest">The Problem</h2>
           <h3 className="text-3xl sm:text-4xl font-bold tracking-tight">Freelancing shouldn't feel this <span className="underline decoration-rose-500 decoration-3 underline-offset-4">exhausting</span>.</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {problems.map((p, i) => (
             <motion.div
               key={i}
               initial={{ opacity: 0, scale: 0.9 }}
               whileInView={{ opacity: 1, scale: 1 }}
               viewport={{ once: true }}
               transition={{ delay: i * 0.1 }}
               className="p-8 rounded-3xl bg-white dark:bg-black/40 border border-transparent hover:border-rose-500/20 transition-all group"
             >
                <div className={`p-4 rounded-2xl bg-black/5 dark:bg-white/5 w-fit mb-6 ${p.color} transition-transform group-hover:rotate-12`}>
                   <p.icon size={28} />
                </div>
                <h4 className="text-xl font-bold mb-3">{p.title}</h4>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                   {p.desc}
                </p>
             </motion.div>
           ))}
        </div>
      </div>
    </section>
  );
}
