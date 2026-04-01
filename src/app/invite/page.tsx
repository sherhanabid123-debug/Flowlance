'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useToastStore } from '@/store/useToastStore';
import { Loader2, Zap, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function InviteHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { joinWorkspace } = useWorkspaceStore();
  const { isAuthenticated, user } = useAuthStore();
  const { addToast } = useToastStore();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'guest'>('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('error');
      setError('No invite token found in the URL.');
      return;
    }

    if (!isAuthenticated) {
      setStatus('guest');
      return;
    }

    const autoJoin = async () => {
      try {
        const workspaceName = await joinWorkspace(token);
        setStatus('success');
        addToast(`Successfully joined "${workspaceName}" team!`, 'success');
        setTimeout(() => router.push('/dashboard'), 2000);
      } catch (err: any) {
        setStatus('error');
        setError(err.message || 'Failed to join workspace.');
      }
    };

    autoJoin();
  }, [searchParams, joinWorkspace, isAuthenticated, addToast, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] p-4">
      <div className="w-full max-w-md">
        <AnimatePresence mode="wait">
          {status === 'loading' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="glass border rounded-3xl p-8 text-center space-y-6"
            >
              <div className="relative w-20 h-20 mx-auto">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border-4 border-primary/20 border-t-primary rounded-full"
                />
                <Zap className="absolute inset-0 m-auto text-primary animate-pulse" size={32} />
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold tracking-tight">Syncing Invite...</h1>
                <p className="text-[var(--text-muted)] text-sm">Hang tight while we add you to the team.</p>
              </div>
            </motion.div>
          )}

          {status === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass border border-green-500/20 rounded-3xl p-8 text-center space-y-6"
            >
              <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="text-green-500" size={40} />
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold tracking-tight">You're in!</h1>
                <p className="text-[var(--text-muted)] text-sm">Redirecting you to your new dashboard...</p>
              </div>
            </motion.div>
          )}

          {status === 'error' && (
            <motion.div
              key="error"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass border border-red-500/20 rounded-3xl p-8 text-center space-y-6"
            >
              <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="text-red-500" size={40} />
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold tracking-tight text-red-500">Invalid Invite</h1>
                <p className="text-[var(--text-muted)] text-sm">{error}</p>
              </div>
              <button
                onClick={() => router.push('/dashboard')}
                className="w-full py-3 bg-primary text-white font-bold rounded-2xl hover:opacity-90 transition-all"
              >
                Go to Dashboard
              </button>
            </motion.div>
          )}

          {status === 'guest' && (
            <motion.div
              key="guest"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass border rounded-3xl p-8 text-center space-y-7"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto rotate-12">
                <Zap className="text-primary" size={32} />
              </div>
              <div className="space-y-3">
                <h1 className="text-3xl font-bold tracking-tight">You're invited! ✨</h1>
                <p className="text-[var(--text-muted)] text-sm leading-relaxed px-4">
                  Join your team on <span className="text-primary font-bold">Flowlance</span>. Create an account to accept the invitation and start collaborating.
                </p>
              </div>
              <button
                onClick={() => router.push(`/login?inviteToken=${searchParams.get('token')}&register=true`)}
                className="w-full py-4 bg-primary text-white font-bold rounded-2xl hover:shadow-xl hover:shadow-primary/20 transition-all active:scale-95"
              >
                Get Started
              </button>
              <div className="pt-2">
                <p className="text-[10px] opacity-40">
                  Already have an account? <button onClick={() => router.push(`/login?inviteToken=${searchParams.get('token')}`)} className="text-primary font-bold hover:underline">Log in</button>
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function InvitePage() {
  return (
    <Suspense fallback={null}>
      <InviteHandler />
    </Suspense>
  );
}
