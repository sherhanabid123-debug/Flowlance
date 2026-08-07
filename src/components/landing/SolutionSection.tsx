'use client';
import { PieChart, BellRing, MessageCircle } from 'lucide-react';

export function SolutionSection() {
  const solutions = [
    { title: "Visual pipeline", desc: "See exactly which stage every lead is in at a single glance.", icon: PieChart },
    { title: "Smart reminders", desc: "Automated prompts so you never forget to send that proposal.", icon: BellRing },
    { title: "Direct contact", desc: "One click WhatsApp or email, triggered straight from the dashboard.", icon: MessageCircle },
  ];

  return (
    <section className="py-20 sm:py-24 border-t border-[var(--rule)]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-start gap-12 lg:gap-20">
           <div className="flex-1 space-y-6 sm:space-y-8 lg:sticky lg:top-24">
              <h2 className="text-xs font-mono text-emerald-600 uppercase tracking-widest">The solution</h2>
              <h3 className="font-display text-2xl sm:text-4xl font-medium tracking-tight">Less chaos, more clarity.</h3>
              <p className="text-base text-[var(--ink-text-muted)] leading-relaxed max-w-sm">
                 Flowlance keeps your leads, projects, and revenue in one dashboard, so nothing falls through the cracks.
              </p>

              <div className="space-y-5 pt-2">
                 {solutions.map((s, i) => (
                    <div key={i} className="flex items-start gap-3 border-l-2 border-[var(--brass)]/40 pl-4">
                       <s.icon size={16} className="text-[var(--brass)] mt-1 shrink-0" />
                       <div>
                          <p className="font-medium text-sm">{s.title}</p>
                          <p className="text-xs text-[var(--ink-text-muted)] mt-0.5">{s.desc}</p>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
           
           <div className="flex-1 w-full">
              <div className="relative border border-[var(--rule)] p-1">
                    <img 
                      src="/Dashboard-preview.png" 
                      alt="Flowlance dashboard preview" 
                      className="w-full h-auto"
                    />
              </div>
           </div>
        </div>
      </div>
    </section>
  );
}
