// src/components/PrivacyPolicy.tsx
import { ArrowLeft, Lock, Eye, Database, Globe } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <a href="/" className="inline-flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-widest mb-12 hover:gap-3 transition-all">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </a>
        
        <h1 className="text-4xl font-extrabold mb-2 tracking-tight text-slate-900">Privacy Policy</h1>
        <p className="text-slate-500 mb-12 font-medium">Effective Date: January 2026</p>

        <div className="space-y-12 text-slate-600 leading-relaxed">
          {/* Introduction */}
          <section>
            <p>
              At CiteMe, we respect your privacy and are committed to protecting your personal data. This policy explains how we handle your information when you use our academic AI tools and your rights under the General Data Protection Regulation (GDPR).
            </p>
          </section>

          {/* 1. Data Collection */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2 tracking-tight">
              <Database className="w-5 h-5 text-blue-600" /> 1. Information We Collect
            </h2>
            <div className="space-y-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <p className="font-semibold text-slate-900 text-sm uppercase tracking-wider">A. Information you provide</p>
              <ul className="list-disc pl-5 space-y-2 text-sm">
                <li><strong>Account Identifiers:</strong> Your name and email address provided via Supabase Auth.</li>
                <li><strong>Document Content:</strong> Text and metadata for the documents you create and edit within the platform.</li>
              </ul>
              
              <p className="font-semibold text-slate-900 text-sm uppercase tracking-wider pt-4">B. Automated Collection</p>
              <ul className="list-disc pl-5 space-y-2 text-sm">
                <li><strong>Usage Logs:</strong> Interactions with our AI assistants to improve model accuracy.</li>
                <li><strong>Payment Metadata:</strong> Transaction status and subscription tier via Stripe (we never store raw credit card numbers).</li>
              </ul>
            </div>
          </section>

          {/* 2. Data Usage */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-600" /> 2. How We Use Your Data
            </h2>
            <p>We process your data only for legitimate business purposes, including:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Providing and maintaining the CiteMe academic editor.</li>
              <li>Processing your subscription payments via Stripe.</li>
              <li>Analyzing usage patterns to improve our AI citation algorithms.</li>
              <li>Communicating critical account updates and security alerts.</li>
            </ul>
          </section>

          {/* 3. Security & Retention */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-blue-600" /> 3. Data Security & Retention
            </h2>
            <p>
              We utilize enterprise-grade encryption provided by Supabase (PostgreSQL) to protect your data at rest and in transit. Your data is retained only as long as your account is active. If you delete your account, all associated documents and personal identifiers are purged from our primary databases within 30 days.
            </p>
          </section>

          {/* 4. Your GDPR Rights */}
          <section className="bg-blue-900 text-white p-8 rounded-3xl shadow-xl shadow-blue-200/50">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-400" /> 4. Your Rights Under GDPR
            </h2>
            <p className="mb-6 opacity-90">As a user, you have the following rights regarding your personal data:</p>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                <span className="font-bold block mb-1">Right to Access</span>
                Request a copy of all data we hold about you.
              </div>
              <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                <span className="font-bold block mb-1">Right to Erasure</span>
                Request that we delete your personal information permanently.
              </div>
              <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                <span className="font-bold block mb-1">Data Portability</span>
                Export your documents and citations in structured formats.
              </div>
              <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                <span className="font-bold block mb-1">Right to Rectify</span>
                Correct any inaccurate personal data in your profile.
              </div>
            </div>
          </section>

          {/* Contact Section */}
          <section className="pt-12 border-t border-slate-200">
            <p className="text-center font-medium">
              To exercise any of these rights, please contact our Data Protection Officer at:
              <br />
              <a href="mailto:jamshedzaman16@gmail.com" className="text-blue-600 font-bold hover:underline">jamshedzaman16@gmail.com</a>
            </p>
          </section>
        </div>

        <footer className="mt-20 py-8 text-center border-t border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em]">
            &copy; 2026 CiteMe Privacy Office • Secured by SSL Encryption
          </p>
        </footer>
      </div>
    </div>
  );
}