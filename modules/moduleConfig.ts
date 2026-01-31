import { CategoryType } from '../types';
import { LucideIcon, Code, Terminal, FileCode, StickyNote } from 'lucide-react';

export interface ModuleConfig {
  id: CategoryType;
  name: string;
  icon: LucideIcon;
  enabled: boolean;
  description: string;
  color: string; // Tailwind color class
  fields: ModuleField[];
}

export interface ModuleField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'tags';
  required?: boolean;
  placeholder?: string;
  options?: string[]; // For select fields
  rows?: number; // For textarea
}

// Module configurations
export const MODULES: Record<CategoryType, ModuleConfig> = {
  CODE: {
    id: 'CODE',
    name: 'Code',
    icon: Code,
    enabled: true,
    description: 'Snippets de code réutilisables',
    color: 'blue',
    fields: [
      { name: 'title', label: 'Titre', type: 'text', required: true, placeholder: 'Nom du snippet...' },
      { name: 'language', label: 'Langage', type: 'select', required: true, options: [
        'javascript', 'typescript', 'python', 'java', 'csharp', 'cpp',
        'go', 'rust', 'php', 'ruby', 'swift', 'kotlin', 'html', 'css',
        'sql', 'bash', 'powershell', 'yaml', 'json', 'markdown'
      ]},
      { name: 'content', label: 'Code', type: 'textarea', required: true, placeholder: 'Votre code ici...', rows: 12 },
      { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Description du snippet...', rows: 3 },
      { name: 'tags', label: 'Tags', type: 'tags' }
    ]
  },

  PROMPT: {
    id: 'PROMPT',
    name: 'Prompts IA',
    icon: Terminal,
    enabled: true,
    description: 'Prompts pour IA (ChatGPT, Claude, etc.)',
    color: 'purple',
    fields: [
      { name: 'title', label: 'Titre du prompt', type: 'text', required: true, placeholder: 'Nom du prompt...' },
      { name: 'content', label: 'Contenu du prompt', type: 'textarea', required: true, placeholder: 'Votre prompt ici...', rows: 12 },
      { name: 'description', label: 'Cas d\'usage', type: 'textarea', placeholder: 'Quand utiliser ce prompt...', rows: 3 },
      { name: 'tags', label: 'Tags', type: 'tags' }
    ]
  },

  REGISTRY: {
    id: 'REGISTRY',
    name: 'Registre Windows',
    icon: FileCode,
    enabled: true,
    description: 'Entrées de registre Windows',
    color: 'pink',
    fields: [
      { name: 'title', label: 'Titre', type: 'text', required: true, placeholder: 'Nom de l\'entrée...' },
      { name: 'registryPath', label: 'Chemin du registre', type: 'text', required: true, placeholder: 'HKEY_LOCAL_MACHINE\\SOFTWARE\\...' },
      { name: 'registryName', label: 'Nom de la valeur', type: 'text', required: true, placeholder: 'NomDeLaValeur ou @ pour (Default)' },
      { name: 'registryType', label: 'Type', type: 'select', required: true, options: [
        'REG_SZ', 'REG_DWORD', 'REG_QWORD', 'REG_BINARY', 'REG_MULTI_SZ', 'REG_EXPAND_SZ'
      ]},
      { name: 'content', label: 'Valeur', type: 'textarea', required: true, placeholder: 'Valeur de l\'entrée...', rows: 4 },
      { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Description de cette entrée...', rows: 3 },
      { name: 'tags', label: 'Tags', type: 'tags' }
    ]
  },

  NOTE: {
    id: 'NOTE',
    name: 'Notes',
    icon: StickyNote,
    enabled: true,
    description: 'Notes et documentation',
    color: 'yellow',
    fields: [
      { name: 'title', label: 'Titre', type: 'text', required: true, placeholder: 'Titre de la note...' },
      { name: 'content', label: 'Contenu', type: 'textarea', required: true, placeholder: 'Contenu de la note...', rows: 12 },
      { name: 'description', label: 'Résumé', type: 'textarea', placeholder: 'Résumé court...', rows: 2 },
      { name: 'tags', label: 'Tags', type: 'tags' }
    ]
  },

  ALL: {
    id: 'ALL',
    name: 'Tous',
    icon: Code, // Placeholder, not used
    enabled: true,
    description: 'Tous les éléments',
    color: 'gray',
    fields: []
  }
};

// Get enabled modules
export const getEnabledModules = (): ModuleConfig[] => {
  return Object.values(MODULES).filter(m => m.enabled && m.id !== 'ALL');
};

// Get module by ID
export const getModule = (id: CategoryType): ModuleConfig => {
  return MODULES[id];
};

// Save module configuration to localStorage
export const saveModuleConfig = (config: Record<CategoryType, ModuleConfig>) => {
  const enabledState = Object.entries(config).reduce((acc, [key, value]) => {
    acc[key as CategoryType] = value.enabled;
    return acc;
  }, {} as Record<CategoryType, boolean>);

  localStorage.setItem('module_config', JSON.stringify(enabledState));
};

// Load module configuration from localStorage
export const loadModuleConfig = (): Record<CategoryType, ModuleConfig> => {
  const saved = localStorage.getItem('module_config');
  if (!saved) return MODULES;

  try {
    const enabledState = JSON.parse(saved) as Record<CategoryType, boolean>;
    const config = { ...MODULES };

    Object.entries(enabledState).forEach(([key, enabled]) => {
      if (config[key as CategoryType]) {
        config[key as CategoryType].enabled = enabled;
      }
    });

    return config;
  } catch {
    return MODULES;
  }
};
