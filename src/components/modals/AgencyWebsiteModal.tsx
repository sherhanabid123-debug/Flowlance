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
  const [step, setStep] = useState<'ask' | 'input'>('ask');
  const [website, setWebsite] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user?.userType === 'agency' && !user?.agencyWebsite && !user?.skippedWebsitePrompt) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [isAuthenticated, user]);

  const handleSkip = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/user/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skippedWebsitePrompt: true }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update settings');

      setUser(data.user);
      setIsOpen(false);
    } catch (err: any) {
      addToast(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

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
            onClick={handleSkip}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-lg glass border-2 border-primary/20 rounded-[2.5rem] p-8 sm:p-10 relative z-10 shadow-[0_0_50px_rgba(var(--primary-rgb),0.2)]"
          >
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-2 rotate-3 transition-transform">
                <Globe className="text-primary" size={40} />
              </div>
              
              <AnimatePresence mode="wait">
                {step === 'ask' ? (
                  <motion.div
                    key="step-ask"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="space-y-2">
                      <h2 className="text-3xl font-black tracking-tight flex items-center justify-center gap-2">
                        Do you have a website? <Sparkles className="text-amber-500 fill-amber-500/20" size={24} />
                      </h2>
                      <p className="text-[var(--text-muted)] text-lg">
                        Adding your agency website or portfolio makes your command center look more professional.
                      </p>
                    </div>

                    <div className="flex flex-col gap-3">
                      <button
                        onClick={() => setStep('input')}
                        className="w-full h-16 bg-primary text-white font-black rounded-2xl flex items-center justify-center gap-3 hover:shadow-2xl hover:shadow-primary/30 transition-all active:scale-[0.98] text-lg group"
                      >
                        Yes, I have one
                        <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
                      </button>
                      <button
                        onClick={handleSkip}
                        disabled={isSubmitting}
                        className="w-full h-16 bg-white/5 border border-white/10 text-white/60 font-bold rounded-2xl flex items-center justify-center gap-3 hover:bg-white/10 transition-all active:scale-[0.98] text-lg"
                      >
                        {isSubmitting ? <Loader2 className="animate-spin" /> : "Maybe later / No"}
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="step-input"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="space-y-2">
                      <h2 className="text-3xl font-black tracking-tight">Enter Your Link</h2>
                      <p className="text-[var(--text-muted)] text-lg">
                        Paste your agency website or portfolio URL below.
                      </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6 pt-4 text-left">
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-widest opacity-40 px-2">Agency Website / Portfolio</label>
                        <div className="relative group">
                          <Globe className="absolute left-5 top-1/2 -translate-y-1/2 text-primary opacity-30 group-focus-within:opacity-100 transition-opacity" size={20} />
                          <input
                            autoFocus
                            type="url"
                            placeholder="https://yourcreativeagency.com"
                            value={website}
                            onChange={(e) => setWebsite(e.target.value)}
                            className="w-full bg-[var(--background)]/50 border-2 border-[var(--border)] group-hover:border-primary/20 rounded-2xl pl-14 pr-6 py-5 text-lg focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/40 transition-all placeholder:opacity-30"
                            required
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-3">
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full h-16 bg-primary text-white font-black rounded-2xl flex items-center justify-center gap-3 hover:shadow-2xl hover:shadow-primary/30 transition-all active:scale-[0.98] disabled:opacity-50 text-lg group"
                        >
                          {isSubmitting ? (
                            <Loader2 className="animate-spin" />
                          ) : (
                            <>
                              Save Link
                              <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => setStep('ask')}
                          className="text-xs font-bold uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity underline decoration-dotted underline-offset-4"
                        >
                          Go Back
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
