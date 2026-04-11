'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, User as UserIcon, Lock, Settings, ChevronDown } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { EditProfileModal } from '../modals/EditProfileModal';
import { ChangePasswordModal } from '../modals/ChangePasswordModal';
import { useToastStore } from '@/store/useToastStore';

export function UserDropdown() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const { addToast } = useToastStore();
  
  const [isOpen, setIsOpen] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, []);

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        logout();
        addToast('Logged out successfully', 'info');
        router.push('/login');
      }
    } catch (error) {
      console.error('Logout failed', error);
      // Fallback client-side logout
      logout();
      router.push('/login');
    }
  };

  const nameInitial = (user?.name?.[0] || user?.email?.[0] || 'U').toUpperCase();
  const displayName = user?.name || user?.email?.split('@')[0] || 'User';

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-all text-left"
      >
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary shadow-inner">
          {nameInitial}
        </div>
        <div className="hidden md:block pr-1">
          <p className="text-sm font-semibold leading-tight">{displayName}</p>
          <p className="text-[10px] opacity-60 leading-tight">Admin</p>
        </div>
        <ChevronDown size={16} className={`opacity-40 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-72 bg-white dark:bg-zinc-900 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-[var(--border)] overflow-hidden z-50 origin-top-right"
          >
            {/* Header */}
            <div className="p-5 bg-black/[0.02] dark:bg-white/[0.02] border-b border-[var(--border)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-primary text-sm">
                  {nameInitial}
                </div>
                <div className="flex flex-col min-w-0">
                  <p className="text-sm font-bold truncate">{user?.name || 'Your Account'}</p>
                  <p className="text-[10px] opacity-40 truncate font-medium uppercase tracking-wider">{user?.email}</p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="p-2.5 space-y-1">
              <button
                onClick={() => {
                  setIsOpen(false);
                  setShowEditProfile(true);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-all group relative active:scale-95"
              >
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all shadow-sm">
                  <UserIcon size={16} />
                </div>
                <span>Edit Profile</span>
              </button>

              <button
                onClick={() => {
                  setIsOpen(false);
                  setShowChangePassword(true);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-all group relative active:scale-95"
              >
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-all shadow-sm">
                  <Lock size={16} />
                </div>
                <span>Change Password</span>
              </button>

              <div className="py-2 px-3">
                <div className="border-t border-[var(--border)] w-full" />
              </div>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-destructive hover:bg-destructive/10 transition-all group relative active:scale-95"
              >
                <div className="p-2 rounded-lg bg-destructive/10 text-destructive group-hover:bg-destructive group-hover:text-white transition-all shadow-sm">
                  <LogOut size={16} />
                </div>
                <span>Logout</span>
              </button>
            </div>
            
            <div className="p-3 bg-black/[0.02] dark:bg-white/[0.02] border-t border-[var(--border)]">
              <p className="text-[10px] text-center opacity-30 font-bold uppercase tracking-widest">Flowlance v1.2</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <EditProfileModal isOpen={showEditProfile} onClose={() => setShowEditProfile(false)} />
      <ChangePasswordModal isOpen={showChangePassword} onClose={() => setShowChangePassword(false)} />
    </div>
  );
}
