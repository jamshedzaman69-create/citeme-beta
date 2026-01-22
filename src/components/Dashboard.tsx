import { useState } from 'react';
import { FileText, LogOut } from 'lucide-react';
import DocumentList from './DocumentList';
import DocumentEditor from './DocumentEditor';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth


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
        className={`fixed left-0 top-0 h-full w-80 bg-white/60 backdrop-blur-md shadow-2xl z-50 transition-transform duration-500 ease-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
        onMouseLeave={() => setSidebarOpen(false)}
      >
        <div className="p-4 border-t border-slate-200">
          <button
            onClick={() => signOut()}
            className="flex items-center gap-2 w-full px-4 py-2 text-sm font-light text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-md transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
        
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
