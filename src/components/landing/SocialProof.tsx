'use client';

export function SocialProof() {
  const points = [
    { title: "No setup fuss", body: "Add your first client in under a minute. No onboarding calls, no configuration." },
    { title: "Built by a freelancer", body: "Flowlance started as a tool to fix one problem: too many leads slipping through the cracks." },
    { title: "Actually used daily", body: "Every feature here exists because it solved a real problem in a real client pipeline." },
  ];

  return (
    <section className="py-20 sm:py-24 border-t border-[var(--rule)]">
      <div className="max-w-4xl mx-auto px-6">
        <div className="mb-12 space-y-3">
           <h2 className="text-xs font-mono text-[var(--brass)] uppercase tracking-widest">Why Flowlance</h2>
           <h3 className="font-display text-2xl sm:text-4xl font-medium tracking-tight">Built to solve a real problem.</h3>
        </div>
 
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-10">
           {points.map((p, i) => (
             <div key={i}>
                <p className="font-medium text-sm mb-2">{p.title}</p>
                <p className="text-sm leading-relaxed text-[var(--ink-text-muted)]">{p.body}</p>
             </div>
           ))}
        </div>
      </div>
    </section>
  );
}
