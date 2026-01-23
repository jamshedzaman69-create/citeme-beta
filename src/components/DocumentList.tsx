import { useState, useEffect } from 'react';
import { supabase, Document } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { FileText, Plus, Trash2, Clock } from 'lucide-react';

interface DocumentListProps {
  selectedDocumentId: string | null;
  onSelectDocument: (id: string) => void;
  onDocumentCreated: (id: string) => void;
}

export default function DocumentList({
  selectedDocumentId,
  onSelectDocument,
  onDocumentCreated
}: DocumentListProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadDocuments();
    }
  }, [user]);

  const loadDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const createDocument = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('documents')
        .insert([
          {
            user_id: user.id,
            title: 'Untitled Document',
            content: '',
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setDocuments([data, ...documents]);
      onDocumentCreated(data.id);
    } catch (error) {
      console.error('Error creating document:', error);
    }
  };

  const deleteDocument = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!confirm('Are you sure you want to delete this document?')) return;

    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setDocuments(documents.filter(doc => doc.id !== id));
      if (selectedDocumentId === id) {
        onSelectDocument(documents[0]?.id || '');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (diffInHours < 168) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-slate-300"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full py-6 px-4">
      <div className="mb-6">
        <button
          onClick={createDocument}
          className="w-full bg-slate-800 bg-opacity-80 text-white px-4 py-2.5 rounded-md font-light text-sm hover:bg-opacity-100 transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Document
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 opacity-60">
            <FileText className="w-12 h-12 text-slate-400 mb-3" />
            <h3 className="text-sm font-light text-slate-600 mb-1">
              No documents yet
            </h3>
            <p className="text-slate-400 text-xs font-light">
              Create your first document
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {documents.map((doc) => (
              <div
                key={doc.id}
                onClick={() => onSelectDocument(doc.id)}
                className={`w-full text-left px-3 py-2.5 rounded-md transition-all group cursor-pointer ${
                  selectedDocumentId === doc.id
                    ? 'bg-slate-800 bg-opacity-20 text-slate-900'
                    : 'text-slate-600 hover:bg-slate-800 hover:bg-opacity-10'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-light text-sm truncate mb-0.5">
                      {doc.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-light">
                      <Clock className="w-3 h-3" />
                      {formatDate(doc.updated_at)}
                    </div>
                  </div>
                  <button
                    onClick={(e) => deleteDocument(doc.id, e)}
                    className="opacity-0 group-hover:opacity-60 hover:opacity-100 p-1 transition-all"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-slate-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}