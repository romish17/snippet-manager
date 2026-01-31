import React from 'react';
import { Plus, X } from 'lucide-react';
import { ModuleConfig } from '../modules/moduleConfig';
import { CategoryType } from '../types';

interface ModuleSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  modules: ModuleConfig[];
  onSelectModule: (moduleId: CategoryType) => void;
}

const ModuleSelector: React.FC<ModuleSelectorProps> = ({
  isOpen,
  onClose,
  modules,
  onSelectModule
}) => {
  if (!isOpen) return null;

  const handleSelect = (moduleId: CategoryType) => {
    onSelectModule(moduleId);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-surface border border-slate-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-fade-in">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-700 bg-gradient-to-r from-primary/10 to-accent/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg">
                <Plus size={24} className="text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Créer un nouvel élément</h2>
                <p className="text-sm text-slate-400">Choisissez le type de contenu à créer</p>
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

        {/* Module Grid */}
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {modules.map(module => (
              <button
                key={module.id}
                onClick={() => handleSelect(module.id)}
                className={`group relative p-6 rounded-xl border-2 transition-all hover:scale-[1.02] active:scale-[0.98] bg-${module.color}-500/5 border-${module.color}-500/30 hover:bg-${module.color}-500/10 hover:border-${module.color}-500/50 hover:shadow-lg hover:shadow-${module.color}-500/20`}
              >
                <div className="flex flex-col items-center text-center gap-3">
                  <div className={`p-3 bg-${module.color}-500/20 rounded-xl group-hover:bg-${module.color}-500/30 transition-colors`}>
                    <module.icon size={32} className={`text-${module.color}-400`} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-white group-hover:text-primary transition-colors">
                      {module.name}
                    </h3>
                    <p className="text-sm text-slate-400 mt-1">
                      {module.description}
                    </p>
                  </div>
                </div>

                {/* Hover Effect */}
                <div className={`absolute inset-0 rounded-xl bg-gradient-to-br from-${module.color}-500/0 to-${module.color}-500/0 group-hover:from-${module.color}-500/5 group-hover:to-transparent transition-all pointer-events-none`} />
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-700 flex justify-center bg-slate-900/50">
          <p className="text-xs text-slate-500">
            {modules.length} module{modules.length > 1 ? 's' : ''} disponible{modules.length > 1 ? 's' : ''}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ModuleSelector;
