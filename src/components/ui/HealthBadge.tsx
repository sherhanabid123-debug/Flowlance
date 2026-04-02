'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getClientHealthStatus } from '@/lib/clientHealth';

interface HealthBadgeProps {
  lastFollowUp?: string | Date;
  compact?: boolean;
  className?: string;
}

export function HealthBadge({ lastFollowUp, compact = false, className = '' }: HealthBadgeProps) {
  const health = getClientHealthStatus(lastFollowUp);
  const Icon = health.icon;

  if (compact) {
    return (
      <div 
        className={`w-2 h-2 rounded-full ${health.color.replace('text-', 'bg-')} ${className}`}
        title={`Health: ${health.label} - ${health.description}`}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border shadow-sm transition-all ${health.bg} ${health.color} border-${health.status === 'cold' ? 'red-500/20' : 'current'}/10 ${className}`}
      title={health.description}
    >
      <Icon size={12} className={health.status === 'active' ? 'animate-pulse' : ''} />
      <span className="text-[10px] font-bold uppercase tracking-wider">{health.label}</span>
    </motion.div>
  );
}
