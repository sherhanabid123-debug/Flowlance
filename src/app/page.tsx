'use client';
import { LandingNavbar } from '@/components/landing/LandingNavbar';
import Link from 'next/link';
import { HeroSection } from '@/components/landing/HeroSection';
import { ProblemSection } from '@/components/landing/ProblemSection';
import { SolutionSection } from '@/components/landing/SolutionSection';
import { FeatureGrid } from '@/components/landing/FeatureGrid';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { SocialProof } from '@/components/landing/SocialProof';
import { FinalCTA } from '@/components/landing/FinalCTA';

export default function Home() {
  return (
    <div className="landing-theme min-h-screen relative selection:bg-[var(--brass)] selection:text-[var(--ink)]">
      <LandingNavbar />
      
      <main className="relative z-10 flex flex-col">
        <HeroSection />
        <ProblemSection />
        <SolutionSection />
        <FeatureGrid />
        <HowItWorks />
        <SocialProof />
        <FinalCTA />
      </main>

      <footer className="py-10 relative z-10 flex flex-col items-center gap-6 border-t border-[var(--rule)] sm:flex-row sm:justify-between sm:px-20 px-6">
         <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 border border-[var(--brass)] rounded-sm flex items-center justify-center text-[var(--brass)] font-display font-semibold text-xs cursor-pointer" onClick={() => window.location.href = '/'}>F</div>
            <div className="flex flex-col leading-tight">
               <span className="font-display tracking-tight opacity-70 leading-none text-sm">Flowlance</span>
               <span className="text-[8px] font-mono opacity-40 tracking-wider uppercase">by Scalera</span>
            </div>
         </div>
         <p className="text-xs opacity-40 font-mono">© {new Date().getFullYear()} Flowlance. A CRM for freelancers and small agencies.</p>
         <div className="flex items-center gap-6 text-xs font-mono opacity-40">
            <Link href="/privacy" className="hover:opacity-100 transition-opacity">Privacy</Link>
            <Link href="/terms" className="hover:opacity-100 transition-opacity">Terms</Link>
         </div>
      </footer>
    </div>
  );
}
