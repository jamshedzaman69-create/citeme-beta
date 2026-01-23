import { 
  Bold, Italic, List, ListOrdered, Quote, 
  Heading1, Heading2, Heading3, Undo, Redo, LucideIcon,
  Sparkles 
} from 'lucide-react';

interface MenuBarProps {
  editor: any;
  handleAddCitation: () => void;
}

interface MenuItem {
  icon?: LucideIcon;
  title?: string;
  action?: () => void;
  isActive?: () => boolean;
  type?: 'divider';
}

const MenuBar = ({ editor, handleAddCitation }: MenuBarProps) => {
  if (!editor) return null;

  const items: MenuItem[] = [
    { icon: Bold, title: 'Bold', action: () => editor.chain().focus().toggleBold().run(), isActive: () => editor.isActive('bold') },
    { icon: Italic, title: 'Italic', action: () => editor.chain().focus().toggleItalic().run(), isActive: () => editor.isActive('italic') },
    { type: 'divider' },
    { icon: Heading1, title: 'Heading 1', action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), isActive: () => editor.isActive('heading', { level: 1 }) },
    { icon: Heading2, title: 'Heading 2', action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), isActive: () => editor.isActive('heading', { level: 2 }) },
    { icon: Heading3, title: 'Heading 3', action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), isActive: () => editor.isActive('heading', { level: 3 }) },
    { type: 'divider' },
    { icon: List, title: 'Bullet List', action: () => editor.chain().focus().toggleBulletList().run(), isActive: () => editor.isActive('bulletList') },
    { icon: ListOrdered, title: 'Ordered List', action: () => editor.chain().focus().toggleOrderedList().run(), isActive: () => editor.isActive('orderedList') },
    { icon: Quote, title: 'Blockquote', action: () => editor.chain().focus().toggleBlockquote().run(), isActive: () => editor.isActive('blockquote') },
    { type: 'divider' },
    { icon: Undo, title: 'Undo', action: () => editor.chain().focus().undo().run() },
    { icon: Redo, title: 'Redo', action: () => editor.chain().focus().redo().run() },
  ];

  return (
    <div className="sticky top-0 z-30 w-full bg-white border-b border-slate-200 px-4 py-2 flex items-center justify-between shadow-sm">
      {items.map((item, index) => {
        if (item.type === 'divider') {
          return <div key={index} className="w-px h-5 bg-slate-200 mx-1" />;
        }

        const Icon = item.icon;
        return (
          <button
            key={index}
            onClick={(e) => {
              e.preventDefault();
              item.action?.();
            }}
            className={`p-2 rounded-md transition-colors ${
              item.isActive?.() ? 'bg-slate-100 text-blue-600' : 'text-slate-500 hover:bg-slate-50'
            }`}
            title={item.title}
          >
            {Icon && <Icon className="w-4 h-4" />}
          </button>
        );
      })}

      {/* Simplified AI Citation Button pushed to the right */}
      <div className="ml-auto">
        <button
          onClick={(e) => {
            e.preventDefault();
            handleAddCitation();
          }}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all shadow-sm group"
        >
          <Sparkles className="w-3.5 h-3.5 group-hover:animate-pulse" />
          <span className="text-xs font-semibold">Cite with AI</span>
        </button>
      </div>
    </div>
  );
};

export default MenuBar;