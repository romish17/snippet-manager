import React, { useState, useEffect } from 'react';
import { Copy, Trash2, Edit, Code, Terminal, FileCode, Check, HelpCircle, Loader2, StickyNote } from 'lucide-react';
import { CategoryEnum, Item } from '../types';
import { explainItem } from '../services/geminiService';

interface ItemCardProps {
  item: Item;
  onView: () => void; // New Prop
  onEdit: (item: Item) => void;
  onDelete: (id: string) => void;
  isAdmin: boolean;
}

const ItemCard: React.FC<ItemCardProps> = ({ item, onView, onEdit, onDelete, isAdmin }) => {
  const [copied, setCopied] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [loadingExplanation, setLoadingExplanation] = useState(false);

  // Trigger Prism highlight on mount/update
  useEffect(() => {
    if ((window as any).Prism) {
      (window as any).Prism.highlightAll();
    }
  }, [item.content, explanation]);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Determine what to copy based on category
    let textToCopy = item.content;
    if (item.category === CategoryEnum.REGISTRY) {
       // Format a .reg file content style for registry items
       textToCopy = `Windows Registry Editor Version 5.00\n\n[${item.registryPath}]\n"${item.title === '@' || item.title === '(Default)' ? '@' : item.title}"=${item.registryType === 'REG_DWORD' ? `dword:${parseInt(item.content).toString(16).padStart(8, '0')}` : `"${item.content}"`}`;
    }

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExplain = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (explanation) {
      setExplanation(null); // Toggle off
      return;
    }
    setLoadingExplanation(true);
    try {
      const result = await explainItem(item);
      setExplanation(result);
    } catch (error) {
      setExplanation("Erreur lors de la génération de l'explication.");
    } finally {
      setLoadingExplanation(false);
    }
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
        <div className="bg-slate-950 rounded-lg p-3 text-xs font-mono text-slate-300 h-40 overflow-hidden relative border border-slate-800">
          <div className="absolute inset-0 p-3 overflow-hidden text-ellipsis">
            {item.category === CategoryEnum.REGISTRY && (
                <div className="mb-2 text-slate-500 border-b border-slate-800 pb-1 italic">
                    {item.registryPath}
                </div>
            )}
            <pre className={getLanguageClass()} style={{ margin: 0, padding: 0, background: 'transparent' }}>
              <code className={getLanguageClass()}>
                {item.content}
              </code>
            </pre>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none"></div>
        </div>
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

      {/* Explanation Area */}
      {explanation && (
        <div className="mb-4 p-3 bg-indigo-900/20 border border-indigo-500/30 rounded-lg text-sm text-indigo-200 animate-fade-in" onClick={(e) => e.stopPropagation()}>
           <div className="flex justify-between items-center mb-1">
             <span className="font-bold text-indigo-400 text-xs uppercase">Analyse Gemini</span>
             <button onClick={(e) => {e.stopPropagation(); setExplanation(null);}} className="text-indigo-400 hover:text-white"><X size={12}/></button>
           </div>
           {explanation}
        </div>
      )}

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
        
        <button 
          onClick={handleExplain}
          disabled={loadingExplanation}
          className="flex items-center justify-center p-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-accent transition-colors disabled:opacity-50"
          title="Expliquer avec Gemini"
        >
          {loadingExplanation ? <Loader2 size={16} className="animate-spin" /> : <HelpCircle size={16} />}
        </button>
      </div>

    </div>
  );
};

// Simple Icon component helper for the card
const X = ({size}: {size: number}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);

export default ItemCard;