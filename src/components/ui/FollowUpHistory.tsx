'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { PhoneOff, ThumbsUp, ThumbsDown, Clock, Sparkles, MessageSquare, Calendar } from 'lucide-react';

interface HistoryItem {
  outcome: string;
  date: string | Date;
  notes?: string;
}

interface FollowUpHistoryProps {
  history: HistoryItem[];
}

const outcomeIcons: Record<string, any> = {
  'Call not answered': { icon: PhoneOff, color: 'text-red-500', bg: 'bg-red-500/10' },
  'Interested': { icon: ThumbsUp, color: 'text-green-500', bg: 'bg-green-500/10' },
  'Not interested': { icon: ThumbsDown, color: 'text-gray-500', bg: 'bg-gray-500/10' },
  'Call later': { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  'Converted': { icon: Sparkles, color: 'text-primary', bg: 'bg-primary/10' },
};

export function FollowUpHistory({ history }: FollowUpHistoryProps) {
  if (!history || history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 opacity-40">
        <MessageSquare size={40} className="mb-3" />
        <p className="text-sm font-medium">No follow-up history yet.</p>
      </div>
    );
  }

  // Sort history by date descending (latest first)
  const sortedHistory = [...history].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-xs font-bold uppercase tracking-widest opacity-40">Past Interactions</h4>
        <span className="text-[10px] font-bold bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded-full opacity-60">
          {history.length} record{history.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="relative space-y-4 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-primary/20 before:via-[var(--border)] before:to-transparent">
        {sortedHistory.map((item, idx) => {
          const config = outcomeIcons[item.outcome] || { icon: MessageSquare, color: 'text-primary', bg: 'bg-primary/10' };
          const Icon = config.icon;

          return (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="relative flex items-start gap-4"
            >
              <div className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-xl border-4 border-[var(--card)] shadow-sm shrink-0 ${config.bg} ${config.color}`}>
                <Icon size={16} />
              </div>
              
              <div className="flex-1 bg-black/5 dark:bg-white/5 rounded-2xl p-4 border border-transparent hover:border-[var(--border)] transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <span className={`text-xs font-bold ${config.color}`}>{item.outcome}</span>
                  <div className="flex items-center gap-1.5 opacity-40">
                    <Calendar size={12} />
                    <span className="text-[10px] font-bold">{format(new Date(item.date), 'MMM dd, yyyy • hh:mm a')}</span>
                  </div>
                </div>
                
                {item.notes ? (
                  <p className="text-sm opacity-70 leading-relaxed italic">
                    "{item.notes}"
                  </p>
                ) : (
                  <p className="text-xs opacity-30 italic">No notes recorded.</p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
