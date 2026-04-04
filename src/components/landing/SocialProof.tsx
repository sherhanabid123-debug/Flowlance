'use client';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

export function SocialProof() {
  const testimonials = [
    { name: "Anish Gupta", role: "Creative Director", body: "Finally stopped losing leads to my messy inbox. Flowlance is a game changer for my agency." },
    { name: "Rahul", role: "Brand Strategy", body: "The dashboard is everything. I can see my whole revenue month in two seconds." },
    { name: "Rohan V.", role: "Web Developer", body: "The WhatsApp shortcut saves me 10 minutes per client per day. Simple and effective." },
  ];

  return (
    <section className="py-20 sm:py-24 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12 sm:mb-16 space-y-4 px-4 sm:px-0">
           <h2 className="text-xs font-bold text-indigo-500 uppercase tracking-widest">Testimonials</h2>
           <h3 className="text-3xl sm:text-4xl font-bold tracking-tight">Built for businesses that prioritize growth.</h3>
        </div>
 
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
           {testimonials.map((t, i) => (
             <div
               key={i}
               className="p-6 sm:p-8 rounded-3xl glass border border-transparent bg-indigo-600/5 hover:border-indigo-600/20 transition-all flex flex-col items-start gap-4"
             >
                <div className="flex gap-1 text-indigo-500">
                   {[...Array(5)].map((_, i) => <Star key={i} size={14} className="fill-current" />)}
                </div>
                <p className="text-base sm:text-lg leading-relaxed font-medium italic opacity-80">
                  "{t.body}"
                </p>
                <div className="mt-2 sm:mt-4">
                   <p className="font-bold text-sm sm:text-base">{t.name}</p>
                   <p className="text-[10px] sm:text-xs opacity-50 uppercase tracking-widest">{t.role}</p>
                </div>
             </div>
           ))}
        </div>
      </div>
    </section>
  );
}
