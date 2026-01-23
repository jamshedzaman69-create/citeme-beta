import { useState } from 'react';
import { FileText, LogOut } from 'lucide-react';
import DocumentList from './DocumentList';
import DocumentEditor from './DocumentEditor';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth
import { Link } from 'react-router-dom';
import { Settings, CreditCard } from 'lucide-react';


export default function Dashboard() {
  const { signOut } = useAuth(); // Access the signOut function
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen bg-[#fcfcfc] overflow-hidden relative">
      {/* Hover Zone - 40px trigger area */}
      <div
        className="fixed left-0 top-0 h-full w-10 z-40"
        onMouseEnter={() => setSidebarOpen(true)}
      />

      {/* Hidden Sidebar */}
      <aside
  className={`fixed left-0 top-0 h-full w-80 bg-white shadow-2xl z-50 transition-transform duration-500 ease-out flex flex-col ${
    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
  }`}
  style={{
    transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
    transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
  }}
  onMouseLeave={() => setSidebarOpen(false)}
>
  {/* 1. TOP SECTION: Document List */}
  <div className="flex-1 overflow-y-auto">
    <DocumentList
      selectedDocumentId={selectedDocumentId}
      onSelectDocument={(id) => {
        setSelectedDocumentId(id);
        setSidebarOpen(false);
      }}
      onDocumentCreated={(id) => {
        setSelectedDocumentId(id);
        setSidebarOpen(false);
      }}
    />
  </div>

  {/* 2. BOTTOM SECTION: Account, Billing & Sign Out */}
  <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-1">
    <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
      Account
    </p>

    {/* Link to Settings Page */}
    <Link
      to="/settings"
      className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-white hover:text-slate-900 rounded-lg transition-colors group shadow-sm border border-transparent hover:border-slate-200"
    >
      <Settings className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
      <span className="text-sm font-medium">Settings</span>
    </Link>

    {/* Link to Stripe Portal */}
    <a
      href="https://billing.stripe.com/p/login/aEU5mD3ew2Ugaha9AA"
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-white hover:text-slate-900 rounded-lg transition-colors group shadow-sm border border-transparent hover:border-slate-200"
    >
      <CreditCard className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
      <span className="text-sm font-medium">Manage Billing</span>
    </a>

    {/* Sign Out Button */}
    <button
      onClick={() => signOut()}
      className="flex items-center gap-3 w-full px-3 py-2 mt-4 text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
    >
      <LogOut className="w-4 h-4" />
      Sign Out
    </button>
  </div>
</aside>

      {/* Main Content */}
      <main className="h-full overflow-auto">
        {selectedDocumentId ? (
          <DocumentEditor key={selectedDocumentId} documentId={selectedDocumentId} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h2 className="text-xl font-light text-slate-600 mb-2">
                Select a document
              </h2>
              <p className="text-slate-400 font-light">
                Hover over the left edge to open documents
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
