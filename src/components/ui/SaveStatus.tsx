'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { SaveStatus as SaveStatusType } from '@/hooks/useAutosave';
import { useEffect, useState } from 'react';

interface SaveStatusProps {
  status: SaveStatusType;
  error?: string | null;
  onRetry?: () => void;
}

export function SaveStatus({ status, error, onRetry }: SaveStatusProps) {
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    if (status === 'saved') {
      setShowSaved(true);
      const timer = setTimeout(() => setShowSaved(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  return (
    <div className="flex items-center gap-2 text-xs font-semibold h-6">
      <AnimatePresence mode="wait">
        {status === 'saving' && (
          <motion.div
            key="saving"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="flex items-center gap-1.5 text-blue-500 bg-blue-500/10 px-2 py-1 rounded-md"
          >
            <Loader2 size={12} className="animate-spin" />
            <span>Saving...</span>
          </motion.div>
        )}

        {status === 'saved' && showSaved && (
          <motion.div
            key="saved"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="flex items-center gap-1.5 text-green-500 bg-green-500/10 px-2 py-1 rounded-md"
          >
            <CheckCircle2 size={12} />
            <span>Saved ✓</span>
          </motion.div>
        )}

        {status === 'error' && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="flex items-center gap-2 text-destructive bg-destructive/10 px-2 py-1 rounded-md group"
          >
            <div className="flex items-center gap-1.5">
              <AlertCircle size={12} />
              <span>{error || 'Failed to save'}</span>
            </div>
            {onRetry && (
              <button
                onClick={onRetry}
                className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-destructive text-white hover:bg-destructive/90 transition-colors shadow-sm"
              >
                <RefreshCw size={10} className="group-hover:rotate-180 transition-transform duration-500" />
                <span>Retry</span>
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
