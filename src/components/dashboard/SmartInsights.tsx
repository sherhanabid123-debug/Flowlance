'use client';

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateDashboardInsights, Insight } from '@/lib/clientInsights';

interface SmartInsightsProps {
  clients: any[];
}

export function SmartInsights({ clients }: SmartInsightsProps) {
  const insights = useMemo(() => generateDashboardInsights(clients), [clients]);

  return (
    <div className="glass p-6 rounded-2xl h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <span className="text-primary italic font-serif text-2xl tracking-tighter">Ai</span> Smart Insights
        </h3>
        <div className="flex -space-x-2">
          {insights.filter(i => i.id !== 'all-clear').slice(0, 3).map((insight, idx) => (
            <div 
              key={idx}
              className={`w-3 h-3 rounded-full border-2 border-[var(--card)] ${insight.color.replace('text-', 'bg-')}`}
            />
          ))}
        </div>
      </div>

      <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <AnimatePresence initial={false} mode="popLayout">
          {insights.map((insight, index) => {
            const Icon = insight.icon;
            return (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-xl border border-transparent hover:border-current/10 transition-all group ${insight.bg} ${insight.color}`}
              >
                <div className="flex gap-3 items-start">
                  <div className={`p-2 rounded-lg ${insight.color.replace('text-', 'bg-')}/10 group-hover:scale-110 transition-transform`}>
                    <Icon size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm leading-tight flex items-center gap-1.5">
                      {insight.label}
                      {insight.count > 0 && (
                        <span className="bg-current/10 px-1.5 py-0.5 rounded text-[10px]">
                          {insight.count}
                        </span>
                      )}
                    </h4>
                    <p className="text-xs opacity-70 mt-1 leading-relaxed">
                      {insight.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {insights.length > 0 && insights[0].id !== 'all-clear' && (
        <div className="mt-4 pt-4 border-t border-current/5">
          <p className="text-[10px] font-bold uppercase tracking-widest opacity-40 text-center">
            Updated just now • Based on real-time data
          </p>
        </div>
      )}
    </div>
  );
}
