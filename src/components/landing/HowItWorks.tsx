'use client';
import { PlusCircle, Target, Trophy } from 'lucide-react';

export function HowItWorks() {
  const steps = [
    { title: "Add clients", desc: "Just their name and project scope. Simple as that.", icon: PlusCircle },
    { title: "Track progress", desc: "The visual pipeline shows you exactly what's next.", icon: Target },
    { title: "Close deals", desc: "Send invoices and track revenue, with Indian Rupee support built in.", icon: Trophy },
  ];

  return (
    <section className="py-20 sm:py-24 border-t border-[var(--rule)]">
      <div className="max-w-5xl mx-auto px-6">
        <div className="mb-14 space-y-3">
           <h2 className="text-xs font-mono text-[var(--brass)] uppercase tracking-widest">The process</h2>
           <h3 className="font-display text-2xl sm:text-4xl font-medium tracking-tight">Three steps to clarity.</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-10 relative">
           {steps.map((s, i) => (
              <div key={i} className="relative">
                 <div className="flex items-baseline gap-3 mb-4">
                    <span className="font-display italic text-3xl text-[var(--brass)]">{i + 1}</span>
                    <s.icon size={18} className="opacity-40" />
                 </div>
                 <h4 className="font-display text-lg font-medium tracking-tight mb-2">{s.title}</h4>
                 <p className="text-sm text-[var(--ink-text-muted)] leading-relaxed">
                    {s.desc}
                 </p>
                 {i < steps.length - 1 && (
                   <div className="hidden md:block absolute top-3 -right-4 w-8 h-px bg-[var(--rule)]" />
                 )}
              </div>
            ))}
        </div>
      </div>
    </section>
  );
}
