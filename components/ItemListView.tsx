import React from 'react';
import { CategoryEnum, Item } from '../types';
import { Edit, Trash2, FileCode, Terminal, Code, StickyNote } from 'lucide-react';

interface ItemListViewProps {
  items: Item[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onView: (item: Item) => void; // New prop
  onEdit: (item: Item) => void;
  onDelete: (id: string) => void;
  isAdmin: boolean;
}

const ItemListView: React.FC<ItemListViewProps> = ({ 
  items, 
  selectedIds, 
  onToggleSelect, 
  onToggleSelectAll,
  onView,
  onEdit, 
  onDelete, 
  isAdmin 
}) => {

  const getIcon = (category: CategoryEnum) => {
    switch (category) {
      case CategoryEnum.PROMPT: return <Terminal className="text-accent" size={16} />;
      case CategoryEnum.CODE: return <Code className="text-primary" size={16} />;
      case CategoryEnum.REGISTRY: return <FileCode className="text-pink-500" size={16} />;
      case CategoryEnum.NOTE: return <StickyNote className="text-yellow-400" size={16} />;
    }
  };

  const allSelected = items.length > 0 && selectedIds.size === items.length;

  return (
    <div className="bg-surface border border-slate-700 rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-400">
          <thead className="bg-slate-900 text-slate-200 uppercase font-medium text-xs">
            <tr>
              <th className="px-6 py-4 w-12 text-center">
                <input 
                  type="checkbox" 
                  checked={allSelected}
                  onChange={onToggleSelectAll}
                  className="rounded border-slate-600 bg-slate-800 text-primary focus:ring-primary h-4 w-4"
                />
              </th>
              <th className="px-6 py-4">Nom / Titre</th>
              <th className="px-6 py-4">Détails</th>
              <th className="px-6 py-4">Tags / Type</th>
              {isAdmin && <th className="px-6 py-4 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {items.map((item) => {
              const isSelected = selectedIds.has(item.id);
              return (
                <tr 
                  key={item.id} 
                  onClick={() => onView(item)}
                  className={`hover:bg-slate-700/30 transition-colors cursor-pointer ${isSelected ? 'bg-slate-800/50' : ''}`}
                >
                  <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                    <input 
                      type="checkbox" 
                      checked={isSelected}
                      onChange={() => onToggleSelect(item.id)}
                      className="rounded border-slate-600 bg-slate-800 text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-slate-900 rounded-md shrink-0">
                        {getIcon(item.category)}
                      </div>
                      <div className="font-medium text-slate-200">{item.title}</div>
                    </div>
                    {item.description && (
                      <div className="text-xs text-slate-500 mt-1 pl-10 truncate max-w-xs">{item.description}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 font-mono text-xs">
                    {item.category === CategoryEnum.REGISTRY ? (
                      <div>
                        <div className="text-slate-500 mb-0.5 max-w-md truncate" title={item.registryPath}>
                          {item.registryPath}
                        </div>
                        <div className="text-slate-300 truncate max-w-xs" title={item.content}>
                          Value: <span className="text-primary">{item.content}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="truncate max-w-sm text-slate-500" title={item.content}>
                        {item.content.substring(0, 80)}...
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {item.category === CategoryEnum.REGISTRY ? (
                       <span className="px-2 py-1 rounded bg-slate-800 text-pink-400 text-xs border border-pink-500/20">
                         {item.registryType}
                       </span>
                    ) : (
                      <div className="flex gap-1 flex-wrap">
                        {item.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-xs border border-slate-700">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-2">
                        <button onClick={() => onEdit(item)} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-600 rounded transition-colors">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => onDelete(item.id)} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-600 rounded transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
        {items.length === 0 && (
          <div className="p-8 text-center text-slate-500">
            Aucun élément à afficher
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemListView;