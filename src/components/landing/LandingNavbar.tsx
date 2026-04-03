'use client';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/useAuthStore';
import Link from 'next/link';

export function LandingNavbar() {
  const { isAuthenticated, openLoginModal } = useAuthStore();

  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-5xl h-16 glass border rounded-3xl z-[100] px-6 flex items-center justify-between"
    >
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-lg">
          F
        </div>
        <span className="font-bold text-xl tracking-tight hidden sm:block">Flowlance</span>
      </div>

      <div className="flex items-center gap-4">
        {isAuthenticated ? (
          <Link href="/dashboard" className="px-5 py-2.5 bg-primary text-white text-sm font-bold rounded-2xl hover:opacity-90 transition-all">
            Go to Dashboard
          </Link>
        ) : (
          <>
            <button 
              onClick={() => openLoginModal()} 
              className="text-sm font-bold opacity-70 hover:opacity-100 transition-opacity hidden sm:block"
            >
              Sign In
            </button>
            <button 
              onClick={() => openLoginModal()} 
              className="px-5 py-2.5 bg-primary text-white text-sm font-bold rounded-2xl hover:opacity-90 transition-all shadow-lg shadow-primary/20"
            >
              Get Started Free
            </button>
          </>
        )}
      </div>
    </motion.nav>
  );
}
