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
    StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
    Placeholder.configure({ placeholder: 'Start writing...' }),
    Link.configure({
      openOnClick: false,
      HTMLAttributes: { class: 'text-blue-600 underline cursor-pointer' },
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
    editor.chain().focus().aiTextPrompt({
      text: `Provide a formal academic citation for this statement: "${selectedText}". Format rules: Wrap in <span class="citation"></span> tags.`,
      format: 'rich-text',
    }).run();
  };

  const saveDocument = useCallback(async (content: string, docTitle: string) => {
    if (!currentDocument) return;
    try {
      const { error } = await supabase.from('documents').update({
        title: docTitle, content, updated_at: new Date().toISOString(),
      }).eq('id', currentDocument.id);
      if (error) throw error;
      setLastSaved(new Date());
    } catch (error) { console.error('Save error:', error); }
  }, [currentDocument]);

  const scheduleAutoSave = useCallback((content: string) => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => saveDocument(content, title), 2000);
  }, [saveDocument, title]);

  const loadDocument = useCallback(async () => {
    try {
      const { data } = await supabase.from('documents').select('*').eq('id', documentId).maybeSingle();
      if (data) {
        setCurrentDocument(data);
        setTitle(data.title);
        if (editor && data.content) editor.commands.setContent(data.content);
      }
    } catch (error) { console.error('Load error:', error); }
  }, [documentId, editor]);

  useEffect(() => {
    if (editor) {
      const handleUpdate = () => scheduleAutoSave(editor.getHTML());
      editor.on('update', handleUpdate);
      return () => { editor.off('update', handleUpdate); };
    }
  }, [editor, scheduleAutoSave]);

  useEffect(() => { loadDocument(); }, [loadDocument]);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const currentScrollY = containerRef.current.scrollTop;
      setShowTopBar(currentScrollY > 100 && currentScrollY < lastScrollY.current);
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
    if (editor) scheduleAutoSave(editor.getHTML());
  };

  if (!currentDocument || !editor) return null;

  return (
    /* 1. Main Wrapper: Flex row for side-by-side layout */
    <div className="flex h-screen w-full bg-slate-50/50 overflow-hidden relative">
      
      {/* 2. Left Side: Editor Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        
        {/* Sticky Minimalist Top Bar (Local to Editor) */}
        <div className={`absolute top-0 left-0 right-0 z-30 transition-all duration-300 ${
            showTopBar ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
          }`}>
          <div className="bg-white/80 backdrop-blur-md border-b border-slate-200/50 px-6 py-3">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
              <div className="text-sm font-medium text-slate-700 truncate">{title || 'Untitled'}</div>
              <div className="flex gap-2">
                <button onClick={() => setChatDrawerOpen(!chatDrawerOpen)} className="p-2 hover:bg-slate-100 rounded-lg transition-all">
                  <MessageSquare className="w-4 h-4 text-slate-500" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Utility Bar */}
        <div className="absolute top-6 right-6 z-30 flex items-center gap-3">
          <button onClick={() => setChatDrawerOpen(!chatDrawerOpen)} className="p-3 rounded-full hover:bg-slate-200/50 group transition-all">
            <MessageSquare className="w-5 h-5 text-slate-400 group-hover:text-slate-900" />
          </button>
          <button onClick={() => setCitationPanelOpen(true)} className="p-3 rounded-full hover:bg-slate-200/50 group transition-all">
            <Quote className="w-5 h-5 text-slate-400 group-hover:text-slate-900" />
          </button>
          <button onClick={() => setChecksDrawerOpen(!checksDrawerOpen)} className="p-3 rounded-full hover:bg-slate-200/50 group transition-all">
            <ShieldCheck className="w-5 h-5 text-slate-400 group-hover:text-slate-900" />
          </button>
        </div>

        {/* Scrollable Canvas */}
        <div ref={containerRef} className="flex-1 overflow-y-auto pt-20 pb-20 px-4 scroll-smooth">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6 sticky top-0 z-20">
              <MenuBar editor={editor} handleAddCitation={handleAddCitation}/>
            </div>

            <div className="bg-white shadow-xl ring-1 ring-slate-200 px-24 py-16 min-h-[1100px] mb-10 border border-slate-100">
              <input
                type="text" value={title} onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full text-4xl font-light text-slate-900 border-none outline-none bg-transparent mb-12 placeholder-slate-300 font-serif"
                placeholder="Untitled"
              />
              <EditorContent editor={editor} />
            </div>
          </div>
        </div>

        {lastSaved && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-slate-400 px-3 py-1 bg-white/80 backdrop-blur border rounded-full">
            Saved {lastSaved.toLocaleTimeString()}
          </div>
        )}
      </div>

      {/* 3. Right Side: Chat Sidebar (Static width, no blur) */}
      {chatDrawerOpen && (
        <div className="w-96 h-full flex-none border-l border-slate-200 bg-white animate-in slide-in-from-right duration-300 z-40">
          <ChatDrawer
            isOpen={chatDrawerOpen}
            onClose={() => setChatDrawerOpen(false)}
            documentContent={editor.getText() || ''}
            documentTitle={title || 'Untitled'}
          />
        </div>
      )}

      {/* Overlay Modals */}
      <CitationPanel isOpen={citationPanelOpen} onClose={() => setCitationPanelOpen(false)} onInsert={(c) => editor.chain().focus().insertContent(`<p>${c}</p>`).run()} />
      <AIBubbleMenu editor={editor} />
    </div>
  );
}