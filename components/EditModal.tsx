import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { CategoryEnum, Item, ItemFormData } from '../types';
import { REGISTRY_TYPES, LANGUAGES } from '../constants';

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ItemFormData) => void;
  initialData?: Item | null;
}

const EditModal: React.FC<EditModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState<ItemFormData>({
    title: '',
    content: '',
    category: CategoryEnum.PROMPT,
    tags: [],
    description: '',
    language: 'typescript',
    registryPath: '',
    registryType: 'REG_SZ'
  });
  
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({ ...initialData });
    } else {
      // Reset form for new item
      setFormData({
        title: '',
        content: '',
        category: CategoryEnum.PROMPT,
        tags: [],
        description: '',
        language: 'typescript',
        registryPath: '',
        registryType: 'REG_SZ'
      });
    }
  }, [initialData, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!formData.tags.includes(tagInput.trim())) {
        setFormData(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      {/* Changed max-w-2xl to max-w-5xl for wider modal */}
      <div className="bg-surface border border-slate-700 w-full max-w-5xl max-h-[95vh] overflow-y-auto rounded-xl shadow-2xl animate-fade-in flex flex-col">
        <form onSubmit={handleSubmit} className="p-6 space-y-5 flex-1 flex flex-col">
          
          <div className="flex justify-between items-center pb-4 border-b border-slate-700">
            <h2 className="text-2xl font-bold text-white">
              {initialData ? 'Modifier l\'élément' : 'Nouvel élément'}
            </h2>
            <button type="button" onClick={onClose} className="p-1 hover:bg-slate-700 rounded-full transition-colors text-slate-400 hover:text-white">
              <X size={24} />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Titre</label>
                    <input 
                        type="text" 
                        name="title"
                        required
                        value={formData.title} 
                        onChange={handleChange}
                        placeholder="Ex: Script de backup..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Catégorie</label>
                        <select 
                            name="category" 
                            value={formData.category} 
                            onChange={handleChange}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                        >
                            <option value={CategoryEnum.PROMPT}>Prompt IA</option>
                            <option value={CategoryEnum.CODE}>Bout de Code</option>
                            <option value={CategoryEnum.REGISTRY}>Registre Windows</option>
                            <option value={CategoryEnum.NOTE}>Note (Markdown)</option>
                        </select>
                    </div>

                    {formData.category === CategoryEnum.CODE && (
                        <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Langage</label>
                        <select 
                            name="language" 
                            value={formData.language} 
                            onChange={handleChange}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                        >
                            {LANGUAGES.map(lang => (
                            <option key={lang} value={lang}>{lang}</option>
                            ))}
                        </select>
                        </div>
                    )}
                </div>

                {formData.category === CategoryEnum.REGISTRY && (
                    <div className="space-y-4 p-4 bg-slate-900/50 rounded-lg border border-slate-800">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Chemin du registre (Key Path)</label>
                        <input 
                        type="text" 
                        name="registryPath"
                        value={formData.registryPath} 
                        onChange={handleChange}
                        placeholder="HKEY_LOCAL_MACHINE\..."
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono text-sm focus:ring-2 focus:ring-primary outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Type</label>
                        <select 
                        name="registryType" 
                        value={formData.registryType} 
                        onChange={handleChange}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono text-sm focus:ring-2 focus:ring-primary outline-none"
                        >
                        {REGISTRY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    </div>
                )}
                
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Description</label>
                    <input 
                    type="text" 
                    name="description"
                    value={formData.description} 
                    onChange={handleChange}
                    placeholder="Brève description..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Tags</label>
                    <input 
                    type="text" 
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    placeholder="Appuyez sur Entrée pour ajouter"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    />
                    <div className="flex flex-wrap gap-2 mt-2 min-h-[30px]">
                    {formData.tags.map(tag => (
                        <span key={tag} className="bg-slate-700 text-slate-200 text-xs px-2 py-1 rounded-full flex items-center gap-1 animate-fade-in">
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-400"><X size={12} /></button>
                        </span>
                    ))}
                    </div>
                </div>
            </div>

            <div className="flex flex-col h-full">
                <div className="flex justify-between items-center mb-1">
                    <label className="block text-sm font-medium text-slate-400">
                    {formData.category === CategoryEnum.REGISTRY ? 'Valeur (Value)' : (formData.category === CategoryEnum.NOTE ? 'Contenu Markdown' : 'Contenu')}
                    </label>
                </div>
                {/* Increased rows significantly */}
                <textarea 
                name="content"
                required
                rows={20} 
                value={formData.content} 
                onChange={handleChange}
                placeholder={formData.category === CategoryEnum.REGISTRY ? '1' : (formData.category === CategoryEnum.NOTE ? '# Titre\n- Liste...' : 'Contenu ici...')}
                className="w-full flex-1 bg-slate-900 border border-slate-700 rounded-lg p-4 text-white font-mono text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none leading-relaxed"
                />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-700 mt-auto">
             <button 
               type="button" 
               onClick={onClose}
               className="px-4 py-2 text-slate-300 hover:text-white mr-3 transition-colors"
             >
               Annuler
             </button>
             <button 
               type="submit"
               className="px-8 py-2 bg-primary hover:bg-opacity-90 text-white rounded-lg flex items-center gap-2 font-bold transition-all shadow-lg shadow-primary/20 hover:scale-105"
             >
               <Save size={18} /> Sauvegarder
             </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default EditModal;