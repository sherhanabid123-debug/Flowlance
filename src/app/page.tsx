'use client';
import { LandingNavbar } from '@/components/landing/LandingNavbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { ProblemSection } from '@/components/landing/ProblemSection';
import { SolutionSection } from '@/components/landing/SolutionSection';
import { FeatureGrid } from '@/components/landing/FeatureGrid';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { SocialProof } from '@/components/landing/SocialProof';
import { FinalCTA } from '@/components/landing/FinalCTA';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#050505] text-white relative selection:bg-primary selection:text-white dark">
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

      {/* Modern Grid Background */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-10" 
           style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '40px 40px' }} 
      />

      <footer className="py-12 relative z-10 flex flex-col items-center gap-6 glass sm:flex-row sm:justify-between sm:px-20">
         <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xs cursor-pointer" onClick={() => window.location.href = '/'}>F</div>
            <div className="flex flex-col leading-tight">
               <span className="font-bold tracking-tight opacity-70 leading-none">Flowlance</span>
               <span className="text-[8px] font-medium opacity-30 tracking-wider uppercase">by Scalera</span>
            </div>
         </div>
         <p className="text-xs opacity-40 font-medium">© {new Date().getFullYear()} Flowlance. Built for the future of work.</p>
         <div className="flex items-center gap-6 text-xs font-bold opacity-40">
            <button className="hover:opacity-100 transition-opacity">Privacy</button>
            <button className="hover:opacity-100 transition-opacity">Terms</button>
            <button className="hover:opacity-100 transition-opacity">Twitter</button>
         </div>
      </footer>
    </div>
  );
}
