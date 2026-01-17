export type CategoryType = 'ALL' | 'PROMPT' | 'CODE' | 'REGISTRY' | 'NOTE';

export enum CategoryEnum {
  PROMPT = 'PROMPT',
  CODE = 'CODE',
  REGISTRY = 'REGISTRY',
  NOTE = 'NOTE'
}

export interface Item {
  id: string;
  title: string;
  content: string; // Used for Prompt text, Code content, or Registry Value, or Note Markdown
  description?: string;
  category: CategoryEnum;
  tags: string[];
  createdAt: number;
  updatedAt: number;

  // Specific fields
  language?: string; // For code
  registryPath?: string; // For registry: key path (ex: HKEY_LOCAL_MACHINE\SOFTWARE\MyApp)
  registryName?: string; // For registry: value name (ex: "Version")
  registryType?: string; // For registry: value type (REG_SZ, REG_DWORD, etc.)
}

export interface ItemFormData extends Omit<Item, 'id' | 'createdAt' | 'updatedAt'> {
  id?: string;
}