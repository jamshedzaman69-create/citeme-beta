interface MenuBarProps {
  editor: any; // or Editor | null
  handleAddCitation: () => void; // Add this line
}

import { 
    Bold, Italic, List, ListOrdered, Quote, 
    Heading1, Heading2, Undo, Redo, LucideIcon 
  } from 'lucide-react';
  
  interface MenuItem {
    icon?: LucideIcon;
    title?: string;
    action?: () => void;
    isActive?: () => boolean;
    type?: 'divider';
  }
  
  // const MenuBar = ({ editor,  }: { editor: any }) => {
  const MenuBar = ({ editor, handleAddCitation }: MenuBarProps) => {
    if (!editor) return null;
  
    const items: MenuItem[] = [
      { icon: Bold, title: 'Bold', action: () => editor.chain().focus().toggleBold().run(), isActive: () => editor.isActive('bold') },
      { icon: Italic, title: 'Italic', action: () => editor.chain().focus().toggleItalic().run(), isActive: () => editor.isActive('italic') },
      { icon: Heading1, title: 'Heading 1', action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), isActive: () => editor.isActive('heading', { level: 1 }) },
      { icon: Heading2, title: 'Heading 2', action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), isActive: () => editor.isActive('heading', { level: 2 }) },
      { icon: List, title: 'Bullet List', action: () => editor.chain().focus().toggleBulletList().run(), isActive: () => editor.isActive('bulletList') },
      { icon: ListOrdered, title: 'Ordered List', action: () => editor.chain().focus().toggleOrderedList().run(), isActive: () => editor.isActive('orderedList') },
      { icon: Quote, title: 'Blockquote', action: () => editor.chain().focus().toggleBlockquote().run(), isActive: () => editor.isActive('blockquote') },
      { type: 'divider' },
      { icon: Undo, title: 'Undo', action: () => editor.chain().focus().undo().run() },
      { icon: Redo, title: 'Redo', action: () => editor.chain().focus().redo().run() },
      {
        icon: Quote,
        title: 'Add AI Citation',
        action: () => handleAddCitation(),
        // Optional: disable button if nothing is selected
        isActive: () => !editor.state.selection.empty,
      },
    ];
  
    return (
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-slate-200 bg-white sticky top-0 z-20 rounded-t-sm">
        {items.map((item, index) => {
          if (item.type === 'divider') {
            return <div key={index} className="w-px h-6 bg-slate-200 mx-1" />;
          }
  
          // Fix: Assign the icon to a Capitalized variable
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
      </div>
    );
  };
  
  export default MenuBar;