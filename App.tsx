import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Terminal, Code, FileCode, LayoutGrid, Shield, Eye, Lock, List, Download, Archive, FileText, Zap, Moon, Palette, StickyNote, RefreshCw } from 'lucide-react';
import { CategoryType, CategoryEnum, Item, ItemFormData } from './types';
import { loadItems, saveItems } from './services/storageService';
import { generateBatFile, generatePs1File, generateRegFile, generateZipArchive, downloadSingleItem } from './services/exportService';
import ItemCard from './components/ItemCard';
import ItemListView from './components/ItemListView';
import EditModal from './components/EditModal';
import ViewModal from './components/ViewModal';
import { v4 as uuidv4 } from 'uuid';

type Theme = 'default' | 'syntax' | 'cyberpunk-2077';

const App: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<CategoryType>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [viewingItem, setViewingItem] = useState<Item | null>(null);
  
  // View State
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isAdmin, setIsAdmin] = useState(false);
  const [theme, setTheme] = useState<Theme>('default');
  
  // Selection State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Loading State
  const [isLoading, setIsLoading] = useState(true);

  // Load items (Async)
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const loaded = await loadItems();
      setItems(loaded);
      setIsLoading(false);
    };
    
    fetchData();
    
    // Load theme
    const savedTheme = localStorage.getItem('app_theme') as Theme;
    if (savedTheme) {
        setTheme(savedTheme);
    } else {
        setTheme('default');
    }
  }, []);

  // Save items
  // Note: In a real prod app, we would debounce this or save on specific actions
  // rather than every state change to avoid spamming the SQL DB.
  useEffect(() => {
    if (!isLoading) {
        saveItems(items);
    }
  }, [items, isLoading]);

  // Apply Theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('app_theme', theme);
  }, [theme]);

  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTheme(e.target.value as Theme);
  };

  // Extract all unique tags from all items
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    items.forEach(item => {
      item.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesCategory = activeCategory === 'ALL' || item.category === activeCategory;
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        item.title.toLowerCase().includes(searchLower) ||
        item.content.toLowerCase().includes(searchLower) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchLower));

      return matchesCategory && matchesSearch;
    });
  }, [items, activeCategory, searchTerm]);

  // Handle Selection
  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredItems.length && filteredItems.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredItems.map(i => i.id)));
    }
  };

  const handleSaveItem = (data: ItemFormData) => {
    if (data.id) {
      setItems(prev => prev.map(item => 
        item.id === data.id 
          ? { ...item, ...data, updatedAt: Date.now() } 
          : item
      ));
    } else {
      const newItem: Item = {
        ...data,
        id: uuidv4(),
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      setItems(prev => [newItem, ...prev]);
    }
  };

  const handleDeleteItem = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) {
      setItems(prev => prev.filter(item => item.id !== id));
      if (selectedIds.has(id)) {
        const newSet = new Set(selectedIds);
        newSet.delete(id);
        setSelectedIds(newSet);
      }
      if (viewingItem?.id === id) setViewingItem(null);
    }
  };

  const openNewModal = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const openEditModal = (item: Item) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  // Export handlers
  const getSelectedItems = () => items.filter(i => selectedIds.has(i.id));

  const selectionAnalysis = useMemo(() => {
    const selected = getSelectedItems();
    const hasRegistry = selected.some(i => i.category === CategoryEnum.REGISTRY);
    const hasNonRegistry = selected.some(i => i.category !== CategoryEnum.REGISTRY);
    const count = selected.length;
    
    return { selected, hasRegistry, hasNonRegistry, count };
  }, [selectedIds, items]);

  const handleRegistryExport = (type: 'reg' | 'ps1' | 'bat') => {
    const selected = getSelectedItems();
    if (selected.length === 0) return;
    
    if (type === 'reg') generateRegFile(selected);
    if (type === 'ps1') generatePs1File(selected);
    if (type === 'bat') generateBatFile(selected);
  };

  const handleGeneralExport = () => {
    const selected = getSelectedItems();
    if (selected.length === 0) return;

    if (selected.length === 1) {
      downloadSingleItem(selected[0]);
    } else {
      generateZipArchive(selected);
    }
  };

  // Ensure selection is cleared when category changes
  useEffect(() => {
    setSelectedIds(new Set());
  }, [activeCategory]);


  const TabButton = ({ cat, label, icon: Icon }: { cat: CategoryType, label: string, icon: any }) => (
    <button
      onClick={() => setActiveCategory(cat)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
        activeCategory === cat 
          ? 'bg-primary text-slate-900 shadow-lg shadow-primary/25 font-bold' 
          : 'text-slate-400 hover:text-white hover:bg-surface'
      }`}
    >
      <Icon size={18} />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-background text-slate-200 font-sans selection:bg-primary/30 selection:text-slate-900 pb-24 transition-colors duration-300">
      
      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-surface w-full transition-colors duration-300">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            
            <div className="flex items-center gap-3 shrink-0">
              <div className={`p-2 rounded-lg shadow-lg ${theme === 'cyberpunk-2077' ? 'bg-primary text-black' : (theme === 'syntax' ? 'bg-primary text-slate-900' : 'bg-gradient-to-tr from-primary to-accent text-white')}`}>
                <LayoutGrid size={24} />
              </div>
              <span className={`text-xl font-bold hidden md:block ${theme === 'cyberpunk-2077' || theme === 'syntax' ? 'text-primary' : 'bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400'}`}>
                DevSnippet
              </span>
            </div>

            <div className="flex-1 max-w-2xl mx-auto">
              <div className="relative group w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-secondary group-focus-within:text-primary transition-colors" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-surface rounded-lg leading-5 bg-surface text-slate-300 placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary sm:text-sm transition-all"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {/* Theme Dropdown */}
              <div className="relative flex items-center">
                 <div className="absolute left-2 text-slate-400 pointer-events-none">
                    <Palette size={16} />
                 </div>
                 <select
                   value={theme}
                   onChange={handleThemeChange}
                   className="pl-8 pr-4 py-2 text-sm bg-surface border border-surface text-slate-300 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none cursor-pointer hover:bg-opacity-80 transition-colors"
                 >
                   <option value="default">Standard</option>
                   <option value="syntax">Syntax</option>
                   <option value="cyberpunk-2077">Cyberpunk 2077</option>
                 </select>
              </div>

              <button
                onClick={() => setIsAdmin(!isAdmin)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all border ${
                  isAdmin 
                  ? 'bg-surface text-accent border-accent/50 hover:border-accent' 
                  : 'bg-surface text-slate-400 border-surface hover:text-white hover:border-slate-600'
                }`}
                title={isAdmin ? "Désactiver le mode Admin" : "Activer le mode Admin"}
              >
                {isAdmin ? <Shield size={18} /> : <Eye size={18} />}
                <span className="hidden lg:inline">{isAdmin ? 'Mode Admin' : 'Vue seule'}</span>
              </button>

              {isAdmin && (
                <button
                  onClick={openNewModal}
                  className="flex items-center gap-2 bg-primary hover:bg-opacity-80 text-white sm:text-slate-900 px-4 py-2 rounded-lg font-bold transition-all shadow-lg shadow-primary/20 active:scale-95"
                >
                  <Plus size={20} />
                  <span className="hidden sm:inline">Ajouter</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="w-full px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Controls Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide w-full md:w-auto">
                <TabButton cat="ALL" label="Tout" icon={LayoutGrid} />
                <TabButton cat={CategoryEnum.PROMPT} label="Prompts IA" icon={Terminal} />
                <TabButton cat={CategoryEnum.CODE} label="Code" icon={Code} />
                <TabButton cat={CategoryEnum.REGISTRY} label="Registre" icon={FileCode} />
                <TabButton cat={CategoryEnum.NOTE} label="Notes" icon={StickyNote} />
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                {/* View Toggle */}
                <div className="bg-surface p-1 rounded-lg flex border border-surface">
                    <button 
                        onClick={() => setViewMode('grid')}
                        className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-secondary/20 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                        title="Vue Grille"
                    >
                        <LayoutGrid size={18} />
                    </button>
                    <button 
                        onClick={() => setViewMode('list')}
                        className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-secondary/20 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                        title="Vue Liste"
                    >
                        <List size={18} />
                    </button>
                </div>
            </div>
        </div>

        {/* Loading State */}
        {isLoading && (
            <div className="flex justify-center items-center py-20">
                <div className="flex flex-col items-center gap-3 text-primary animate-pulse">
                    <RefreshCw size={32} className="animate-spin" />
                    <span className="text-sm font-medium">Connexion à la base de données...</span>
                </div>
            </div>
        )}

        {/* Content Area */}
        {!isLoading && (
            filteredItems.length > 0 ? (
            <>
                {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredItems.map(item => (
                    <ItemCard 
                        key={item.id} 
                        item={item} 
                        onView={() => setViewingItem(item)}
                        onEdit={openEditModal} 
                        onDelete={handleDeleteItem}
                        isAdmin={isAdmin}
                    />
                    ))}
                </div>
                ) : (
                <ItemListView 
                    items={filteredItems}
                    selectedIds={selectedIds}
                    onToggleSelect={toggleSelect}
                    onToggleSelectAll={toggleSelectAll}
                    onView={(item) => setViewingItem(item)}
                    onEdit={openEditModal}
                    onDelete={handleDeleteItem}
                    isAdmin={isAdmin}
                />
                )}
            </>
            ) : (
            <div className="text-center py-20 border-2 border-dashed border-surface rounded-xl bg-surface/50">
                <div className="inline-flex items-center justify-center p-4 bg-surface rounded-full mb-4">
                <Search className="h-8 w-8 text-secondary" />
                </div>
                <h3 className="text-lg font-medium text-slate-300">Aucun élément trouvé</h3>
                <p className="text-secondary mt-1 max-w-sm mx-auto">
                Essayez de modifier votre recherche.
                </p>
                {isAdmin && (
                    <button 
                    onClick={openNewModal}
                    className="mt-6 text-primary hover:opacity-80 font-medium hover:underline"
                    >
                    Créer un nouvel élément
                    </button>
                )}
            </div>
            )
        )}
      </main>

      {/* Export Floating Bar (Only if items selected) */}
      {selectedIds.size > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-surface border border-secondary shadow-2xl rounded-full px-6 py-3 flex items-center gap-4 animate-fade-in-up">
              <span className="text-sm font-medium text-white border-r border-slate-600 pr-4">
                  {selectedIds.size} sélectionné(s)
              </span>
              
              <div className="flex gap-2">
                  {/* Registry Specific Buttons */}
                  {selectionAnalysis.hasRegistry && !selectionAnalysis.hasNonRegistry ? (
                    <>
                      <button 
                        onClick={() => handleRegistryExport('reg')}
                        className="flex items-center gap-2 px-3 py-1.5 bg-pink-600 hover:bg-pink-500 text-white rounded-md text-sm font-medium transition-colors"
                      >
                        <Download size={14} /> .reg
                      </button>
                      <button 
                        onClick={() => handleRegistryExport('ps1')}
                        className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-sm font-medium transition-colors"
                      >
                        <Download size={14} /> .ps1
                      </button>
                      <button 
                        onClick={() => handleRegistryExport('bat')}
                        className="flex items-center gap-2 px-3 py-1.5 bg-slate-600 hover:bg-slate-500 text-white rounded-md text-sm font-medium transition-colors"
                      >
                        <Download size={14} /> .bat
                      </button>
                    </>
                  ) : (
                    /* Generic Download Button (Zip or Single) */
                    <button 
                      onClick={handleGeneralExport}
                      className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded-md text-sm font-medium transition-colors"
                    >
                      {selectionAnalysis.count > 1 ? <Archive size={14} /> : <FileText size={14} />}
                      {selectionAnalysis.count > 1 ? 'Télécharger ZIP' : 'Télécharger'}
                    </button>
                  )}
              </div>
              
              <button 
                onClick={() => setSelectedIds(new Set())}
                className="ml-2 text-slate-400 hover:text-white"
              >
                  <div className="bg-slate-700 rounded-full p-1"><X size={12}/></div>
              </button>
          </div>
      )}

      {/* Modals */}
      <EditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveItem}
        initialData={editingItem}
        existingTags={allTags}
      />
      
      <ViewModal 
        item={viewingItem}
        onClose={() => setViewingItem(null)}
        onEdit={(item) => {
            setViewingItem(null);
            openEditModal(item);
        }}
        isAdmin={isAdmin}
      />
    </div>
  );
};

// Helper for the close icon in floating bar
const X = ({size}: {size: number}) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);

export default App;