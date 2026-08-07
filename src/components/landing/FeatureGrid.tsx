'use client';
import { motion } from 'framer-motion';
import { Users, LayoutDashboard, Bell, IndianRupee, PieChart, ShieldCheck } from 'lucide-react';

export function FeatureGrid() {
  const features = [
    { title: "Client tracking", desc: "Manage every lead from first contact to final invoice.", icon: LayoutDashboard },
    { title: "Smart reminders", desc: "Automatic follow up scheduling so you never miss a beat.", icon: Bell },
    { title: "Revenue overview", desc: "See where your pipeline stands and what's been earned.", icon: PieChart },
    { title: "Team collaboration", desc: "Invite members and manage permissions with role based access.", icon: Users },
    { title: "Revenue split", desc: "Perfect for agencies. Split earnings automatically per project.", icon: IndianRupee },
    { title: "Private by default", desc: "Your client data lives in its own workspace, visible only to your team.", icon: ShieldCheck },
  ];

  return (
    <section className="py-20 sm:py-24 border-t border-[var(--rule)]">
      <div className="max-w-4xl mx-auto px-6">
        <div className="mb-12 space-y-3">
           <h2 className="text-xs font-mono text-[var(--brass)] uppercase tracking-widest">Capabilities</h2>
           <h3 className="font-display text-2xl sm:text-4xl font-medium tracking-tight">Everything your agency needs.</h3>
        </div>

        <div className="border-t border-[var(--rule)]">
           {features.map((f, i) => (
             <motion.div
               key={i}
               initial={{ opacity: 0 }}
               whileInView={{ opacity: 1 }}
               viewport={{ once: true }}
               transition={{ delay: i * 0.05 }}
               className="border-b border-[var(--rule)] py-5 flex items-start gap-4 sm:gap-8"
             >
                <f.icon size={18} className="text-[var(--brass)] mt-0.5 shrink-0" />
                <h4 className="font-medium text-sm sm:w-48 shrink-0">{f.title}</h4>
                <p className="text-sm text-[var(--ink-text-muted)] leading-relaxed">
                   {f.desc}
                </p>
             </motion.div>
           ))}
        </div>
      </div>
    </section>
  );
}
