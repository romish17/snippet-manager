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
  registryPath?: string; // For registry keys
  registryType?: string; // For registry keys (DWORD, SZ, etc.)
}

export interface ItemFormData extends Omit<Item, 'id' | 'createdAt' | 'updatedAt'> {
  id?: string;
}