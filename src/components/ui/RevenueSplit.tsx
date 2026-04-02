'use client';

import React, { useState, useEffect } from 'react';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { Users, AlertCircle, Percent } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Share {
  userId: string;
  percentage: number;
}

interface RevenueSplitProps {
  shares: Share[];
  onChange: (newShares: Share[]) => void;
  totalAmount: number;
}

export function RevenueSplit({ shares, onChange, totalAmount }: RevenueSplitProps) {
  const { workspace } = useWorkspaceStore();
  const [localShares, setLocalShares] = useState<Share[]>(shares || []);
  const [error, setError] = useState<string | null>(null);

  // Initialize if empty
  useEffect(() => {
    if (workspace && localShares.length === 0) {
      // Default to owner 100%
      const ownerId = (workspace.ownerId as any)._id || workspace.ownerId;
      const initial = [{ userId: ownerId, percentage: 100 }];
      setLocalShares(initial);
      onChange(initial);
    }
  }, [workspace]);

  const totalPercentage = localShares.reduce((sum, s) => sum + s.percentage, 0);

  useEffect(() => {
    if (totalPercentage !== 100) {
      setError(`Total must be 100% (Current: ${totalPercentage}%)`);
    } else {
      setError(null);
    }
  }, [totalPercentage]);

  const handleUpdate = (userId: string, value: string) => {
    const numValue = Math.max(0, Math.min(100, parseInt(value) || 0));
    const updated = workspace!.members.map(m => {
      const existing = localShares.find(s => s.userId === m.userId._id);
      if (m.userId._id === userId) {
        return { userId, percentage: numValue };
      }
      return existing || { userId: m.userId._id, percentage: 0 };
    });
    
    // Ensure owner is included if not in members list (should be there normally)
    const ownerId = (workspace!.ownerId as any)._id || workspace!.ownerId;
    if (!updated.find(u => u.userId === ownerId)) {
       const existingOwner = localShares.find(s => s.userId === ownerId);
       updated.push(userId === ownerId ? { userId: ownerId, percentage: numValue } : (existingOwner || { userId: ownerId, percentage: 0 }));
    }

    setLocalShares(updated);
    onChange(updated);
  };

  if (!workspace) return null;

  // Combine owner and members for the list
  const allMembers = workspace.members;

  return (
    <div className="space-y-4 py-4 border-t border-[var(--border)] mt-6">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-bold flex items-center gap-2 opacity-70 uppercase tracking-widest">
          <Users size={16} /> Revenue Split
        </h4>
        <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${error ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
          {totalPercentage}% Total
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {allMembers.map((member) => {
          const uId = member.userId._id;
          const share = localShares.find(s => s.userId === uId) || { userId: uId, percentage: 0 };
          const amount = (totalAmount * share.percentage) / 100;

          return (
            <div key={uId} className="flex items-center justify-between p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-transparent hover:border-primary/10 transition-all">
              <div className="flex items-center gap-3 shrink-0 overflow-hidden pr-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                  {member.userId.name.charAt(0)}
                </div>
                <div className="truncate">
                  <p className="text-xs font-bold truncate">{member.userId.name}</p>
                  <p className="text-[10px] opacity-40 truncate">₹{amount.toLocaleString('en-IN')}</p>
                </div>
              </div>

              <div className="relative w-20 shrink-0">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={share.percentage}
                  onChange={(e) => handleUpdate(uId, e.target.value)}
                  className="w-full bg-background border rounded-lg py-1.5 pl-3 pr-7 text-xs font-bold outline-none focus:ring-1 focus:ring-primary transition-all text-right"
                />
                <Percent size={10} className="absolute right-2 top-1/2 -translate-y-1/2 opacity-40" />
              </div>
            </div>
          );
        })}
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 text-[10px] font-bold text-red-500 bg-red-500/5 p-2 rounded-lg"
          >
            <AlertCircle size={12} /> {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
