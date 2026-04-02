'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/useAuthStore';
import { useToastStore } from '@/store/useToastStore';
import { OnboardingCard } from '@/components/onboarding/OnboardingCard';
import { User, Building2, ArrowRight, Loader2, Sparkles, UserCheck, Zap } from 'lucide-react';

type Step = 'name' | 'type' | 'company' | 'loading';

export default function OnboardingPage() {
  const router = useRouter();
  const { user, setUser, isAuthenticated, isInitialized } = useAuthStore();
  const { addToast } = useToastStore();
  
  const [step, setStep] = useState<Step>('name');
  const [name, setName] = useState('');
  const [type, setType] = useState<'freelancer' | 'agency' | null>(null);
  const [companyName, setCompanyName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already has workspace (only on initial load)
  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.push('/login');
      return;
    }
    if (isInitialized && user?.currentWorkspace && step !== 'loading') {
      router.push('/dashboard');
    }
  }, [user, isInitialized, isAuthenticated, router, step]);

  const handleNextStep = () => {
    if (step === 'name') {
      if (!name.trim()) return addToast('Please enter your name', 'error');
      setStep('type');
    } else if (step === 'type') {
      if (!type) return addToast('Please select a profile type', 'error');
      type === 'agency' ? setStep('company') : submitOnboarding();
    } else if (step === 'company') {
      if (!companyName.trim()) return addToast('Please enter your company name', 'error');
      submitOnboarding();
    }
  };

  const submitOnboarding = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, type, companyName }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to complete onboarding');

      setUser(data.user);
      addToast('Workspace created!', 'success');
      setStep('loading');
      setTimeout(() => router.push('/dashboard'), 1500);
    } catch (err: any) {
      addToast(err.message, 'error');
      setIsSubmitting(false);
    }
  };

  if (!isInitialized) return null;

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse delay-700" />

      <div className="w-full max-w-xl relative z-10">
        <AnimatePresence mode="wait">
          {step === 'name' && (
            <motion.div
              key="step-name"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 scale-110">
                  <Sparkles className="text-primary fill-primary/20" size={32} />
                </div>
                <h1 className="text-4xl font-extrabold tracking-tight">Let's get started.</h1>
                <p className="text-[var(--text-muted)] text-lg">First, what should we call you?</p>
              </div>

              <div className="glass border rounded-[2rem] p-8 shadow-2xl shadow-primary/5">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest opacity-40 px-1">Your Full Name</label>
                    <input
                      autoFocus
                      type="text"
                      placeholder="e.g. John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleNextStep()}
                      className="w-full bg-[var(--background)]/50 border border-[var(--border)] rounded-2xl px-6 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:opacity-30"
                    />
                  </div>
                  <button
                    onClick={handleNextStep}
                    className="w-full h-16 bg-primary text-white font-bold rounded-2xl flex items-center justify-center gap-3 hover:shadow-xl hover:shadow-primary/20 transition-all active:scale-95 text-lg"
                  >
                    Continue
                    <ArrowRight size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'type' && (
            <motion.div
              key="step-type"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center space-y-3">
                <h1 className="text-3xl font-extrabold tracking-tight">Welcome, {name.split(' ')[0]}!</h1>
                <p className="text-[var(--text-muted)]">How will you be using Flowlance?</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <OnboardingCard
                  title="Freelancer"
                  description="Managing my own projects and clients personally."
                  icon={User}
                  selected={type === 'freelancer'}
                  onClick={() => setType('freelancer')}
                />
                <OnboardingCard
                  title="Agency / Company"
                  description="Collaborating with a team to handle bigger accounts."
                  icon={Building2}
                  selected={type === 'agency'}
                  onClick={() => setType('agency')}
                />
              </div>

              <div className="pt-4 flex items-center justify-between gap-4">
                <button onClick={() => setStep('name')} className="text-sm font-bold opacity-40 hover:opacity-100 transition-opacity">Back</button>
                <button
                  onClick={handleNextStep}
                  disabled={!type || isSubmitting}
                  className="px-12 h-14 bg-primary text-white font-bold rounded-2xl flex items-center justify-center gap-3 hover:shadow-xl hover:shadow-primary/20 transition-all active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" /> : (type === 'agency' ? 'Next' : 'Create My Workspace')}
                  <ArrowRight size={20} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 'company' && (
            <motion.div
              key="step-company"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-8"
            >
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Building2 className="text-blue-500" size={32} />
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight">Your Agency Name</h1>
                <p className="text-[var(--text-muted)]">This will be shown on your dashboard and invoices.</p>
              </div>

              <div className="glass border rounded-[2rem] p-8 shadow-2xl">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest opacity-40 px-1">Company / Agency Name</label>
                    <input
                      autoFocus
                      type="text"
                      placeholder="e.g. Creative Flow Studio"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleNextStep()}
                      className="w-full bg-[var(--background)]/50 border border-[var(--border)] rounded-2xl px-6 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                  <div className="flex gap-4">
                    <button onClick={() => setStep('type')} className="h-16 px-6 glass border-[var(--border)] font-bold rounded-2xl hover:bg-primary/5 transition-all">Back</button>
                    <button
                      onClick={handleNextStep}
                      disabled={isSubmitting || !companyName.trim()}
                      className="flex-1 h-16 bg-primary text-white font-bold rounded-2xl flex items-center justify-center gap-3 hover:shadow-xl hover:shadow-primary/20 transition-all active:scale-95 disabled:opacity-50"
                    >
                      {isSubmitting ? <Loader2 className="animate-spin" /> : 'Finalize Setup'}
                      <ArrowRight size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'loading' && (
            <motion.div
              key="step-loading"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-8 py-12"
            >
              <div className="relative w-24 h-24 mx-auto">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 border-4 border-primary/20 border-t-primary rounded-full"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <UserCheck className="text-primary animate-bounce" size={40} />
                </div>
              </div>
              <div className="space-y-3">
                <h2 className="text-3xl font-extrabold tracking-tight">Finishing up...</h2>
                <p className="text-[var(--text-muted)]">Redirecting you to your new command center.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Progress Indicator */}
      <div className="fixed top-8 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {(['name', 'type', 'company'] as Step[]).filter(s => s !== 'loading').map((s) => {
          const steps: Step[] = ['name', 'type', 'company'];
          const currentIndex = steps.indexOf(step as Step);
          const itemIndex = steps.indexOf(s);
          
          if (s === 'company' && type !== 'agency' && step !== 'loading') return null;

          return (
            <div 
              key={s}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                s === step ? 'w-8 bg-primary' : itemIndex < currentIndex ? 'w-2 bg-primary/40' : 'w-2 bg-[var(--border)]'
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}
