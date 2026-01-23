import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { 
  CreditCard, 
  User, 
  ArrowLeft, 
  ShieldCheck, 
  LogOut,
  Mail,
  Crown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SettingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // The direct Stripe link you provided
  const STRIPE_PORTAL_URL = "https://billing.stripe.com/p/login/aEU5mD3ew2Ugaha9AA";

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          <h1 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Settings</h1>
          <div className="w-20" /> {/* Balance spacer */}
        </div>
      </nav>

      <main className="max-w-3xl mx-auto w-full py-12 px-6 flex-1">
        <div className="space-y-8">
          
          {/* User Profile Card */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-blue-100">
                {user?.email?.[0].toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Personal Account</h2>
                <div className="flex items-center gap-2 text-slate-500 text-sm mt-1">
                  <Mail className="w-3.5 h-3.5" />
                  {user?.email}
                </div>
              </div>
            </div>
            
            <div className="p-6 bg-slate-50/50 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">User ID</label>
                <p className="text-xs font-mono text-slate-600 mt-1 truncate">{user?.id}</p>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Login Method</label>
                <p className="text-xs text-slate-600 mt-1">Email & Password</p>
              </div>
            </div>
          </section>

          {/* Billing & Subscription Card */}
          <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-50 rounded-lg">
                  <Crown className="w-5 h-5 text-amber-600" />
                </div>
                <h2 className="font-semibold text-slate-900">Subscription</h2>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-bold uppercase rounded-full tracking-wider">
                Active Plan
              </span>
            </div>
            
            <div className="p-6">
              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                Manage your subscription, view billing history, and update payment methods through our secure Stripe portal.
              </p>
              
              <a 
                href={STRIPE_PORTAL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all text-sm font-medium shadow-md shadow-slate-200"
              >
                <CreditCard className="w-4 h-4" />
                Manage Billing & Invoices
              </a>
            </div>
          </section>

          {/* Security & Actions */}
          <section className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Account Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-white border border-slate-200 rounded-xl flex items-center justify-between hover:border-slate-300 transition-colors">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-slate-400" />
                  <span className="text-sm font-medium text-slate-700">Security Privacy</span>
                </div>
              </div>
              
              <button 
                onClick={handleSignOut}
                className="p-4 bg-white border border-red-100 rounded-xl flex items-center justify-between hover:bg-red-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <LogOut className="w-5 h-5 text-red-400 group-hover:text-red-600" />
                  <span className="text-sm font-medium text-red-600">Sign Out</span>
                </div>
              </button>
            </div>
          </section>

        </div>
      </main>

      <footer className="py-8 text-center">
        <p className="text-xs text-slate-400">© 2026 CiteMe Research Labs. All rights reserved.</p>
      </footer>
    </div>
  );
}