'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface OnboardingCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  selected: boolean;
  onClick: () => void;
}

export function OnboardingCard({ title, description, icon: Icon, selected, onClick }: OnboardingCardProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative w-full p-6 text-left border rounded-3xl transition-all duration-300 group overflow-hidden ${
        selected 
          ? 'bg-primary/10 border-primary ring-1 ring-primary shadow-xl shadow-primary/10' 
          : 'glass border-[var(--border)] hover:border-primary/30'
      }`}
    >
      <div className={`p-4 rounded-2xl w-fit mb-4 transition-colors ${
        selected ? 'bg-primary text-white' : 'bg-primary/5 text-primary group-hover:bg-primary/10'
      }`}>
        <Icon size={28} />
      </div>

      <div className="space-y-1">
        <h3 className="font-bold text-lg">{title}</h3>
        <p className="text-sm text-[var(--text-muted)] leading-relaxed">
          {description}
        </p>
      </div>

      {/* Decorative background accent */}
      <div className={`absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity transition-transform group-hover:scale-110 ${
        selected ? 'opacity-[0.1]' : ''
      }`}>
        <Icon size={120} />
      </div>
      
      {/* Selection indicator */}
      {selected && (
        <motion.div 
          layoutId="selection-border"
          className="absolute inset-0 border-2 border-primary rounded-3xl"
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
    </motion.button>
  );
}
