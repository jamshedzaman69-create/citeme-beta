import { useEffect } from 'react'; //
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext'; //
import { useParams } from 'react-router-dom'; //
import { supabase } from './lib/supabase'; //

// Components
import LandingPage from './components/LandingPage'; //
import Dashboard from './components/Dashboard'; //
import DocumentEditor from './components/DocumentEditor'; //
import SettingsPage from './components/SettingsPage'; //
import ResetPassword from './components/ResetPassword'; // Add this import

function AppContent() {
  const { user, loading } = useAuth(); //
  const navigate = useNavigate(); //

  // Add the password recovery listener here
  useEffect(() => { //
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => { //
      if (event === 'PASSWORD_RECOVERY') { //
        navigate('/reset-password'); //
      }
    });

    return () => subscription.unsubscribe(); //
  }, [navigate]); //

  if (loading) { //
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      {!user ? ( //
        <Route path="*" element={<LandingPage />} />
      ) : (
        <>
          <Route path="/dashboard" element={<Dashboard />} /> //
          <Route path="/settings" element={<SettingsPage />} /> //
          <Route path="/document/:id" element={<DocumentEditorWrapper />} /> //
          <Route path="/reset-password" element={<ResetPassword />} /> {/* Add this route */} //
          
          <Route path="/" element={<Navigate to="/dashboard" replace />} /> //
          <Route path="*" element={<Navigate to="/dashboard" replace />} /> //
        </>
      )}
    </Routes>
  );
}

// Helper to pass the URL ID to the editor
function DocumentEditorWrapper() { //
  const { id } = useParams(); //
  return <DocumentEditor documentId={id || ''} />; //
}

export default function App() { //
  return (
    <AuthProvider> 
      <Router> 
        <AppContent /> 
      </Router> 
    </AuthProvider> //
  );
}