'use client';
import { motion } from 'framer-motion';

export function HeroSection() {
  return (
    <div className="relative pt-16 pb-16 sm:pt-24 sm:pb-24 overflow-hidden">
      <div className="absolute inset-0 ledger-grid opacity-[0.06] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 relative z-10 grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-8 items-center">
        <div className="space-y-6 sm:space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 border border-[var(--brass)]/50 text-[var(--brass)] text-[10px] sm:text-xs font-mono uppercase tracking-widest -rotate-1"
          >
            For freelancers &amp; small agencies
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="font-display text-4xl sm:text-6xl lg:text-[4.2rem] font-medium tracking-tight leading-[1.08]"
          >
            Never miss a client
            <br />
            <span className="text-[var(--brass)] italic">follow up</span> again
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16 }}
            className="text-base sm:text-lg text-[var(--ink-text-muted)] max-w-md leading-relaxed"
          >
            Track leads, manage projects, and keep an eye on revenue, all from one dashboard.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.24 }}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-2"
          >
            <button
              onClick={() => window.location.href = 'https://flowlance-one.vercel.app/dashboard'}
              className="w-full sm:w-auto h-12 px-8 bg-[var(--brass)] text-[var(--ink)] font-mono font-semibold text-sm uppercase tracking-wide hover:brightness-110 transition-all active:scale-[0.98]"
            >
              Get started
            </button>
            <button
              onClick={() => window.location.href = 'https://flowlance-one.vercel.app/dashboard'}
              className="w-full sm:w-auto h-12 px-8 border border-[var(--rule)] font-mono text-sm uppercase tracking-wide hover:border-[var(--brass)]/60 transition-all active:scale-[0.98]"
            >
              Try demo
            </button>
          </motion.div>
        </div>

        {/* Receipt-style visual: a torn/perforated ledger slip standing in for a "dashboard mock" */}
        <motion.div
          initial={{ opacity: 0, y: 30, rotate: -6 }}
          animate={{ opacity: 1, y: 0, rotate: -3 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="relative mx-auto w-full max-w-sm"
        >
          <div className="bg-[var(--paper)] text-[var(--ink)] p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.45)] relative">
            {/* Perforated top edge */}
            <div
              className="absolute -top-2 left-0 right-0 h-4"
              style={{
                backgroundImage: 'radial-gradient(circle, var(--ink) 3px, transparent 3px)',
                backgroundSize: '14px 14px',
                backgroundPosition: 'top center',
              }}
            />

            <p className="font-mono text-[10px] uppercase tracking-widest opacity-50 mb-4">Client Ledger</p>

            <div className="space-y-3 font-mono text-xs sm:text-sm">
              <div className="flex justify-between border-b border-[var(--paper-line)] pb-2">
                <span className="opacity-60">Rohan Interiors</span>
                <span className="text-emerald-700 font-semibold">Confirmed</span>
              </div>
              <div className="flex justify-between border-b border-[var(--paper-line)] pb-2">
                <span className="opacity-60">Studio Verve</span>
                <span className="text-amber-700 font-semibold">Potential</span>
              </div>
              <div className="flex justify-between border-b border-[var(--paper-line)] pb-2">
                <span className="opacity-60">Kadam &amp; Co</span>
                <span className="opacity-40 font-semibold">Completed</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="opacity-60">Next follow up</span>
                <span className="font-semibold">Tomorrow, 10:00</span>
              </div>
            </div>

            {/* Stamp */}
            <div className="absolute -bottom-5 -right-4 rotate-[-12deg] border-2 border-[var(--stamp)] text-[var(--stamp)] font-mono font-bold text-xs sm:text-sm px-3 py-1 uppercase tracking-widest opacity-80">
              Tracked
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
