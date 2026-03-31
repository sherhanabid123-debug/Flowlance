'use client';

import React from 'react';
import { motion } from 'framer-motion';

export type ClientStatus = 'potential' | 'confirmed' | 'completed';

interface StatusBadgeProps {
  status: ClientStatus;
  className?: string;
}

const statusStyles = {
  potential: {
    bg: 'bg-blue-600',
    text: 'text-white',
    label: 'Potential',
    glow: 'shadow-[0_0_10px_rgba(37,99,235,0.2)]'
  },
  confirmed: {
    bg: 'bg-amber-500', // Amber-500 offers excellent visibility with black text
    text: 'text-black font-bold',
    label: 'Confirmed',
    glow: 'shadow-[0_0_10px_rgba(245,158,11,0.2)]'
  },
  completed: {
    bg: 'bg-green-600',
    text: 'text-white',
    label: 'Completed',
    glow: 'shadow-[0_0_10px_rgba(22,163,74,0.2)]'
  }
};

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const styles = statusStyles[status] || statusStyles.potential;

  return (
    <motion.span
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`
        px-3 py-1.5 
        rounded-full 
        text-[10px] 
        font-bold 
        uppercase 
        tracking-widest 
        border border-white/10 
        transition-all 
        ${styles.bg} 
        ${styles.text} 
        ${styles.glow}
        ${className}
      `}
    >
      {styles.label}
    </motion.span>
  );
}
