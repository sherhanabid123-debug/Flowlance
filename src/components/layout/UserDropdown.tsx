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
            className="absolute right-0 mt-2 w-64 glass bg-card rounded-2xl shadow-2xl border border-[var(--border)] overflow-hidden z-50 origin-top-right"
          >
            {/* Header */}
            <div className="p-4 bg-black/5 dark:bg-white/5 border-b border-[var(--border)]">
              <p className="text-sm font-bold truncate">{user?.name || 'Your Account'}</p>
              <p className="text-xs opacity-60 truncate">{user?.email}</p>
            </div>

            {/* Menu Items */}
            <div className="p-1.5">
              <button
                onClick={() => {
                  setIsOpen(false);
                  setShowEditProfile(true);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-black/5 dark:hover:bg-white/5 transition-colors group"
              >
                <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500 group-hover:scale-110 transition-transform">
                  <UserIcon size={16} />
                </div>
                <span className="font-medium">Edit Profile</span>
              </button>

              <button
                onClick={() => {
                  setIsOpen(false);
                  setShowChangePassword(true);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-black/5 dark:hover:bg-white/5 transition-colors group"
              >
                <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 group-hover:scale-110 transition-transform">
                  <Lock size={16} />
                </div>
                <span className="font-medium">Change Password</span>
              </button>

              <div className="my-1.5 border-t border-[var(--border)] mx-2" />

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-destructive hover:bg-destructive/10 transition-colors group"
              >
                <div className="p-1.5 rounded-lg bg-destructive/10 group-hover:scale-110 transition-transform">
                  <LogOut size={16} />
                </div>
                <span className="font-bold">Logout</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <EditProfileModal isOpen={showEditProfile} onClose={() => setShowEditProfile(false)} />
      <ChangePasswordModal isOpen={showChangePassword} onClose={() => setShowChangePassword(false)} />
    </div>
  );
}
