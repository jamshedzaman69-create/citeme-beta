import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useParams } from 'react-router-dom';

// Components
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import DocumentEditor from './components/DocumentEditor';
import SettingsPage from './components/SettingsPage';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* If not logged in, all paths lead to Landing Page (except auth logic inside it) */}
        {!user ? (
          <Route path="*" element={<LandingPage />} />
        ) : (
          <>
            {/* Authenticated Routes */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/document/:id" element={<DocumentEditorWrapper />} />
            
            {/* Redirect logged-in users from root to dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </>
        )}
      </Routes>
    </Router>
  );
}

// Helper to pass the URL ID to the editor
function DocumentEditorWrapper() {
  const { id } = useParams();
  return <DocumentEditor documentId={id || ''} />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}