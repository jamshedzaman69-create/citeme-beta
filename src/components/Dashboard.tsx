import { useState, useEffect } from 'react';
import { FileText, LogOut, Settings, CreditCard, Crown, Lock, Sparkles } from 'lucide-react';
import DocumentList from './DocumentList';
import DocumentEditor from './DocumentEditor';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { PricingSection } from './PricingSection';

export default function Dashboard() {
  const { signOut, hasPremium, loading: authLoading } = useAuth();
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [showUnlock, setShowUnlock] = useState(false);

  // CRITICAL: Handle immediate redirect to Stripe if a plan was selected on Landing Page
  useEffect(() => {
    const handleCheckAccess = async () => {
      if (authLoading) return;

      const pendingPriceId = localStorage.getItem('pending_stripe_price');
      
      // If they picked a plan but aren't premium yet, force the redirect immediately
      if (pendingPriceId && !hasPremium) {
        setIsRedirecting(true);
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          localStorage.removeItem('pending_stripe_price');
          try {
            const { data } = await supabase.functions.invoke('create-checkout', {
              body: { 
                priceId: pendingPriceId, 
                userId: user.id, 
                userEmail: user.email 
              }
            });

            if (data?.url) {
              window.location.href = data.url;
              return; // Exit so we don't turn off the redirecting state
            }
          } catch (err) {
            console.error('Checkout redirect failed:', err);
          }
        }
        setIsRedirecting(false);
      }
      
      // If no pending price but also not premium, prepare the "Unlock" view
      if (!hasPremium && !pendingPriceId) {
        setShowUnlock(true);
      }
    };

    handleCheckAccess();
  }, [hasPremium, authLoading]);

  // Reset unlock view if premium status is verified as active
  useEffect(() => {
    if (hasPremium) {
      setShowUnlock(false);
    }
  }, [hasPremium]);

  // Loading or Redirecting States
  if (authLoading || isRedirecting) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#F8FAFC]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-slate-500 text-sm font-bold uppercase tracking-[0.2em] animate-pulse">
          Securing Workspace...
        </p>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#F8FAFC] overflow-hidden relative font-sans">
      {/* Sidebar Trigger Zone */}
      <div
        className="fixed left-0 top-0 h-full w-10 z-40"
        onMouseEnter={() => setSidebarOpen(true)}
      />

      {/* Sliding Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full w-80 bg-white shadow-2xl z-50 transition-transform duration-500 ease-out flex flex-col ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        onMouseLeave={() => setSidebarOpen(false)}
      >
        <div className="flex-1 overflow-y-auto">
          <DocumentList
            selectedDocumentId={selectedDocumentId}
            onSelectDocument={(id) => {
              // Even if they try to select a doc, if not premium, force unlock
              if (!hasPremium) {
                setShowUnlock(true);
              } else {
                setSelectedDocumentId(id);
                setShowUnlock(false);
              }
              setSidebarOpen(false);
            }}
            onDocumentCreated={(id) => {
              if (!hasPremium) {
                setShowUnlock(true);
                setSidebarOpen(false);
              } else {
                setSelectedDocumentId(id);
                setSidebarOpen(false);
              }
            }}
          />
        </div>

        {/* Account & Billing */}
        <div className="p-6 border-t border-slate-100 bg-slate-50/50 space-y-2">
          <div className="mb-4">
            {hasPremium ? (
              <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-100 rounded-xl">
                <Crown className="w-4 h-4 text-blue-600" />
                <span className="text-[10px] font-black text-blue-700 uppercase tracking-widest">
                  Premium Active
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-xl">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                  Free Plan
                </span>
              </div>
            )}
          </div>

          <Link
            to="/settings"
            className="flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-white hover:text-slate-900 rounded-xl transition-all group border border-transparent hover:border-slate-200 shadow-sm sm:shadow-none hover:shadow-sm"
          >
            <Settings className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
            <span className="text-sm font-bold">Settings</span>
          </Link>

          {hasPremium && (
             <a
              href="https://billing.stripe.com/p/login/aEU5mD3ew2Ugaha9AA"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-3 py-2.5 text-slate-600 hover:bg-white hover:text-slate-900 rounded-xl transition-all group border border-transparent hover:border-slate-200 shadow-sm sm:shadow-none hover:shadow-sm"
            >
              <CreditCard className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
              <span className="text-sm font-bold">Billing</span>
            </a>
          )}

          <button
            onClick={() => signOut()}
            className="flex items-center gap-3 w-full px-3 py-2.5 mt-2 text-sm font-bold text-slate-400 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="h-full overflow-auto">
        {showUnlock ? (
          <div className="min-h-full flex items-center justify-center py-12 px-6 bg-[#F8FAFC]">
            <div className="w-full max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 border border-blue-100 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                  <Sparkles className="w-3 h-3" /> Premium Feature
                </div>
                <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
                  Elevate your research.
                </h2>
                <p className="text-slate-500 text-sm max-w-md mx-auto font-medium">
                  Unlock unlimited documents and AI-powered academic tools with a 3-day trial.
                </p>
              </div>
              
              <PricingSection />
              
              <button 
                onClick={() => setShowUnlock(false)}
                className="mt-12 block w-full text-center text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 hover:text-slate-600 transition-colors underline underline-offset-8"
              >
                Return to my files
              </button>
            </div>
          </div>
        ) : selectedDocumentId && hasPremium ? (
          <DocumentEditor key={selectedDocumentId} documentId={selectedDocumentId} />
        ) : (
          <div className="flex flex-col items-center justify-center h-full space-y-6">
            <div className="w-24 h-24 bg-white rounded-[2rem] shadow-xl shadow-blue-900/5 flex items-center justify-center border border-slate-100">
              <FileText className="w-10 h-10 text-slate-200" />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-bold text-slate-900">Choose a document</h2>
              <p className="text-slate-400 text-sm font-medium mt-1">
                Hover over the left edge to browse your workspace.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}