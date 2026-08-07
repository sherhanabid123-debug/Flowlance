'use client';
import { useAuthStore } from '@/store/useAuthStore';
import Link from 'next/link';

export function LandingNavbar() {
  const { isAuthenticated, openLoginModal } = useAuthStore();

  return (
    <nav className="sticky top-0 z-[100] border-b border-[var(--rule)] bg-[var(--ink)]/95 backdrop-blur-sm px-6 sm:px-10 h-16 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div
          className="w-7 h-7 border border-[var(--brass)] rounded-sm flex items-center justify-center text-[var(--brass)] font-display font-semibold text-sm cursor-pointer"
          onClick={() => window.location.href = '/'}
        >
          F
        </div>
        <div className="flex-col leading-tight hidden sm:flex">
          <span className="font-display text-lg tracking-tight leading-none">Flowlance</span>
          <span className="text-[9px] font-mono opacity-40 tracking-wider uppercase">by Scalera</span>
        </div>
      </div>

      <div className="flex items-center gap-5">
        {isAuthenticated ? (
          <Link href="/dashboard" className="px-4 py-2 border border-[var(--brass)] text-[var(--brass)] text-sm font-mono uppercase tracking-wide hover:bg-[var(--brass)] hover:text-[var(--ink)] transition-colors">
            Dashboard
          </Link>
        ) : (
          <>
            <button
              onClick={() => openLoginModal()}
              className="text-sm font-mono opacity-70 hover:opacity-100 transition-opacity hidden sm:block"
            >
              Sign in
            </button>
            <button
              onClick={() => window.location.href = 'https://flowlance-one.vercel.app/dashboard'}
              className="px-4 py-2 border border-[var(--brass)] text-[var(--brass)] text-sm font-mono uppercase tracking-wide hover:bg-[var(--brass)] hover:text-[var(--ink)] transition-colors"
            >
              Get started
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
