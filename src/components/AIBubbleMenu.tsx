import { Editor } from '@tiptap/react';
import { useState, useEffect, useRef } from 'react';
import { Bold, Italic, Strikethrough, Sparkles, Check, X, Loader2 } from 'lucide-react';

interface AIBubbleMenuProps {
  editor: Editor;
}

export default function AIBubbleMenu({ editor }: AIBubbleMenuProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const menuRef = useRef<HTMLDivElement>(null);
  const [showAIInput, setShowAIInput] = useState(false);
  const [aiCommand, setAiCommand] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiPreview, setAiPreview] = useState<string | null>(null);

  const handleAICommand = async () => {
    if (!aiCommand.trim() || isProcessing) return;

    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to);

    if (!selectedText) return;

    setIsProcessing(true);

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-assist`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'custom',
          text: selectedText,
          customPrompt: aiCommand,
        }),
      });

      if (!response.ok) throw new Error('AI request failed');

      const data = await response.json();
      setAiPreview(data.result);
    } catch (error) {
      console.error('Error with AI command:', error);
      alert('Failed to process AI command. Please try again.');
      setShowAIInput(false);
      setAiCommand('');
    } finally {
      setIsProcessing(false);
    }
  };

  const acceptAIPreview = () => {
    if (!aiPreview) return;

    const { from, to } = editor.state.selection;
    editor.chain().focus().deleteRange({ from, to }).insertContent(aiPreview).run();

    setAiPreview(null);
    setAiCommand('');
    setShowAIInput(false);
  };

  const rejectAIPreview = () => {
    setAiPreview(null);
    setAiCommand('');
    setShowAIInput(false);
  };

  const quickActions = [
    { label: 'Summarize', command: 'Summarize this text concisely' },
    { label: 'Add Detail', command: 'Expand this text with more detail and examples' },
    { label: 'Simplify', command: 'Simplify this text to make it easier to understand' },
  ];

  useEffect(() => {
    const updateMenuPosition = () => {
      const { selection } = editor.state;
      const { empty, from, to } = selection;

      if (empty) {
        setShowMenu(false);
        return;
      }

      const hasSelection = from !== to;
      setShowMenu(hasSelection);

      if (hasSelection) {
        const domSelection = window.getSelection();
        if (domSelection && domSelection.rangeCount > 0) {
          const range = domSelection.getRangeAt(0);
          const rect = range.getBoundingClientRect();

          setPosition({
            top: rect.top - 60,
            left: rect.left + rect.width / 2,
          });
        }
      }
    };

    editor.on('selectionUpdate', updateMenuPosition);
    editor.on('transaction', updateMenuPosition);

    return () => {
      editor.off('selectionUpdate', updateMenuPosition);
      editor.off('transaction', updateMenuPosition);
    };
  }, [editor]);

  if (!showMenu) return null;

  return (
    <div
      ref={menuRef}
      className="fixed bg-white/95 backdrop-blur-md border border-slate-200 rounded-lg shadow-lg p-2 flex items-center gap-1 z-50"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: 'translateX(-50%)',
      }}
    >
      {aiPreview ? (
        <div className="flex items-center gap-2 px-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-md text-sm text-slate-700 max-w-md truncate">
            <span className="text-blue-600">Preview:</span>
            <span className="truncate">{aiPreview.substring(0, 50)}...</span>
          </div>
          <button
            onClick={acceptAIPreview}
            className="p-1.5 hover:bg-green-100 rounded transition-colors"
            title="Accept"
          >
            <Check className="w-4 h-4 text-green-600" />
          </button>
          <button
            onClick={rejectAIPreview}
            className="p-1.5 hover:bg-red-100 rounded transition-colors"
            title="Reject"
          >
            <X className="w-4 h-4 text-red-600" />
          </button>
        </div>
      ) : showAIInput ? (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={aiCommand}
            onChange={(e) => setAiCommand(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAICommand();
              } else if (e.key === 'Escape') {
                setShowAIInput(false);
                setAiCommand('');
              }
            }}
            placeholder="Type command (e.g., make this more persuasive)..."
            className="px-3 py-1.5 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent w-80"
            autoFocus
            disabled={isProcessing}
          />
          {isProcessing ? (
            <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
          ) : (
            <>
              <button
                onClick={handleAICommand}
                className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
              >
                Go
              </button>
              <button
                onClick={() => {
                  setShowAIInput(false);
                  setAiCommand('');
                }}
                className="p-1 hover:bg-slate-100 rounded transition-colors"
              >
                <X className="w-3 h-3 text-slate-600" />
              </button>
            </>
          )}
        </div>
      ) : (
        <>
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1.5 hover:bg-slate-100 rounded transition-colors ${
              editor.isActive('bold') ? 'bg-slate-100' : ''
            }`}
            title="Bold"
          >
            <Bold className="w-4 h-4 text-slate-700" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1.5 hover:bg-slate-100 rounded transition-colors ${
              editor.isActive('italic') ? 'bg-slate-100' : ''
            }`}
            title="Italic"
          >
            <Italic className="w-4 h-4 text-slate-700" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`p-1.5 hover:bg-slate-100 rounded transition-colors ${
              editor.isActive('strike') ? 'bg-slate-100' : ''
            }`}
            title="Strikethrough"
          >
            <Strikethrough className="w-4 h-4 text-slate-700" />
          </button>

          <div className="w-px h-6 bg-slate-200 mx-1" />

          <button
            onClick={() => setShowAIInput(true)}
            className="flex items-center gap-1.5 px-2 py-1.5 hover:bg-blue-50 rounded transition-colors"
            title="AI Edit"
          >
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-medium text-slate-700">AI Edit</span>
          </button>

          <div className="w-px h-6 bg-slate-200 mx-1" />

          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={() => {
                setAiCommand(action.command);
                setShowAIInput(true);
                setTimeout(() => handleAICommand(), 100);
              }}
              className="px-2 py-1 text-xs text-slate-600 hover:bg-slate-100 rounded transition-colors"
            >
              {action.label}
            </button>
          ))}
        </>
      )}
    </div>
  );
}
