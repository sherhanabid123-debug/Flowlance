'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/useAuthStore';
import { ForgotPasswordModal } from '@/components/modals/ForgotPasswordModal';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get('inviteToken');
  const shouldRegister = searchParams.get('register') === 'true';

  const [isLogin, setIsLogin] = useState(!shouldRegister);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  
  const [googleLoading, setGoogleLoading] = useState(false);
  
  const { setUser, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      if (inviteToken) {
        router.push(`/invite?token=${inviteToken}`);
      } else {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, router, inviteToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      if (isLogin) {
        setUser({ email: data.email });
        if (inviteToken) {
          router.push(`/invite?token=${inviteToken}`);
        } else {
          router.push('/dashboard');
        }
      } else {
        setIsLogin(true); // Switch to login after successful register
        if (inviteToken) {
          alert('Registration successful! Please login to join your team.');
        } else {
          alert('Registration successful! Please login.');
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted relative overflow-hidden">
      {/* Decorative Blob */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 20, stiffness: 100 }}
        className="w-full max-w-md glass p-8 rounded-2xl relative z-10"
      >
        <h2 className="text-3xl font-bold mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>

        {inviteToken && (
           <motion.div
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             className="mb-6 p-4 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center gap-3 text-primary text-sm font-bold animate-pulse text-center"
           >
             🎁 You're invited to join a team!
           </motion.div>
        )}

        {error && (
          <div className="bg-destructive/10 text-destructive p-3 rounded-lg mb-4 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 opacity-70">Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-xl bg-background border outline-none focus:ring-2 focus:ring-primary transition-all"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-xl bg-background border outline-none focus:ring-2 focus:ring-primary transition-all"
              placeholder="••••••••"
            />
            {isLogin && (
              <div className="flex justify-end mt-1">
                <motion.button 
                  whileHover={{ scale: 1.1, color: 'var(--primary)' }}
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-[10px] font-bold opacity-50 hover:opacity-100 transition-all uppercase tracking-widest px-1"
                >
                  Forgot Password?
                </motion.button>
              </div>
            )}
          </div>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
            disabled={loading}
            type="submit" 
            className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-bold hover:opacity-90 transition-all flex justify-center items-center shadow-lg shadow-primary/25 disabled:opacity-50"
          >
            {loading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full mr-2"
              />
            ) : null}
            {isLogin ? 'Login' : 'Sign Up'}
          </motion.button>
        </form>

        <p className="mt-8 text-center text-sm opacity-70">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary font-bold hover:underline px-1"
          >
            {isLogin ? 'Sign up' : 'Login'}
          </motion.button>
        </p>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[var(--border)] opacity-30"></div>
          </div>
          <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold">
            <span className="bg-[var(--background)] px-4 opacity-40">Or continue with</span>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02, backgroundColor: '#fdfdfd', borderColor: '#e5e7eb' }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 400, damping: 10 }}
          type="button"
          disabled={googleLoading}
          onClick={() => {
            setGoogleLoading(true);
            const googleUrl = new URL('/api/auth/google', window.location.origin);
            if (inviteToken) googleUrl.searchParams.set('inviteToken', inviteToken);
            window.location.href = googleUrl.toString();
          }}
          className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl bg-white text-black font-bold transition-all border border-gray-200 shadow-md hover:shadow-lg active:shadow-inner group relative"
        >
          {googleLoading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-5 h-5 border-2 border-gray-200 border-t-blue-500 rounded-full"
            />
          ) : (
            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
              <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
              <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
              <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
            </svg>
          )}
          <span className="relative z-10">{googleLoading ? 'Redirecting...' : 'Google'}</span>
        </motion.button>
      </motion.div>

      <ForgotPasswordModal 
        isOpen={showForgotModal} 
        onClose={() => setShowForgotModal(false)} 
      />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}
