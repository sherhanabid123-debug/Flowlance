'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Clock, AlertCircle, CheckCheck, ChevronRight } from 'lucide-react';
import { useClientStore } from '@/store/useClientStore';
import { isPast, isToday, format } from 'date-fns';
import Link from 'next/link';

export function NotificationDropdown() {
  const { clients } = useClientStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const dueFollowUps = clients
    .filter(c => c.status !== 'completed' && c.nextFollowUp && (isPast(new Date(c.nextFollowUp)) || isToday(new Date(c.nextFollowUp))))
    .sort((a, b) => new Date(a.nextFollowUp).getTime() - new Date(b.nextFollowUp).getTime());

  const count = dueFollowUps.length;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-all group"
      >
        <Bell size={20} className={`transition-transform group-hover:rotate-12 ${count > 0 ? 'text-primary' : 'opacity-40'}`} />
        {count > 0 && (
          <span className="absolute top-2 right-2 w-4 h-4 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-background animate-pulse">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="absolute right-0 mt-3 w-80 glass bg-card rounded-2xl shadow-2xl border border-[var(--border)] overflow-hidden z-50 origin-top-right"
          >
            <div className="p-4 border-b border-[var(--border)] bg-black/5 dark:bg-white/5 flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Bell size={14} className="text-primary" />
                Quick Tasks
              </h3>
              {count > 0 && <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-md">{count} Due</span>}
            </div>

            <div className="max-h-[320px] overflow-y-auto custom-scrollbar">
              {count === 0 ? (
                <div className="p-10 text-center flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center">
                    <CheckCheck size={24} />
                  </div>
                  <p className="text-xs opacity-60 font-medium italic">You're all caught up!</p>
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {dueFollowUps.slice(0, 5).map((client) => {
                    const next = new Date(client.nextFollowUp);
                    const overdue = isPast(next) && !isToday(next);
                    
                    return (
                      <Link 
                        key={client._id}
                        href="/dashboard/clients"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors group"
                      >
                        <div className={`p-2 rounded-lg ${overdue ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'}`}>
                          {overdue ? <AlertCircle size={16} /> : <Clock size={16} />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold truncate group-hover:text-primary transition-colors">{client.name}</p>
                          <p className="text-[10px] opacity-60 truncate">Follow-up due {format(next, 'dd/MM/yy')}</p>
                        </div>
                        <ChevronRight size={14} className="opacity-0 group-hover:opacity-40 -translate-x-2 group-hover:translate-x-0 transition-all" />
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {count > 0 && (
              <Link
                href="/dashboard/clients"
                onClick={() => setIsOpen(false)}
                className="block p-3 text-center text-xs font-bold bg-black/5 dark:bg-white/5 hover:bg-primary hover:text-white transition-all border-t border-[var(--border)]"
              >
                View all clients
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
