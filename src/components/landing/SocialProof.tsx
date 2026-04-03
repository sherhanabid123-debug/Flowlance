'use client';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

export function SocialProof() {
  const testimonials = [
    { name: "Anish Gupta", role: "Creative Director", body: "Finally stopped losing leads to my messy inbox. Flowlance is a game-changer for my agency." },
    { name: "Sarah Miller", role: "Brand Strategy", body: "The visual pipeline is everything. I can see my whole revenue month in two seconds." },
    { name: "Rohan V.", role: "Web Developer", body: "The WhatsApp shortcut saves me 10 minutes per client per day. Simple and effective." },
  ];

  return (
    <section className="py-24 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16 space-y-4">
           <h2 className="text-xs font-bold text-indigo-500 uppercase tracking-widest">Testimonials</h2>
           <h3 className="text-4xl font-bold tracking-tight">Built for freelancers, by freelancers.</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           {testimonials.map((t, i) => (
             <motion.div
               key={i}
               initial={{ opacity: 0, scale: 0.95 }}
               whileInView={{ opacity: 1, scale: 1 }}
               viewport={{ once: true }}
               transition={{ delay: i * 0.1 }}
               className="p-8 rounded-3xl glass border border-transparent bg-indigo-600/5 hover:border-indigo-600/20 transition-all flex flex-col items-start gap-4"
             >
                <div className="flex gap-1 text-indigo-500">
                   {[...Array(5)].map((_, i) => <Star key={i} size={14} className="fill-current" />)}
                </div>
                <p className="text-lg leading-relaxed font-medium italic opacity-80">
                  "{t.body}"
                </p>
                <div className="mt-4">
                   <p className="font-bold">{t.name}</p>
                   <p className="text-xs opacity-50 uppercase tracking-widest">{t.role}</p>
                </div>
             </motion.div>
           ))}
        </div>
      </div>
    </section>
  );
}
