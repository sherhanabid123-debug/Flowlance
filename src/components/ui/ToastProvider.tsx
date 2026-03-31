'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useToastStore } from '@/store/useToastStore';

export function ToastProvider() {
  const { toasts } = useToastStore();

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`min-w-[250px] px-6 py-4 rounded-xl shadow-lg font-medium backdrop-blur-md border ${
              toast.type === 'success'
                ? 'bg-green-500/90 text-white border-green-600'
                : toast.type === 'error'
                ? 'bg-red-500/90 text-white border-red-600'
                : 'bg-white/90 dark:bg-slate-800/90 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700'
            }`}
          >
            {toast.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
