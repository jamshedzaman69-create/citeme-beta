// src/components/TermsOfService.tsx
import { ArrowLeft, ShieldCheck, Scale, AlertCircle } from 'lucide-react';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <a href="/" className="inline-flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-widest mb-12 hover:gap-3 transition-all">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </a>
        
        <h1 className="text-4xl font-extrabold mb-2 tracking-tight text-slate-900">Terms of Service</h1>
        <br></br>

        <div className="space-y-12 text-slate-600 leading-relaxed">
          {/* 1. Acceptance of Terms */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Scale className="w-5 h-5 text-blue-600" /> 1. Acceptance of Agreement
            </h2>
            <p>
              By accessing or using CiteMe, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services. We reserve the right to modify these terms at any time, and your continued use of the platform constitutes acceptance of those changes.
            </p>
          </section>

          {/* 2. Refund Policy - Your Specific Request */}
          <section id="refunds" className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-600" /> 2. Subscription and Refund Policy
            </h2>
            <div className="space-y-4">
              <p>At CiteMe, we stand by the quality of our academic tools. Our refund policy is strictly governed by the following rules:</p>
              <ul className="list-disc pl-5 space-y-3">
                <li><strong>First-Time Payments:</strong> You are eligible for a full refund within the first 7 days of your initial purchase if you are unsatisfied with the service.</li>
                <li><strong>Renewals:</strong> Subsequent subscription renewals are processed automatically and are non-refundable.</li>
                <li><strong>Usage Threshold:</strong> To prevent abuse of our AI resources, refunds may be denied if substantial usage (defined as generating more than 5 documents) has occurred during the 7-day window.</li>
                <li><strong>Cancellation:</strong> You may cancel your subscription at any time via the Settings page to prevent future billing.</li>
              </ul>
            </div>
          </section>

          {/* 3. Academic Integrity */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600" /> 3. Academic Integrity & Proper Use
            </h2>
            <p className="mb-4">
              CiteMe is designed as a research assistant and citation tool. Users are solely responsible for:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Ensuring their work complies with their institution's academic integrity policies.</li>
              <li>Verifying the accuracy of AI-generated citations and content.</li>
              <li>CiteMe does not guarantee 100% accuracy and should be used to assist, not replace, human scholarly judgment.</li>
            </ul>
          </section>

          {/* 4. Prohibited Conduct */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">4. Prohibited Conduct</h2>
            <p>Users agree not to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Attempt to reverse-engineer or scrape the AI models or platform data.</li>
              <li>Use the service to generate harmful, illegal, or plagiarized content.</li>
              <li>Share account credentials with third parties.</li>
            </ul>
          </section>

          {/* 5. Limitation of Liability */}
          <section className="pt-8 border-t border-slate-200">
            <h2 className="text-xl font-bold text-slate-900 mb-4">5. Limitation of Liability</h2>
            <p className="text-sm">
              CiteMe and its owners shall not be liable for any indirect, incidental, or consequential damages resulting from the use or inability to use the service, including but not limited to academic grading outcomes or data loss.
            </p>
          </section>

          {/* 6. Contact */}
          <section className="bg-blue-50 p-6 rounded-xl border border-blue-100">
            <p className="text-sm text-blue-900 font-medium">
              Questions about these Terms? Contact us at: 
              <a href="mailto:jamshedzaman16@gmail.com" className="ml-2 font-bold underline">jamshedzaman16@gmail.com</a>
            </p>
          </section>
        </div>

        <footer className="mt-20 pt-8 border-t border-slate-200 text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em]">
            &copy; 2026 CiteMe
          </p>
        </footer>
      </div>
    </div>
  );
}