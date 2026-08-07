'use client';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

export function SocialProof() {
  const points = [
    { title: "No setup fuss", body: "Add your first client in under a minute. No onboarding calls, no configuration." },
    { title: "Built by a freelancer", body: "Flowlance started as a tool to fix one problem: too many leads slipping through the cracks." },
    { title: "Actually used daily", body: "Every feature here exists because it solved a real problem in a real client pipeline." },
  ];

  return (
    <section className="py-20 sm:py-24 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12 sm:mb-16 space-y-4 px-4 sm:px-0">
           <h2 className="text-xs font-bold text-indigo-500 uppercase tracking-widest">Why Flowlance</h2>
           <h3 className="text-3xl sm:text-4xl font-bold tracking-tight">Built to solve a real problem.</h3>
        </div>
 
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
           {points.map((p, i) => (
             <div
               key={i}
               className="p-6 sm:p-8 rounded-3xl glass border border-transparent bg-indigo-600/5 hover:border-indigo-600/20 transition-all flex flex-col items-start gap-4"
             >
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
                   <CheckCircle2 size={20} />
                </div>
                <div>
                   <p className="font-bold text-sm sm:text-base mb-1">{p.title}</p>
                   <p className="text-sm sm:text-base leading-relaxed opacity-70">{p.body}</p>
                </div>
             </div>
           ))}
        </div>
      </div>
    </section>
  );
}
