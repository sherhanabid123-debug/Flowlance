'use client';
import { motion } from 'framer-motion';

export function ProblemSection() {
  const problems = [
    { title: "Ghosted leads", desc: "You forget to follow up, and the project goes to someone else. Forever." },
    { title: "Messy pipelines", desc: "Sticky notes and spreadsheets are where client details go to die." },
    { title: "Lost revenue", desc: "A missed follow up is a project handed to whoever remembered to check in." },
  ];

  return (
    <section className="py-20 sm:py-24 border-t border-[var(--rule)]">
      <div className="max-w-4xl mx-auto px-6">
        <div className="mb-12 space-y-3">
           <h2 className="text-xs font-mono text-[var(--stamp)] uppercase tracking-widest">The problem</h2>
           <h3 className="font-display text-2xl sm:text-4xl font-medium tracking-tight max-w-lg">
             Managing a business shouldn&apos;t feel this exhausting.
           </h3>
        </div>

        <div className="divide-y divide-[var(--rule)] border-y border-[var(--rule)]">
           {problems.map((p, i) => (
             <motion.div
               key={i}
               initial={{ opacity: 0 }}
               whileInView={{ opacity: 1 }}
               viewport={{ once: true }}
               transition={{ delay: i * 0.08 }}
               className="py-6 flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-8"
             >
                <span className="font-mono text-xs text-[var(--brass)] w-8 shrink-0">{String(i + 1).padStart(2, '0')}</span>
                <h4 className="font-display text-lg sm:text-xl font-medium sm:w-56 shrink-0">{p.title}</h4>
                <p className="text-sm text-[var(--ink-text-muted)] leading-relaxed">{p.desc}</p>
             </motion.div>
           ))}
        </div>
      </div>
    </section>
  );
}
