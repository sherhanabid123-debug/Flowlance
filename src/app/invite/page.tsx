'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { useWorkspaceStore } from '@/store/useWorkspaceStore';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function InvitePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const { user, isInitialized } = useAuthStore();
  const { fetchWorkspace } = useWorkspaceStore();
  
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [workspaceName, setWorkspaceName] = useState('');

  const acceptInvite = async () => {
    if (!token || !user) return;
    
    setStatus('loading');
    try {
      const res = await fetch('/api/workspaces/invite', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to join workspace');
      }
      
      setWorkspaceName(data.workspaceName);
      setStatus('success');
      // Refresh workspace data in store
      await fetchWorkspace();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message);
      setStatus('error');
    }
  };

  useEffect(() => {
    // If user is not logged in and auth is initialized, redirect to login
    if (isInitialized && !user) {
      const currentUrl = window.location.href;
      router.push(`/login?returnUrl=${encodeURIComponent(currentUrl)}`);
    }
  }, [user, isInitialized, router]);

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass border rounded-3xl p-8 max-w-md w-full text-center space-y-4">
          <XCircle size={48} className="text-red-500 mx-auto" />
          <h1 className="text-2xl font-bold">Invalid Invite</h1>
          <p className="text-[var(--text-muted)]">This invite link is invalid or has expired.</p>
          <Link href="/dashboard" className="block text-primary font-bold hover:underline">
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--background)]">
      <AnimatePresence mode="wait">
        {status === 'idle' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass border rounded-3xl p-8 max-w-md w-full text-center space-y-8 shadow-2xl"
          >
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto text-primary">
              <Users size={32} />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">Workspace Invitation</h1>
              <p className="text-[var(--text-muted)]">
                You've been invited to join a collaborative agency workspace.
              </p>
            </div>

            <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex items-center gap-4 text-left">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
                <CheckCircle size={20} />
              </div>
              <div className="text-xs space-y-0.5">
                <p className="font-bold">Access Shared Data</p>
                <p className="text-[var(--text-muted)] opacity-80">View and edit clients together with your team.</p>
              </div>
            </div>

            <button
              onClick={acceptInvite}
              className="w-full h-14 bg-primary text-white font-bold rounded-2xl hover:opacity-90 transition-all shadow-lg active:scale-95"
            >
              Accept & Join Workspace
            </button>
          </motion.div>
        )}

        {status === 'loading' && (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center space-y-4"
          >
            <Loader2 size={48} className="text-primary animate-spin mx-auto" />
            <p className="font-bold text-lg">Joining workspace...</p>
          </motion.div>
        )}

        {status === 'success' && (
          <motion.div 
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass border rounded-3xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl"
          >
            <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center mx-auto text-green-500">
              <CheckCircle size={32} />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">Welcome aboard!</h1>
              <p className="text-[var(--text-muted)]">
                You have successfully joined <span className="text-primary font-bold">{workspaceName}</span>.
              </p>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full h-14 bg-primary text-white font-bold rounded-2xl hover:opacity-90 transition-all shadow-lg active:scale-95"
            >
              Go to Dashboard
            </button>
          </motion.div>
        )}

        {status === 'error' && (
          <motion.div 
            key="error"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass border rounded-3xl p-8 max-w-md w-full text-center space-y-6 shadow-2xl"
          >
            <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto text-red-500">
              <XCircle size={32} />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">Oops!</h1>
              <p className="text-red-500 font-medium text-sm">{errorMsg}</p>
            </div>
            <Link href="/dashboard" className="block w-full h-14 flex items-center justify-center border border-[var(--border)] font-bold rounded-2xl hover:bg-black/5 transition-all active:scale-95">
              Back to Safety
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
