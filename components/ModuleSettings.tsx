import React from 'react';
import { X, Settings, ToggleLeft, ToggleRight } from 'lucide-react';
import { ModuleConfig } from '../modules/moduleConfig';
import { CategoryType } from '../types';

interface ModuleSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  modules: Record<CategoryType, ModuleConfig>;
  onToggleModule: (moduleId: CategoryType) => void;
}

const ModuleSettings: React.FC<ModuleSettingsProps> = ({
  isOpen,
  onClose,
  modules,
  onToggleModule
}) => {
  if (!isOpen) return null;

  // Filter out 'ALL' category
  const configurableModules = Object.values(modules).filter(m => m.id !== 'ALL');

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-surface border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-700 bg-gradient-to-r from-primary/10 to-accent/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg">
                <Settings size={24} className="text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Configuration des Modules</h2>
                <p className="text-sm text-slate-400">Activez ou désactivez les modules selon vos besoins</p>
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

        {/* Module List */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
          <div className="space-y-4">
            {configurableModules.map(module => (
              <div
                key={module.id}
                className={`p-4 rounded-xl border-2 transition-all ${
                  module.enabled
                    ? `bg-${module.color}-500/5 border-${module.color}-500/30`
                    : 'bg-slate-900/50 border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`p-2 rounded-lg ${
                      module.enabled
                        ? `bg-${module.color}-500/20`
                        : 'bg-slate-800'
                    }`}>
                      <module.icon
                        size={24}
                        className={module.enabled ? `text-${module.color}-400` : 'text-slate-500'}
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-bold text-lg ${
                        module.enabled ? 'text-white' : 'text-slate-500'
                      }`}>
                        {module.name}
                      </h3>
                      <p className={`text-sm mt-1 ${
                        module.enabled ? 'text-slate-400' : 'text-slate-600'
                      }`}>
                        {module.description}
                      </p>

                      {/* Field Count */}
                      <div className="mt-2 text-xs text-slate-500">
                        {module.fields.length} champ{module.fields.length > 1 ? 's' : ''} configuré{module.fields.length > 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>

                  {/* Toggle Button */}
                  <button
                    onClick={() => onToggleModule(module.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                      module.enabled
                        ? `bg-${module.color}-500/20 text-${module.color}-400 hover:bg-${module.color}-500/30 border border-${module.color}-500/30`
                        : 'bg-slate-800 text-slate-500 hover:bg-slate-700 border border-slate-700'
                    }`}
                  >
                    {module.enabled ? (
                      <>
                        <ToggleRight size={20} />
                        <span className="hidden sm:inline">Activé</span>
                      </>
                    ) : (
                      <>
                        <ToggleLeft size={20} />
                        <span className="hidden sm:inline">Désactivé</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Info Notice */}
          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-sm text-blue-400">
              <strong>Note :</strong> Les modules désactivés n'apparaîtront pas dans la navigation et ne pourront pas être utilisés pour créer de nouveaux éléments. Les éléments existants restent accessibles.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-700 flex justify-end bg-slate-900/50">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-colors font-bold"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModuleSettings;
