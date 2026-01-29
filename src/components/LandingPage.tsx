import { useState } from 'react';
import { Quote, Zap, Sparkles, ArrowRight, GraduationCap, Star, CheckCircle2, ShieldCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Auth from './Auth';
import { PricingCard } from './PricingCard';
import { TestimonialCard } from './TestimonialCard';

export default function LandingPage() {
  const [showAuth, setShowAuth] = useState(false);
  const [initialAuthMode, setInitialAuthMode] = useState<'signin' | 'signup'>('signup');
  const [loading, setLoading] = useState(false);

  const WEEKLY_ID = 'price_1Rps0cL8ugzqmcpsuB2b156s';
  const MONTHLY_ID = 'price_1Rps11L8ugzqmcpsJsXf1PB2';

  const openAuth = (mode: 'signin' | 'signup', priceId?: string) => {
    if (priceId) localStorage.setItem('pending_stripe_price', priceId);
    setInitialAuthMode(mode);
    setShowAuth(true);
  };

  const handleUpgradeFromPricing = async (priceId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      openAuth('signup', priceId);
      return;
    }
    setLoading(true);
    try {
      const { data } = await supabase.functions.invoke('create-checkout', { 
        body: { priceId, userId: user.id, userEmail: user.email } 
      });
      if (data?.url) window.location.href = data.url;
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  if (showAuth) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 relative">
        <button 
          onClick={() => setShowAuth(false)} 
          className="absolute top-8 left-8 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 hover:text-blue-600 flex items-center gap-2 transition-colors"
        >
          <ArrowRight className="w-4 h-4 rotate-180" /> Back to Home
        </button>
        <Auth initialMode={initialAuthMode} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-blue-100">
      {/* Navigation */}
      <nav className="h-20 border-b border-slate-200/60 sticky top-0 bg-white/80 backdrop-blur-xl z-50 px-8">
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              <Quote className="w-5 h-5 text-white fill-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">CiteMe</span>
          </div>
          <div className="flex items-center gap-8">
          <a 
           href="mailto:jamshedzaman16@gmail.com"
          className="text-gray-600 hover:text-indigo-600 font-medium transition-colors text-sm"
           >
         Contact Us
         </a>
            <button 
              onClick={() => openAuth('signin')} 
              className="text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors"
            >
              Sign In
            </button>
            <button 
              onClick={() => openAuth('signup', WEEKLY_ID)} 
              className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-blue-600 transition-all shadow-md"
            >
              Start Trial
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="pt-28 pb-32 text-center px-6">
        <div className="max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full text-[10px] font-bold uppercase tracking-widest text-blue-600 mb-8">
            <Zap className="w-3 h-3 fill-blue-600" /> Professional Research AI
          </div>
          <h1 className="text-6xl md:text-[84px] font-extrabold tracking-tight leading-[0.95] mb-8 text-slate-900">
            Write research papers <br/><span className="text-blue-600">faster than ever.</span>
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
            Generate citations, structure your thesis, and write with academic precision. 
            The intelligent partner for modern scholars.
          </p>
          <div className="flex flex-col items-center gap-6">
            <button 
              onClick={() => openAuth('signup', WEEKLY_ID)} 
              className="group px-12 py-5 bg-blue-600 text-white rounded-2xl text-lg font-bold shadow-2xl shadow-blue-200 hover:bg-blue-700 transition-all transform hover:-translate-y-1 flex items-center gap-3"
            >
              Start Your 3-Day Trial
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <div className="flex items-center gap-4 text-slate-400">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest">
                <ShieldCheck className="w-4 h-4 text-green-500" /> Secure Checkout
              </div>
              <div className="w-1 h-1 bg-slate-200 rounded-full" />
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest">
                <CheckCircle2 className="w-4 h-4 text-green-500" /> Instant Access
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* University Logo Cloud */}
      <section className="py-16 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 mb-10">Trusted at World-Class Institutions</p>
          <div className="flex flex-wrap justify-center gap-12 md:gap-24 opacity-30 grayscale contrast-125 saturate-0">
             <div className="flex items-center gap-2 font-bold text-lg tracking-tighter"><GraduationCap className="w-5 h-5"/> STANFORD</div>
             <div className="flex items-center gap-2 font-bold text-lg tracking-tighter"><GraduationCap className="w-5 h-5"/> HARVARD</div>
             <div className="flex items-center gap-2 font-bold text-lg tracking-tighter"><GraduationCap className="w-5 h-5"/> OXFORD</div>
             <div className="flex items-center gap-2 font-bold text-lg tracking-tighter"><GraduationCap className="w-5 h-5"/> MIT</div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-32 px-6 bg-[#F8FAFC]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-4">Simple, transparent pricing</h2>
            <p className="text-slate-500 font-medium">Try all features risk-free for 3 days.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <PricingCard 
              name="Weekly" 
              price="2.50" 
              period="week" 
              features={["3-Day Trial", "AI Access", "Unlimited Documents", "Citations Generator"]} 
              onSelect={() => handleUpgradeFromPricing(WEEKLY_ID)} 
            />
            <PricingCard 
              name="Monthly" 
              price="7.99" 
              period="month" 
              popular 
              features={["3-Day Trial", "Everything in Weekly", "Advanced AI features", "Priority Support"]} 
              onSelect={() => handleUpgradeFromPricing(MONTHLY_ID)} 
            />
          </div>
        </div>
      </section>

      {/* Testimonials / Wall of Love */}
      <section className="py-32 bg-slate-900 text-white px-8 rounded-[3rem] mx-4 mb-4">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-12">
          <div className="space-y-4">
            <div className="flex text-blue-400 gap-1"><Star className="w-4 h-4 fill-blue-400" /><Star className="w-4 h-4 fill-blue-400" /></div>
            <p className="text-lg font-medium leading-relaxed italic">"CiteMe has returned the joy of writing to my doctoral process. The citations are perfect every time."</p>
            <div className="text-xs font-bold uppercase tracking-widest text-slate-400">— Dr. Aris V., Researcher</div>
          </div>
          <div className="space-y-4">
            <div className="flex text-blue-400 gap-1"><Star className="w-4 h-4 fill-blue-400" /><Star className="w-4 h-4 fill-blue-400" /></div>
            <p className="text-lg font-medium leading-relaxed italic">"The drafting tool helps me get over blank-page syndrome in minutes. It's essential for my workflow."</p>
            <div className="text-xs font-bold uppercase tracking-widest text-slate-400">— Jun P., Grad Student</div>
          </div>
          <div className="space-y-4">
            <div className="flex text-blue-400 gap-1"><Star className="w-4 h-4 fill-blue-400" /><Star className="w-4 h-4 fill-blue-400" /></div>
            <p className="text-lg font-medium leading-relaxed italic">"I've recommended CiteMe to my entire department. It actually respects academic integrity rules."</p>
            <div className="text-xs font-bold uppercase tracking-widest text-slate-400">— Sarah K., PhD Candidate</div>
          </div>
        </div>
      </section>

{/* Replace existing footer with this */}
<footer className="py-20 bg-white border-t border-slate-100">
  <div className="max-w-7xl mx-auto px-6">
    <div className="grid md:grid-cols-4 gap-12 mb-16 text-left">
      <div className="col-span-2">
        <div className="flex items-center gap-2.5 mb-6">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-md">
            <Quote className="w-4 h-4 text-white fill-white" />
          </div>
          <span className="text-lg font-bold tracking-tight">CiteMe</span>
        </div>
        <p className="text-slate-500 max-w-xs leading-relaxed italic">
          Empowering scholars with AI-driven academic precision and integrity.
        </p>
      </div>
      <div>
        <h4 className="font-bold mb-6 text-sm uppercase tracking-widest text-slate-900">Legal</h4>
        <ul className="space-y-4 text-sm text-slate-500 font-medium">
          <li><a href="/terms" className="hover:text-blue-600 transition-colors">Terms of Service</a></li>
          <li><a href="/privacy" className="hover:text-blue-600 transition-colors">Privacy Policy</a></li>
          <li><a href="/terms#refunds" className="hover:text-blue-600 transition-colors">Refund Policy</a></li>
        </ul>
      </div>
      <div>
        <h4 className="font-bold mb-6 text-sm uppercase tracking-widest text-slate-900">Support</h4>
        <ul className="space-y-4 text-sm text-slate-500 font-medium">
          <li><a href="mailto:jamshedzaman16@gmail.com" className="hover:text-blue-600 transition-colors text-xs font-bold uppercase tracking-widest">jamshedzaman16@gmail.com</a></li>
        </ul>
      </div>
    </div>
    <div className="pt-8 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em]">&copy; 2026 CiteMe. All rights reserved.</p>
      <div className="flex items-center gap-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        <span>GDPR Compliant</span>
        <div className="w-1 h-1 bg-slate-200 rounded-full" />
        <span>SSL Secured</span>
      </div>
    </div>
  </div>
</footer>

      {loading && (
        <div className="fixed inset-0 bg-white/60 backdrop-blur-md flex items-center justify-center z-[100]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  );
}