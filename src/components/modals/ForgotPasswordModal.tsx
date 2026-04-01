'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, CheckCircle, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { CenteredModal } from '@/components/ui/CenteredModal';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to send reset link');
      }

      setStatus('success');
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Reset state before closing
    setEmail('');
    setStatus('idle');
    setErrorMessage('');
    onClose();
  };

  return (
    <CenteredModal isOpen={isOpen} onClose={handleClose} title="Reset Password">
      <AnimatePresence mode="wait">
        {status === 'success' ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-8 text-center"
          >
            <h3 className="text-xl font-bold mb-2">Check your inbox</h3>
            <p className="text-sm opacity-60 max-w-xs mx-auto mb-6">
              If an account with <b>{email}</b> exists in our database, a password reset link has been sent. Please check your inbox and follow the instructions.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleClose}
                className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl font-bold hover:opacity-90 transition-opacity"
              >
                Back to Login
              </button>
              <button
                onClick={() => setStatus('idle')}
                className="text-xs font-bold opacity-60 hover:opacity-100 transition-opacity"
              >
                Mistyped? Try again
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <p className="text-sm opacity-60 mb-6 px-1">
              Enter your email address and we'll send you a link to reset your password.
            </p>

            {status === 'error' && (
              <div className="bg-destructive/10 text-destructive p-3 rounded-lg mb-4 text-xs flex items-center gap-2">
                <AlertCircle size={14} />
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-background border border-[var(--border)] outline-none focus:ring-2 focus:ring-primary transition-all text-sm"
                  placeholder="name@company.com"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : null}
                {loading ? 'Sending link...' : 'Send Reset Link'}
              </button>

              <button
                type="button"
                onClick={handleClose}
                className="w-full flex items-center justify-center gap-2 text-xs font-bold opacity-60 hover:opacity-100 transition-opacity"
              >
                <ArrowLeft size={14} /> Back to Login
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </CenteredModal>
  );
}
