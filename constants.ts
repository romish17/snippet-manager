import { CategoryEnum, Item } from './types';
import { v4 as uuidv4 } from 'uuid';

export const INITIAL_ITEMS: Item[] = [
  {
    id: '1',
    title: 'Expert React Developer System Prompt',
    content: 'You are a world-class senior frontend React engineer...',
    category: CategoryEnum.PROMPT,
    tags: ['react', 'frontend', 'system'],
    description: 'System instruction for generating high quality React code.',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: '2',
    title: 'Disable Windows Defender Real-time Monitoring',
    content: '1',
    registryPath: 'HKEY_LOCAL_MACHINE\\SOFTWARE\\Policies\\Microsoft\\Windows Defender',
    registryType: 'DWORD',
    category: CategoryEnum.REGISTRY,
    tags: ['windows', 'security', 'optimization'],
    description: 'Disables real-time protection. Use with caution.',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: '3',
    title: 'React useDebounce Hook',
    content: `export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}`,
    language: 'typescript',
    category: CategoryEnum.CODE,
    tags: ['react', 'hooks', 'performance'],
    description: 'Custom hook to debounce value changes.',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: '4',
    title: 'Project Roadmap Notes',
    content: `# Phase 1: MVP
- [x] Basic UI
- [x] Registry Export
- [ ] Authentication

## Phase 2: AI Features
1. **Gemini Integration**
2. Auto-tagging

> Remember to check API limits.`,
    category: CategoryEnum.NOTE,
    tags: ['planning', 'todo', 'dev'],
    description: 'Development roadmap for Q4.',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
];

export const REGISTRY_TYPES = ['REG_SZ', 'REG_DWORD', 'REG_QWORD', 'REG_BINARY', 'REG_MULTI_SZ', 'REG_EXPAND_SZ'];
export const LANGUAGES = ['typescript', 'javascript', 'python', 'html', 'css', 'json', 'bash', 'sql', 'powershell'];