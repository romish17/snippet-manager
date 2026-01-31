import React, { useState, useEffect } from 'react';
import { X, Plus, Tag as TagIcon } from 'lucide-react';
import { Item, ItemFormData, CategoryType } from '../types';
import { ModuleConfig, ModuleField } from '../modules/moduleConfig';

interface ModularEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ItemFormData) => void;
  initialData: Item | null;
  module: ModuleConfig;
  existingTags: string[]; // Tags specific to this module
}

const ModularEditModal: React.FC<ModularEditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  module,
  existingTags
}) => {
  const [formData, setFormData] = useState<any>({
    category: module.id,
    tags: []
  });

  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        category: module.id
      });
    } else {
      // Initialize with default values based on module fields
      const defaults: any = {
        category: module.id,
        tags: []
      };

      module.fields.forEach(field => {
        if (field.type === 'tags') {
          defaults.tags = [];
        } else if (field.type === 'textarea') {
          defaults[field.name] = '';
        } else if (field.type === 'text') {
          defaults[field.name] = '';
        } else if (field.type === 'select' && field.options && field.options.length > 0) {
          defaults[field.name] = field.options[0];
        }
      });

      setFormData(defaults);
    }
  }, [initialData, isOpen, module]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as ItemFormData);
    onClose();
  };

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [fieldName]: value }));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev: any) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData((prev: any) => ({
      ...prev,
      tags: prev.tags.filter((t: string) => t !== tagToRemove)
    }));
  };

  const renderField = (field: ModuleField) => {
    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            value={formData[field.name] || ''}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            required={field.required}
            placeholder={field.placeholder}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
          />
        );

      case 'textarea':
        return (
          <textarea
            value={formData[field.name] || ''}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            required={field.required}
            placeholder={field.placeholder}
            rows={field.rows || 4}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none font-mono text-sm"
          />
        );

      case 'select':
        return (
          <select
            value={formData[field.name] || ''}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            required={field.required}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
          >
            {field.options?.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );

      case 'tags':
        // Get suggested tags
        const suggestedTags = existingTags
          .filter(tag => !formData.tags.includes(tag))
          .filter(tag => tag.toLowerCase().includes(tagInput.toLowerCase()))
          .slice(0, 10);

        return (
          <div className="space-y-3">
            {/* Current Tags */}
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-primary/20 text-primary rounded-full text-sm border border-primary/30"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-red-400 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Tag Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="Ajouter un tag..."
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-sm"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors border border-primary/30"
              >
                <Plus size={18} />
              </button>
            </div>

            {/* Tag Suggestions */}
            {tagInput && suggestedTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {suggestedTags.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      setFormData((prev: any) => ({
                        ...prev,
                        tags: [...prev.tags, tag]
                      }));
                      setTagInput('');
                    }}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-slate-800 text-slate-300 rounded text-xs hover:bg-slate-700 transition-colors border border-slate-700"
                  >
                    <TagIcon size={12} />
                    {tag}
                  </button>
                ))}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-surface border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className={`px-6 py-4 border-b border-slate-700 bg-${module.color}-500/10`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 bg-${module.color}-500/20 rounded-lg`}>
                <module.icon size={24} className={`text-${module.color}-400`} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  {initialData ? 'Modifier' : 'Nouveau'} - {module.name}
                </h2>
                <p className="text-sm text-slate-400">{module.description}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors p-2 hover:bg-slate-800 rounded-lg"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          <div className="space-y-5">
            {module.fields.map(field => (
              <div key={field.name}>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  {field.label}
                  {field.required && <span className="text-red-400 ml-1">*</span>}
                </label>
                {renderField(field)}
              </div>
            ))}
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-700 flex gap-3 justify-end bg-slate-900/50">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors font-medium"
          >
            Annuler
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-colors font-bold shadow-lg shadow-primary/20"
          >
            {initialData ? 'Mettre à jour' : 'Créer'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModularEditModal;
