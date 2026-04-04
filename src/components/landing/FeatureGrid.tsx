'use client';
import { motion } from 'framer-motion';
import { Users, LayoutDashboard, Wallet, Bell, Target, IndianRupee, PieChart, ShieldCheck } from 'lucide-react';

export function FeatureGrid() {
  const features = [
    { title: "Client Tracking", desc: "Manage every lead from first contact to final invoice.", icon: LayoutDashboard, color: "text-blue-500", bg: "bg-blue-500/10 border-blue-500/20" },
    { title: "Smart Reminders", desc: "Automatic follow up logic so you never miss a beat.", icon: Bell, color: "text-indigo-500", bg: "bg-indigo-500/10 border-indigo-500/20" },
    { title: "Revenue Analytics", desc: "See your growth trends and project your future earnings.", icon: PieChart, color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/20" },
    { title: "Team Collaboration", desc: "Invite members and manage permissions seamlessly.", icon: Users, color: "text-purple-500", bg: "bg-purple-500/10 border-purple-500/20" },
    { title: "Revenue Split", desc: "Perfect for agencies. Split earnings automatically per project.", icon: IndianRupee, color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/20" },
    { title: "Secure Data", desc: "Encrypted, safe, and private database for your business.", icon: ShieldCheck, color: "text-sky-500", bg: "bg-sky-500/10 border-sky-500/20" },
  ];

  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16 space-y-4">
           <h2 className="text-xs font-bold text-primary uppercase tracking-widest">Capabilities</h2>
           <h3 className="text-4xl font-bold tracking-tight">Everything your agency needs.</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
           {features.map((f, i) => (
             <motion.div
               key={i}
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ delay: i * 0.1 }}
               className="p-8 rounded-[32px] glass border border-transparent hover:border-primary/20 transition-all group scale-100 hover:scale-[1.02]"
             >
                <div className={`p-4 rounded-2xl w-fit mb-6 ${f.bg} ${f.color} transition-transform group-hover:scale-110`}>
                   <f.icon size={26} />
                </div>
                <h4 className="text-xl font-bold mb-3">{f.title}</h4>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                   {f.desc}
                </p>
             </motion.div>
           ))}
        </div>
      </div>
    </section>
  );
}
