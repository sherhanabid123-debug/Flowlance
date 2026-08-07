'use client';
import { ArrowRight } from 'lucide-react';

export function FinalCTA() {
  const benefits = ["No credit card required", "Unlimited clients", "Instant setup"];

  return (
    <section className="py-20 sm:py-28 border-t border-[var(--rule)]">
      <div className="max-w-2xl mx-auto px-6 text-center space-y-8">
        <h2 className="font-display text-3xl sm:text-5xl font-medium tracking-tight">
          Start managing your clients <span className="text-[var(--brass)] italic">today</span>.
        </h2>
        <p className="text-base text-[var(--ink-text-muted)]">Focus on your work, not the follow ups.</p>

        <button
          onClick={() => window.location.href = 'https://flowlance-one.vercel.app/dashboard'}
          className="h-14 px-10 bg-[var(--brass)] text-[var(--ink)] font-mono font-semibold text-sm uppercase tracking-wide hover:brightness-110 transition-all active:scale-[0.98] inline-flex items-center justify-center gap-2"
        >
          Get started
          <ArrowRight size={16} />
        </button>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-8 pt-4 font-mono text-[10px] sm:text-xs uppercase tracking-wider text-[var(--ink-text-muted)]">
          {benefits.map((b, i) => (
             <span key={i}>{b}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
