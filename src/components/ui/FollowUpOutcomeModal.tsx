'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, PhoneOff, ThumbsUp, ThumbsDown, Clock, Sparkles, Loader2 } from 'lucide-react';
import { CenteredModal } from './CenteredModal';
import { format, addDays } from 'date-fns';

interface FollowUpOutcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { outcome: string, notes?: string, customNextDate?: string }) => Promise<void>;
  clientName: string;
}

const outcomes = [
  { label: 'Call not answered', icon: PhoneOff, color: 'text-red-500', bgColor: 'bg-red-500/10', borderColor: 'border-red-500/20' },
  { label: 'Interested', icon: ThumbsUp, color: 'text-green-500', bgColor: 'bg-green-500/10', borderColor: 'border-green-500/20' },
  { label: 'Not interested', icon: ThumbsDown, color: 'text-gray-500', bgColor: 'bg-gray-500/10', borderColor: 'border-gray-500/20' },
  { label: 'Call later', icon: Clock, color: 'text-amber-500', bgColor: 'bg-amber-500/10', borderColor: 'border-amber-500/20' },
  { label: 'Converted', icon: Sparkles, color: 'text-primary', bgColor: 'bg-primary/10', borderColor: 'border-primary/20' },
];

export function FollowUpOutcomeModal({ isOpen, onClose, onSubmit, clientName }: FollowUpOutcomeModalProps) {
  const [selectedOutcome, setSelectedOutcome] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [customDate, setCustomDate] = useState(format(addDays(new Date(), 1), 'yyyy-MM-dd'));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelect = (outcome: string) => {
    setSelectedOutcome(outcome);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOutcome) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        outcome: selectedOutcome,
        notes,
        customNextDate: selectedOutcome === 'Call later' ? customDate : undefined,
      });
      onClose();
      // Reset state
      setSelectedOutcome(null);
      setNotes('');
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CenteredModal
      isOpen={isOpen}
      onClose={onClose}
      title="Follow-up Outcome"
      maxWidth="max-w-md"
    >
      <form onSubmit={handleFormSubmit} className="space-y-6">
        <div className="text-center mb-6">
          <p className="text-sm opacity-60">What happened with the follow-up for</p>
          <p className="text-lg font-bold text-primary">{clientName}?</p>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {outcomes.map((outcome) => (
            <button
              key={outcome.label}
              type="button"
              onClick={() => handleSelect(outcome.label)}
              className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all ${
                selectedOutcome === outcome.label
                  ? `${outcome.borderColor} ${outcome.bgColor} scale-[1.02] shadow-lg`
                  : 'border-transparent bg-black/5 dark:bg-white/5 opacity-70 hover:opacity-100'
              }`}
            >
              <div className={`p-2 rounded-xl ${outcome.bgColor} ${outcome.color}`}>
                <outcome.icon size={20} />
              </div>
              <span className="font-bold text-sm tracking-tight">{outcome.label}</span>
              {selectedOutcome === outcome.label && (
                <motion.div layoutId="check" className="ml-auto w-2 h-2 rounded-full bg-primary" />
              )}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {selectedOutcome === 'Call later' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2 overflow-hidden"
            >
              <label className="text-xs font-bold uppercase tracking-widest opacity-40 ml-1">When should we call next?</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" size={18} />
                <input
                  type="date"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/5 dark:bg-white/5 border border-transparent focus:border-primary outline-none transition-all font-bold text-sm"
                />
              </div>
            </motion.div>
          )}

          {selectedOutcome && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-2 overflow-hidden"
            >
              <label className="text-xs font-bold uppercase tracking-widest opacity-40 ml-1">Notes (Optional)</label>
              <textarea
                placeholder="e.g. He said he would check his budget and get back..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-transparent focus:border-primary outline-none transition-all text-sm resize-none h-24"
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3.5 rounded-2xl font-bold text-sm border border-[var(--border)] hover:bg-black/5 dark:hover:bg-white/5 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!selectedOutcome || isSubmitting}
            className="flex-[2] py-3.5 rounded-2xl font-bold text-sm bg-primary text-primary-foreground hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              'Save Outcome'
            )}
          </button>
        </div>
      </form>
    </CenteredModal>
  );
}
