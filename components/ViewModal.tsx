import React, { useEffect, useState } from 'react';
import { X, Copy, Check, Terminal, Code, FileCode, StickyNote, Calendar, Tag } from 'lucide-react';
import { CategoryEnum, Item } from '../types';

interface ViewModalProps {
  item: Item | null;
  onClose: () => void;
  onEdit: (item: Item) => void;
  isAdmin: boolean;
}

const ViewModal: React.FC<ViewModalProps> = ({ item, onClose, onEdit, isAdmin }) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (item && (window as any).Prism) {
      // Small timeout to ensure DOM is ready
      setTimeout(() => (window as any).Prism.highlightAll(), 50);
    }
  }, [item]);

  if (!item) return null;

  const handleCopy = () => {
    let textToCopy = item.content;
    if (item.category === CategoryEnum.REGISTRY) {
       textToCopy = `Windows Registry Editor Version 5.00\n\n[${item.registryPath}]\n"${item.title === '@' || item.title === '(Default)' ? '@' : item.title}"=${item.registryType === 'REG_DWORD' ? `dword:${parseInt(item.content).toString(16).padStart(8, '0')}` : `"${item.content}"`}`;
    }
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getIcon = () => {
    switch (item.category) {
      case CategoryEnum.PROMPT: return <Terminal className="text-accent" size={24} />;
      case CategoryEnum.CODE: return <Code className="text-primary" size={24} />;
      case CategoryEnum.REGISTRY: return <FileCode className="text-pink-500" size={24} />;
      case CategoryEnum.NOTE: return <StickyNote className="text-yellow-400" size={24} />;
    }
  };

  const getLanguageClass = () => {
    if (item.category === CategoryEnum.CODE) return `language-${item.language || 'javascript'}`;
    if (item.category === CategoryEnum.REGISTRY) return 'language-powershell';
    return 'language-markdown';
  };

  const formatDate = (ts: number) => new Date(ts).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in" onClick={onClose}>
      <div 
        className="bg-surface border border-slate-700 w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col rounded-xl shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-700 bg-slate-900/50">
          <div className="flex gap-4">
            <div className="p-3 bg-slate-800 rounded-xl h-fit border border-slate-700">
              {getIcon()}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-1">{item.title}</h2>
              {item.description && <p className="text-slate-400">{item.description}</p>}
              
              <div className="flex flex-wrap gap-4 mt-3 text-sm text-slate-500">
                <span className="flex items-center gap-1"><Tag size={14}/> {item.category}</span>
                <span className="flex items-center gap-1"><Calendar size={14}/> Mis à jour le {formatDate(item.updatedAt)}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {isAdmin && (
                <button 
                    onClick={() => { onClose(); onEdit(item); }}
                    className="px-4 py-2 bg-slate-800 hover:bg-primary hover:text-white text-slate-300 rounded-lg transition-colors font-medium border border-slate-700"
                >
                    Éditer
                </button>
            )}
            <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {item.tags.map(tag => (
              <span key={tag} className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-sm border border-slate-700">
                #{tag}
              </span>
            ))}
          </div>

          {/* Registry Metadata */}
          {item.category === CategoryEnum.REGISTRY && (
            <div className="bg-slate-900/80 rounded-lg border border-pink-900/30 p-4 font-mono text-sm">
                <div className="mb-2">
                    <span className="text-pink-500 font-bold">Path:</span> <span className="text-slate-300 break-all">{item.registryPath}</span>
                </div>
                <div>
                    <span className="text-pink-500 font-bold">Type:</span> <span className="text-slate-300">{item.registryType}</span>
                </div>
            </div>
          )}

          {/* Main Content Area */}
          <div className="relative group">
             <div className="absolute right-4 top-4 z-10 flex gap-2">
                <button
                  onClick={handleCopy}
                  className="bg-slate-800/80 hover:bg-slate-700 text-slate-300 p-2 rounded-lg backdrop-blur-sm border border-slate-600 transition-all shadow-lg"
                  title="Copier"
                >
                  {copied ? <Check size={18} className="text-green-400"/> : <Copy size={18} />}
                </button>
             </div>

             <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden text-sm md:text-base">
               <pre className={`${getLanguageClass()} !m-0 !p-6 !bg-transparent`}>
                 <code className={getLanguageClass()}>
                   {item.content}
                 </code>
               </pre>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ViewModal;
