import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-primary selection:text-white dark">
      <div className="max-w-3xl mx-auto px-6 py-20">
        <Link href="/" className="inline-flex items-center gap-2 text-sm opacity-50 hover:opacity-100 transition-opacity mb-10">
          <ArrowLeft size={16} />
          Back to Home
        </Link>
        
        <div className="space-y-8 glass border p-10 rounded-[32px]">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">Privacy Policy</h1>
            <p className="text-sm opacity-50 font-medium tracking-widest uppercase">Last updated: 04/04/26</p>
          </div>

          <div className="prose prose-invert max-w-none space-y-6 text-sm leading-relaxed opacity-80">
            <p>Flowlance respects your privacy and is committed to protecting your personal data.</p>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white">1. Information We Collect</h2>
              <p>We may collect the following information:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Name and email address (during signup)</li>
                <li>Account and workspace data (clients, projects, notes)</li>
                <li>Usage data (how you interact with the app)</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white">2. How We Use Your Information</h2>
              <p>We use your data to:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Provide and improve our services</li>
                <li>Manage your account</li>
                <li>Enable features like client tracking and follow ups</li>
                <li>Communicate important updates</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white">3. Data Storage</h2>
              <p>Your data is securely stored in our database. We take reasonable measures to protect it from unauthorized access.</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white">4. Data Sharing</h2>
              <p>We do not sell, trade, or rent your personal information to third parties.</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white">5. Cookies & Analytics</h2>
              <p>We may use cookies or analytics tools to understand user behavior and improve the product.</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white">6. Your Rights</h2>
              <p>You can:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Access your data</li>
                <li>Request deletion of your account and data</li>
              </ul>
              <p>Contact us at: <span className="text-primary font-bold">contact.scalerastudio@gmail.com</span></p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white">7. Data Retention</h2>
              <p>We retain your data as long as your account is active, so you can access it anytime</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white">8. Changes to Policy</h2>
              <p>We may update this policy. Changes will be posted on this page.</p>
            </section>

            <section className="space-y-3">
              <h2 className="text-xl font-bold text-white">9. Contact</h2>
              <p>For any questions, contact: <span className="text-primary font-bold">contact.scalerastudio@gmail.com</span></p>
            </section>

            <div className="pt-10 border-t border-white/5 opacity-40 italic text-xs">
              By using Flowlance, you agree to this Privacy Policy.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
