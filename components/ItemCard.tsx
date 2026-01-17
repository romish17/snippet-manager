import React, { useState, useEffect } from 'react';
import { Copy, Trash2, Edit, Code, Terminal, FileCode, Check, StickyNote } from 'lucide-react';
import { CategoryEnum, Item } from '../types';

interface ItemCardProps {
  item: Item;
  onView: () => void; // New Prop
  onEdit: (item: Item) => void;
  onDelete: (id: string) => void;
  isAdmin: boolean;
}

const ItemCard: React.FC<ItemCardProps> = ({ item, onView, onEdit, onDelete, isAdmin }) => {
  const [copied, setCopied] = useState(false);

  // Trigger Prism highlight on mount/update
  useEffect(() => {
    if ((window as any).Prism) {
      (window as any).Prism.highlightAll();
    }
  }, [item.content]);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Determine what to copy based on category
    let textToCopy = item.content;
    if (item.category === CategoryEnum.REGISTRY) {
       // Format a .reg file content style for registry items
       const valueName = item.registryName || item.title;
       const name = valueName === '@' || valueName === '(Default)' ? '@' : `"${valueName}"`;
       const value = item.registryType === 'REG_DWORD'
         ? `dword:${parseInt(item.content).toString(16).padStart(8, '0')}`
         : `"${item.content}"`;
       textToCopy = `Windows Registry Editor Version 5.00\n\n[${item.registryPath}]\n${name}=${value}`;
    }

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getIcon = () => {
    switch (item.category) {
      case CategoryEnum.PROMPT: return <Terminal className="text-accent" size={20} />;
      case CategoryEnum.CODE: return <Code className="text-primary" size={20} />;
      case CategoryEnum.REGISTRY: return <FileCode className="text-pink-500" size={20} />;
      case CategoryEnum.NOTE: return <StickyNote className="text-yellow-400" size={20} />;
    }
  };

  const getCategoryLabel = () => {
    switch (item.category) {
      case CategoryEnum.PROMPT: return 'Prompt IA';
      case CategoryEnum.CODE: return 'Snippet';
      case CategoryEnum.REGISTRY: return 'Registre';
      case CategoryEnum.NOTE: return 'Note';
    }
  };

  const getLanguageClass = () => {
    if (item.category === CategoryEnum.CODE) return `language-${item.language || 'javascript'}`;
    if (item.category === CategoryEnum.REGISTRY) return 'language-powershell'; // PowerShell highlighting looks decent for Reg values
    return 'language-markdown';
  };

  return (
    <div 
      onClick={onView}
      className="bg-surface border border-slate-700 rounded-xl p-5 transition-all duration-300 shadow-sm hover:shadow-lg flex flex-col h-full group hover:border-primary cursor-pointer hover:-translate-y-1"
    >
      
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="p-2 bg-slate-900 rounded-lg shrink-0">
            {getIcon()}
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-lg text-slate-100 truncate pr-2" title={item.title}>
              {item.title}
            </h3>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              {getCategoryLabel()}
            </span>
          </div>
        </div>
        
        {/* Admin Actions */}
        {isAdmin && (
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={(e) => { e.stopPropagation(); onEdit(item); }} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors" title="Modifier">
              <Edit size={16} />
            </button>
            <button onClick={(e) => { e.stopPropagation(); onDelete(item.id); }} className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors" title="Supprimer">
              <Trash2 size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Content Preview with Syntax Highlighting */}
      <div className="flex-1 mb-4 relative group/code">
        {item.category === CategoryEnum.REGISTRY ? (
          // Compact Registry Display
          <div className="bg-slate-950 rounded-lg p-3 text-xs font-mono border border-slate-800 space-y-2">
            <div className="grid grid-cols-[80px_1fr] gap-2 text-slate-400">
              <span className="font-semibold text-slate-500">Path:</span>
              <span className="text-slate-300 break-all">{item.registryPath || '-'}</span>

              <span className="font-semibold text-slate-500">Name:</span>
              <span className="text-slate-300">{item.registryName || item.title || '-'}</span>

              <span className="font-semibold text-slate-500">Type:</span>
              <span className="text-pink-400">{item.registryType || 'REG_SZ'}</span>

              <span className="font-semibold text-slate-500">Value:</span>
              <span className="text-green-400 break-all">{item.content || '-'}</span>
            </div>
          </div>
        ) : (
          // Standard Code/Prompt Display
          <div className="bg-slate-950 rounded-lg p-3 text-xs font-mono text-slate-300 h-40 overflow-hidden relative border border-slate-800">
            <div className="absolute inset-0 p-3 overflow-hidden text-ellipsis">
              <pre className={getLanguageClass()} style={{ margin: 0, padding: 0, background: 'transparent' }}>
                <code className={getLanguageClass()}>
                  {item.content}
                </code>
              </pre>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none"></div>
          </div>
        )}
      </div>
      
      {/* Description if available */}
      {item.description && (
        <p className="text-sm text-slate-400 mb-4 line-clamp-2 min-h-[1.25rem]">
          {item.description}
        </p>
      )}

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {item.tags.slice(0, 3).map(tag => (
          <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
            #{tag}
          </span>
        ))}
        {item.tags.length > 3 && <span className="text-xs text-slate-500">+{item.tags.length - 3}</span>}
      </div>

      {/* Footer Actions */}
      <div className="mt-auto flex gap-2 border-t border-slate-700 pt-3">
        <button
          onClick={handleCopy}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
            copied ? 'bg-green-500/20 text-green-400' : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
          }`}
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? 'Copié !' : 'Copier'}
        </button>
      </div>

    </div>
  );
};

export default ItemCard;