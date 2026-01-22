import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase, Document } from '../lib/supabase';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import { Ai } from '@tiptap-pro/extension-ai';
import { MessageSquare, Quote, ShieldCheck } from 'lucide-react';
import CitationPanel from './CitationPanel';
import ChatDrawer from './ChatDrawer';
import AIBubbleMenu from './AIBubbleMenu';
import MenuBar from './MenuBar';

interface DocumentEditorProps {
  documentId: string;
}

export default function DocumentEditor({ documentId }: DocumentEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentDocument, setCurrentDocument] = useState<Document | null>(null);
  const [title, setTitle] = useState('');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [citationPanelOpen, setCitationPanelOpen] = useState(false);
  const [chatDrawerOpen, setChatDrawerOpen] = useState(false);
  const [checksDrawerOpen, setChecksDrawerOpen] = useState(false);
  const [showTopBar, setShowTopBar] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastScrollY = useRef(0);

  const hasValidAiCredentials = import.meta.env.VITE_TIPTAP_AI_APP_ID &&
    import.meta.env.VITE_TIPTAP_AI_TOKEN &&
    import.meta.env.VITE_TIPTAP_AI_APP_ID !== 'your-app-id-here' &&
    import.meta.env.VITE_TIPTAP_AI_TOKEN !== 'your-token-here';

  const extensions: any[] = [
    StarterKit.configure({
      heading: {
        levels: [1, 2, 3],
      },
    }),
    Placeholder.configure({
      placeholder: 'Start writing...',
    }),
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        class: 'text-blue-600 underline cursor-pointer',
      },
    }),
  ];

  if (hasValidAiCredentials) {
    extensions.push(
      Ai.configure({
        appId: import.meta.env.VITE_TIPTAP_AI_APP_ID,
        token: import.meta.env.VITE_TIPTAP_AI_TOKEN,
        autocompletion: true,
      })
    );
  }

  const editor = useEditor({
    extensions,
    editorProps: {
      attributes: {
        class: 'zen-editor prose prose-slate max-w-none focus:outline-none',
      },
    },
  });

  const handleAddCitation = () => {
    if (!editor) return;
  
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to, ' ');
  
    if (!selectedText) return;
  
    // Use aiPrompt or combine text for aiTextPrompt
    editor.chain().focus().aiTextPrompt({
      // We combine the instruction and the text into one prompt
      text: `Provide a formal academic citation for this statement: "${selectedText}". 
             Format rules: Wrap the citation in <span class="citation"></span> tags. 
             Example: <span class="citation">[Miller, 2024]</span>. 
             Do not include any conversational text, only the citation.`,
      format: 'rich-text',
    }).run();
  };

  const saveDocument = useCallback(async (content: string, docTitle: string) => {
    if (!currentDocument) return;

    try {
      const { error } = await supabase
        .from('documents')
        .update({
          title: docTitle,
          content: content,
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentDocument.id);

      if (error) throw error;

      setLastSaved(new Date());
    } catch (error) {
      console.error('Error saving document:', error);
    }
  }, [currentDocument]);

  const scheduleAutoSave = useCallback((content: string) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveDocument(content, title);
    }, 2000);
  }, [saveDocument, title]);

  const loadDocument = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', documentId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setCurrentDocument(data);
        setTitle(data.title);
        if (editor && data.content) {
          editor.commands.setContent(data.content);
        }
      }
    } catch (error) {
      console.error('Error loading document:', error);
    }
  }, [documentId, editor]);

  useEffect(() => {
    if (editor) {
      const handleUpdate = () => {
        const html = editor.getHTML();
        scheduleAutoSave(html);
      };

      editor.on('update', handleUpdate);

      return () => {
        editor.off('update', handleUpdate);
      };
    }
  }, [editor, scheduleAutoSave]);

  useEffect(() => {
    loadDocument();
  }, [loadDocument]);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const currentScrollY = containerRef.current.scrollTop;

      if (currentScrollY > 100) {
        if (currentScrollY < lastScrollY.current) {
          setShowTopBar(true);
        } else {
          setShowTopBar(false);
        }
      } else {
        setShowTopBar(false);
      }

      lastScrollY.current = currentScrollY;
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (editor) {
      const content = editor.getHTML();
      scheduleAutoSave(content);
    }
  };

  const handleInsertCitation = (citation: string) => {
    if (!editor) return;
    editor.chain().focus().insertContent(`<p>${citation}</p>`).run();
  };

  if (!currentDocument) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-300"></div>
      </div>
    );
  }

  if (!editor) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-300"></div>
      </div>
    );
  }

  return (
    <>
      <CitationPanel
        isOpen={citationPanelOpen}
        onClose={() => setCitationPanelOpen(false)}
        onInsert={handleInsertCitation}
      />

      <ChatDrawer
        isOpen={chatDrawerOpen}
        onClose={() => setChatDrawerOpen(false)}
        documentContent={editor.getText() || ''}
        documentTitle={title || 'Untitled'}
      />

      <AIBubbleMenu editor={editor} />

      {/* Sticky Minimalist Top Bar */}
      <div
        className={`fixed top-0 left-0 right-0 z-30 transition-all duration-300 ${
          showTopBar ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
        }`}
      >
        <div className="bg-white/80 backdrop-blur-md border-b border-slate-200/50 px-6 py-3">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="text-sm font-light text-slate-600 truncate max-w-md">
              {title || 'Untitled'}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setChatDrawerOpen(!chatDrawerOpen)}
                className="p-2 rounded-lg bg-transparent hover:bg-slate-100 transition-all"
                title="Chat"
              >
                <MessageSquare className="w-4 h-4 text-slate-500" />
              </button>
              <button
                onClick={() => setCitationPanelOpen(true)}
                className="p-2 rounded-lg bg-transparent hover:bg-slate-100 transition-all"
                title="Add Citations"
              >
                <Quote className="w-4 h-4 text-slate-500" />
              </button>
              <button
                onClick={() => setChecksDrawerOpen(!checksDrawerOpen)}
                className="p-2 rounded-lg bg-transparent hover:bg-slate-100 transition-all"
                title="Grammar & Plagiarism Checks"
              >
                <ShieldCheck className="w-4 h-4 text-slate-500" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Top-Right Utility Bar */}
      <div className="fixed top-6 right-6 z-30 flex items-center gap-3">
        <button
          onClick={() => setChatDrawerOpen(!chatDrawerOpen)}
          className="p-3 rounded-full bg-transparent hover:bg-slate-100 transition-all group"
          title="Chat"
        >
          <MessageSquare className="w-5 h-5 text-slate-400 group-hover:text-slate-900" />
        </button>
        <button
          onClick={() => setCitationPanelOpen(true)}
          className="p-3 rounded-full bg-transparent hover:bg-slate-100 transition-all group"
          title="Add Citations"
        >
          <Quote className="w-5 h-5 text-slate-400 group-hover:text-slate-900" />
        </button>
        <button
          onClick={() => setChecksDrawerOpen(!checksDrawerOpen)}
          className="p-3 rounded-full bg-transparent hover:bg-slate-100 transition-all group"
          title="Grammar & Plagiarism Checks"
        >
          <ShieldCheck className="w-5 h-5 text-slate-400 group-hover:text-slate-900" />
        </button>
      </div>

      {/* Main Canvas Container */}
      <div ref={containerRef} className="h-full overflow-auto py-16 px-8">
        <div className="max-w-4xl mx-auto">
        <MenuBar editor={editor} 
        handleAddCitation={handleAddCitation}/>
          {/* Paper Container */}
          <div className="bg-white rounded-sm shadow-sm hover:shadow-md transition-shadow duration-300 px-24 py-16 min-h-screen zen-editor-container">
            {/* Title Input */}
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="w-full text-4xl font-light text-slate-900 border-none outline-none focus:outline-none bg-transparent mb-12 placeholder-slate-300"
              placeholder="Untitled"
              style={{ fontFamily: 'Georgia, "Source Serif Pro", Charter, serif' }}
            />

            {/* Tiptap Editor */}
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>

      {/* Auto-save indicator */}
      {lastSaved && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 text-xs text-slate-400 font-light">
          Saved {lastSaved.toLocaleTimeString()}
        </div>
      )}
    </>
  );
}
