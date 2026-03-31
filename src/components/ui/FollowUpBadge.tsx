'use client';

import React from 'react';
import { formatDistanceToNow, isPast, isToday, format } from 'date-fns';
import { Clock, AlertCircle, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

interface FollowUpBadgeProps {
  nextDate?: Date | string;
  lastDate?: Date | string;
  className?: string;
}

export function FollowUpBadge({ nextDate, lastDate, className = '' }: FollowUpBadgeProps) {
  if (!nextDate) return null;

  const next = new Date(nextDate);
  const last = lastDate ? new Date(lastDate) : null;
  
  const overdue = isPast(next) && !isToday(next);
  const today = isToday(next);
  
  let colorClass = 'bg-indigo-600 text-white';
  let icon = <Calendar size={12} />;
  let label = `Next: ${format(next, 'dd/MM/yy')}`;
  const timeDist = formatDistanceToNow(next, { addSuffix: true });

  if (overdue) {
    colorClass = 'bg-red-600 text-white animate-pulse';
    icon = <AlertCircle size={12} />;
    label = `Overdue: ${format(next, 'dd/MM/yy')} (${timeDist})`;
  } else if (today) {
    colorClass = 'bg-amber-500 text-black font-bold';
    icon = <Clock size={12} />;
    label = 'Due Today';
  } else {
    label = `Next: ${format(next, 'dd/MM/yy')} (${timeDist})`;
  }

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm ${colorClass}`}
      >
        {icon}
        {label}
      </motion.div>
      
      {last && (
        <span className="text-[10px] opacity-50 flex items-center gap-1 px-1">
          Last: {format(last, 'dd/MM/yy')} ({formatDistanceToNow(last, { addSuffix: true })})
        </span>
      )}
    </div>
  );
}
