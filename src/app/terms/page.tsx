import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-primary selection:text-white dark">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <Link href="/" className="inline-flex items-center gap-2 text-sm opacity-50 hover:opacity-100 transition-opacity mb-10">
          <ArrowLeft size={16} />
          Back to Home
        </Link>
        
        <div className="space-y-8 glass border p-10 rounded-[32px]">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">Terms of Service</h1>
            <p className="text-sm opacity-50 font-medium tracking-widest uppercase">Last updated: 04/04/26</p>
          </div>

          <div className="prose prose-invert max-w-none space-y-6 text-sm leading-relaxed opacity-80">
            <p>Welcome to Flowlance. By using our service, you agree to the following terms.</p>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white">1. Use of Service</h2>
              <p>Flowlance provides tools for managing clients, projects, and follow-ups. You agree to use the service only for lawful purposes.</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white">2. Account Responsibility</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>You are responsible for maintaining your account credentials</li>
                <li>You are responsible for all activity under your account</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white">3. User Data</h2>
              <p>You retain ownership of the data you enter into Flowlance. We are not responsible for loss of data due to user actions, though we strive to keep data secure.</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white">4. Acceptable Use</h2>
              <p>You agree NOT to:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Use the service for illegal activities</li>
                <li>Attempt to hack, disrupt, or misuse the platform</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white">5. Service Availability</h2>
              <p>We aim to provide a reliable service but do not guarantee uninterrupted availability.</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white">6. Termination</h2>
              <p>We reserve the right to suspend or terminate accounts that violate these terms.</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white">7. Limitation of Liability</h2>
              <p>Flowlance is provided "as is". We are not liable for:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Business losses</li>
                <li>Missed opportunities</li>
                <li>Data related issues beyond our control</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white">8. Changes to Terms</h2>
              <p>We may update these terms. Continued use means you accept the updated terms.</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white">9. Contact</h2>
              <p>For any questions, contact: <span className="text-primary font-bold">contact.scalerastudio@gmail.com</span></p>
            </section>

            <div className="pt-10 border-t border-white/5 opacity-40 italic text-xs">
              By using Flowlance, you agree to these Terms of Service.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
