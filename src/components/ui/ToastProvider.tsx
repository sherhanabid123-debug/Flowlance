'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useToastStore } from '@/store/useToastStore';

export function ToastProvider() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`min-w-[260px] px-5 py-3.5 rounded-xl shadow-lg font-medium backdrop-blur-md border pointer-events-auto flex items-center justify-between gap-4 ${
              toast.type === 'success'
                ? 'bg-green-500/90 text-white border-green-600'
                : toast.type === 'error'
                ? 'bg-red-500/90 text-white border-red-600'
                : 'bg-white/90 dark:bg-slate-800/90 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700'
            }`}
          >
            <span className="text-sm">{toast.message}</span>
            {toast.action && (
              <button
                onClick={() => {
                  toast.action?.onClick();
                  removeToast(toast.id);
                }}
                className="text-xs font-bold underline underline-offset-2 opacity-90 hover:opacity-100 whitespace-nowrap shrink-0"
              >
                {toast.action.label}
              </button>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
