'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useToastStore } from '@/store/useToastStore';
import { CenteredModal } from '@/components/ui/CenteredModal';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function EditProfileModal({ isOpen, onClose }: EditProfileModalProps) {
  const { user, setUser } = useAuthStore();
  const { addToast } = useToastStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [userType, setUserType] = useState<'freelancer' | 'agency'>('freelancer');
  const [agencyName, setAgencyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const focusRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setUserType(user.userType || 'freelancer');
      setAgencyName(user.agencyName || '');
    }
  }, [user, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => focusRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/user/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, userType, agencyName: userType === 'agency' ? agencyName : '' }),
      });

      const data = await res.json();
      console.log('Update API Response:', data);

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      setUser(data.user);
      addToast('Profile updated successfully', 'success');
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isValid = name.trim() !== '' && 
                  email.trim() !== '' && 
                  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
                  (userType === 'freelancer' || agencyName.trim() !== '');

  return (
    <CenteredModal isOpen={isOpen} onClose={onClose} title="Account Settings">
      {error && (
        <div className="bg-destructive/10 text-destructive p-3 rounded-lg mb-6 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="p-3 bg-black/5 dark:bg-white/5 rounded-xl">
            <label className="text-xs font-semibold uppercase tracking-wider opacity-60 mb-3 block px-1">Identity</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setUserType('freelancer')}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${
                  userType === 'freelancer' 
                    ? 'bg-primary text-primary-foreground shadow-lg scale-[1.02]' 
                    : 'bg-background hover:bg-black/5 dark:hover:bg-white/5 border border-transparent hover:border-[var(--border)]'
                }`}
              >
                Freelancer
              </button>
              <button
                type="button"
                onClick={() => setUserType('agency')}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${
                  userType === 'agency' 
                    ? 'bg-primary text-primary-foreground shadow-lg scale-[1.02]' 
                    : 'bg-background hover:bg-black/5 dark:hover:bg-white/5 border border-transparent hover:border-[var(--border)]'
                }`}
              >
                Agency
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 pt-2">
            <div>
              <label className="block text-sm font-semibold mb-2 opacity-70">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" size={18} />
                <input
                  ref={focusRef}
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-background border border-[var(--border)] outline-none focus:ring-2 focus:ring-primary transition-all text-sm"
                  placeholder="Your Name"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 opacity-70">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-background border border-[var(--border)] outline-none focus:ring-2 focus:ring-primary transition-all text-sm"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            {userType === 'agency' && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: -20 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 0 }}
                exit={{ opacity: 0, height: 0, marginTop: -20 }}
                className="overflow-hidden"
              >
                <label className="block text-sm font-semibold mb-2 opacity-70">Agency Name</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40 font-bold text-xs">AG</span>
                  <input
                    type="text"
                    value={agencyName}
                    onChange={(e) => setAgencyName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-background border border-[var(--border)] outline-none focus:ring-2 focus:ring-primary transition-all text-sm"
                    placeholder="Enter agency name"
                    required={userType === 'agency'}
                  />
                </div>
              </motion.div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-[var(--border)]">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl font-medium border border-[var(--border)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !isValid}
            className="px-6 py-2.5 rounded-xl font-bold bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading && <Loader2 className="animate-spin" size={18} />}
            {loading ? 'Saving...' : 'Update Settings'}
          </button>
        </div>
      </form>
    </CenteredModal>
  );
}
