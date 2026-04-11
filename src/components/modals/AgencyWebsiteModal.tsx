'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useToastStore } from '@/store/useToastStore';

export function AgencyWebsiteModal() {
  const { user, setUser, isAuthenticated } = useAuthStore();
  const { addToast } = useToastStore();
  const [isOpen, setIsOpen] = useState(false);
  const [website, setWebsite] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user?.userType === 'agency' && !user?.agencyWebsite) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [isAuthenticated, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!website.trim()) return addToast('Please enter your agency website', 'error');

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/user/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agencyWebsite: website }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update website');

      setUser(data.user);
      addToast('Website updated!', 'success');
      setIsOpen(false);
    } catch (err: any) {
      addToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-xl"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-lg glass border-2 border-primary/20 rounded-[2.5rem] p-8 sm:p-10 relative z-10 shadow-[0_0_50px_rgba(var(--primary-rgb),0.2)]"
          >
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-2 rotate-3 group-hover:rotate-0 transition-transform">
                <Globe className="text-primary" size={40} />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-3xl font-black tracking-tight flex items-center justify-center gap-2">
                  Complete Your Profile <Sparkles className="text-amber-500 fill-amber-500/20" size={24} />
                </h2>
                <p className="text-[var(--text-muted)] text-lg">
                  Every great agency needs a showcase. Add your website link to complete your identity.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6 pt-4 text-left">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 px-2">Agency Website / Portfolio</label>
                  <div className="relative group">
                    <Globe className="absolute left-5 top-1/2 -translate-y-1/2 text-primary opacity-30 group-focus-within:opacity-100 transition-opacity" size={20} />
                    <input
                      type="url"
                      placeholder="https://yourcreativeagency.com"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      className="w-full bg-[var(--background)]/50 border-2 border-[var(--border)] group-hover:border-primary/20 rounded-2xl pl-14 pr-6 py-5 text-lg focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/40 transition-all placeholder:opacity-30"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-16 bg-primary text-white font-black rounded-2xl flex items-center justify-center gap-3 hover:shadow-2xl hover:shadow-primary/30 transition-all active:scale-[0.98] disabled:opacity-50 text-lg group"
                >
                  {isSubmitting ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <>
                      Save Profile
                      <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
                
                <p className="text-[10px] text-center opacity-30 font-bold uppercase tracking-[.2em]">
                  This link will be clickable in your sidebar
                </p>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
