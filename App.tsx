import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import Header from './components/Header';
import DeckList from './components/DeckList';
import { useCardStore } from './store/cardStore';
import { useThemeStore } from './store/themeStore';
import Quiz from './pages/Quiz';
import Breadcrumbs from './components/Breadcrumbs';
import { Deck, Card } from './types';
import AddDeckModal from './components/AddDeckModal';
import ContextMenu from './components/ContextMenu';
import ConfirmDeleteModal from './components/ConfirmDeleteModal';
import MoveDeckModal from './components/MoveDeckModal';
import EditDeckModal from './components/EditDeckModal';
import CardListView from './components/CardListView';
import ConfirmDeleteCardModal from './components/ConfirmDeleteCardModal';
import GamePage from './pages/GamePage';
import QuizModeSelector from './components/QuizModeSelector';
import EditCardPage from './pages/EditCardPage';
import { initializeTTS } from './services/ttsService';
import SortFilterModal from './components/SortFilterModal';
import CardSortModal from './components/CardSortModal';
import { db } from './services/databaseService';
import CardSearchResultList from './components/CardSearchResultList';
import Sidebar from './components/Sidebar';
import ImportMappingModal from './components/ImportMappingModal';
import SearchScopeToggle from './components/SearchScopeToggle';
import Icon from './components/Icon';
import { parseFile, ParsedFileData } from './utils/importService';
import SuccessNotification from './components/SuccessNotification';
import ExportModal from './components/ExportModal';
import AICardInputModal from './components/AICardInputModal';
import TargetDeckSelectorModal from './components/TargetDeckSelectorModal';
import ConfirmBulkDeleteCardModal from './components/ConfirmBulkDeleteCardModal';
import AIGenerateDeckModal from './components/AIGenerateDeckModal';


export interface CardSearchResult {
  card: Card;
  deck: Deck;
}

// =================================================================================
// KOMPONEN OVERLAY PENCARIAN
// =================================================================================
interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  searchQuery: string;
  onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  searchScope: 'all' | 'folder' | 'deck' | 'card';
  onSearchScopeChange: (scope: 'all' | 'folder' | 'deck' | 'card') => void;
}

const overlayVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3, ease: 'easeInOut' } },
};

const contentVariants: Variants = {
    hidden: { y: '-100%', transition: { type: 'spring', damping: 30, stiffness: 250 } },
    visible: { y: '0%', transition: { type: 'spring', damping: 20, stiffness: 200 } },
};

const SearchOverlay: React.FC<SearchOverlayProps> = ({ 
    isOpen, 
    onClose, 
    searchQuery, 
    onSearchChange, 
    searchScope, 
    onSearchScopeChange 
}) => {
    const searchInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            const handleKeyDown = (event: KeyboardEvent) => {
                if (event.key === 'Escape') {
                    onClose();
                }
            };
            document.addEventListener('keydown', handleKeyDown);

            // Penundaan singkat untuk memungkinkan transisi
            setTimeout(() => searchInputRef.current?.focus(), 300);

            return () => {
                document.removeEventListener('keydown', handleKeyDown);
            };
        }
    }, [isOpen, onClose, searchScope]); // Tambahkan searchScope untuk memicu fokus ulang

    const getPlaceholderText = () => {
        switch (searchScope) {
          case 'folder': return "Cari folder...";
          case 'deck': return "Cari dek...";
          case 'card': return "Cari kartu...";
          case 'all':
          default:
            return "Cari di semua...";
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    key="search-overlay"
                    className="fixed inset-0 z-30 bg-black/60"
                    variants={overlayVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    onClick={onClose}
                >
                    <motion.div
                        className="bg-gray-50 dark:bg-[#1C1B1F] text-gray-900 dark:text-[#E6E1E5] p-4"
                        variants={contentVariants}
                        onClick={(e) => e.stopPropagation()}
                        role="dialog"
                        aria-modal="true"
                        aria-label="Formulir Pencarian"
                    >
                        <div className="flex items-center w-full mb-4">
                            <button onClick={onClose} aria-label="Tutup pencarian" className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors duration-200 mr-2">
                                <Icon name="chevronLeft" className="w-6 h-6" />
                            </button>
                            <motion.div 
                                key={searchScope}
                                className="flex-grow"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.2, delay: 0.1 }}
                            >
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    value={searchQuery}
                                    onChange={onSearchChange}
                                    placeholder={getPlaceholderText()}
                                    className="flex-grow bg-transparent text-lg focus:outline-none w-full"
                                />
                            </motion.div>
                        </div>
                        <SearchScopeToggle
                            currentScope={searchScope}
                            onScopeChange={onSearchScopeChange}
                        />
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
// =================================================================================

const backdropVariants: Variants = {
    visible: { opacity: 1 },
    hidden: { opacity: 0 },
    exit: { opacity: 0 }
};
  
const sidebarVariants: Variants = {
    hidden: { x: '-100%' },
    visible: { 
      x: 0, 
      transition: { type: 'spring', damping: 30, stiffness: 250 }
    },
    exit: { 
      x: '-100%',
      transition: { type: 'spring', damping: 30, stiffness: 250 }
    },
};

function App() {
  // Pisahkan state yang berubah (yang memicu re-render) dari actions
  const decks = useCardStore((state) => state.decks);
  const quizDeck = useCardStore((state) => state.quizDeck);
  const gameType = useCardStore((state) => state.gameType);

  // Actions tidak menyebabkan re-render, jadi kita bisa mendapatkannya dengan getState
  // untuk performa yang lebih baik.
  const {
    addDeck,
    deleteDeck,
    updateDeckParent,
    getPossibleParentDecks,
    updateDeckTitle,
    duplicateDeck,
    updateCard,
    deleteCard,
    deleteCards,
    moveCards,
    importDeckFromFile,
    loadAllCards,
    loadAllDecks,
  } = useCardStore.getState();

  const { theme, sortOption, filterOption } = useThemeStore();

  const [isInitialized, setIsInitialized] = useState(false);
  const [currentParentId, setCurrentParentId] = useState<number | null>(null);
  const [selectedDeckId, setSelectedDeckId] = useState<number | null>(null);

  const [isAddDeckModalOpen, setIsAddDeckModalOpen] = useState(false);
  const [isAiCardModalOpen, setIsAiCardModalOpen] = useState(false);
  const [isAiDeckModalOpen, setIsAiDeckModalOpen] = useState(false);
  const [isDeckSelectorOpen, setIsDeckSelectorOpen] = useState(false);
  const [deckIdForAiModal, setDeckIdForAiModal] = useState<number | null>(null);
  const [isFabMenuOpen, setIsFabMenuOpen] = useState(false);
  const [isQuizModeSelectorOpen, setIsQuizModeSelectorOpen] = useState(false);
  const [isSortFilterModalOpen, setIsSortFilterModalOpen] = useState(false);
  const [isCardSortModalOpen, setIsCardSortModalOpen] = useState(false);
  const [deckIdToQuiz, setDeckIdToQuiz] = useState<number | null>(null);
  const [openingDeckId, setOpeningDeckId] = useState<number | null>(null);
  const [contextMenuState, setContextMenuState] = useState({
    isVisible: false,
    x: 0,
    y: 0,
    deckId: null as number | null,
    triggerElement: null as HTMLElement | null,
  });
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ deckId: number; title: string } | null>(null);
  const [moveDeckTarget, setMoveDeckTarget] = useState<number | null>(null);
  const [editDeckTarget, setEditDeckTarget] = useState<Deck | null>(null);
  const [cardToEdit, setCardToEdit] = useState<Card | null>(null);
  const [deleteCardTarget, setDeleteCardTarget] = useState<Card | null>(null);

  // State untuk fungsionalitas pencarian
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchScope, setSearchScope] = useState<'all' | 'folder' | 'deck' | 'card'>('all');
  const [highlightedItemId, setHighlightedItemId] = useState<number | null>(null);
  const [cardSearchResults, setCardSearchResults] = useState<CardSearchResult[]>([]);
  const [cardIdToHighlight, setCardIdToHighlight] = useState<number | null>(null);
  
  // State untuk mode pemilihan kartu massal
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedCardIds, setSelectedCardIds] = useState<Set<number>>(new Set());
  const [isMoveCardsModalOpen, setIsMoveCardsModalOpen] = useState(false);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [selectAllTrigger, setSelectAllTrigger] = useState(0);

  // State untuk fungsionalitas impor/ekspor
  const [isMainMenuOpen, setIsMainMenuOpen] = useState(false);
  const [importData, setImportData] = useState<ParsedFileData | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportTargetId, setExportTargetId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    initializeTTS();
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  // Efek untuk inisialisasi aplikasi satu kali
  useEffect(() => {
    const initializeApp = async () => {
        await loadAllDecks();
        await loadAllCards();
        setIsInitialized(true);
    };
    initializeApp();
  }, [loadAllDecks, loadAllCards]);

  useEffect(() => {
    if (!quizDeck && !gameType && openingDeckId !== null) {
      setOpeningDeckId(null);
    }
  }, [quizDeck, gameType, openingDeckId]);

  useEffect(() => {
    if (highlightedItemId !== null) {
      const timer = setTimeout(() => {
        const element = document.getElementById(`deck-item-${highlightedItemId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          const highlightTimer = setTimeout(() => setHighlightedItemId(null), 2500);
          return () => clearTimeout(highlightTimer);
        } else {
          setHighlightedItemId(null);
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [highlightedItemId]);
  
  const currentDeckForHeader = useMemo(() => {
    if (selectedDeckId === null) return null;
    return decks.find(d => d.id === selectedDeckId) || null;
  }, [selectedDeckId, decks]);
  
  const decksToDisplay = useMemo(() => {
    const lowerCaseQuery = searchQuery.trim().toLowerCase();
    
    // --- MODE PENCARIAN ---
    if (lowerCaseQuery !== '' && searchScope !== 'card') {
      const searchResults = decks.filter(item => {
        const titleMatch = item.title.toLowerCase().includes(lowerCaseQuery);
        if (!titleMatch) return false;
        switch (searchScope) {
          case 'all': return true;
          case 'folder': return item.type === 'folder';
          case 'deck': return item.type === 'deck';
          default: return false;
        }
      });
      // Terapkan penyortiran pada hasil pencarian
      return [...searchResults].sort((a, b) => {
        switch (sortOption) {
          case 'title-asc': return a.title.localeCompare(b.title);
          case 'title-desc': return b.title.localeCompare(a.title);
          case 'date-asc': return a.id - b.id;
          case 'date-desc': default: return b.id - a.id;
        }
      });
    }

    // --- MODE TELUSUR (DEFAULT) ---
    let currentLevelDecks = decks.filter(deck => deck.parentId === currentParentId);

    // 1. Filter
    if (filterOption === 'folders') {
        currentLevelDecks = currentLevelDecks.filter(deck => deck.type === 'folder');
    } else if (filterOption === 'decks') {
        currentLevelDecks = currentLevelDecks.filter(deck => deck.type === 'deck');
    }

    // 2. Sortir
    return [...currentLevelDecks].sort((a, b) => {
        switch (sortOption) {
          case 'title-asc': return a.title.localeCompare(b.title);
          case 'title-desc': return b.title.localeCompare(a.title);
          case 'date-asc': return a.id - b.id;
          case 'date-desc': default: return b.id - a.id;
        }
    });

  }, [decks, searchQuery, searchScope, sortOption, filterOption, currentParentId]);


  useEffect(() => {
    const searchCards = async () => {
        if (searchQuery.trim() !== '' && searchScope === 'card') {
            const lowerCaseQuery = searchQuery.trim().toLowerCase();
            const matchingCards = await db.cards.filter(card =>
                card.front.toLowerCase().includes(lowerCaseQuery) ||
                card.back.toLowerCase().includes(lowerCaseQuery)
            ).toArray();
          
            if (matchingCards.length > 0) {
                const deckIds = [...new Set(matchingCards.map(card => card.deckId))];
                // Mengambil dari state global daripada DB untuk konsistensi
                const parentDecks = decks.filter(d => deckIds.includes(d.id));
                const deckMap = new Map(parentDecks.map(deck => [deck.id, deck]));

                const results = matchingCards.map(card => ({
                    card,
                    deck: deckMap.get(card.deckId)!
                })).filter(result => result.deck);
                setCardSearchResults(results);
            } else {
                setCardSearchResults([]);
            }
        } else {
            setCardSearchResults([]);
        }
    };
    searchCards();
  }, [searchQuery, searchScope, decks]);


  const handleToggleSearch = useCallback(() => {
    setIsSearchVisible(prev => {
      if (prev) {
        setSearchQuery('');
      }
      return !prev;
    });
  }, []);

  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  }, []);
  
  const handleSearchScopeChange = useCallback((scope: 'all' | 'folder' | 'deck' | 'card') => {
    setSearchScope(scope);
    setSearchQuery(''); // Kosongkan pencarian saat scope berubah
  }, []);

  const handleOpenSortFilter = useCallback(() => {
    setIsSortFilterModalOpen(true);
  }, []);
  
  const handleOpenCardSortModal = useCallback(() => {
    setIsCardSortModalOpen(true);
  }, []);

  const handleMenuClick = useCallback(() => {
    setIsMainMenuOpen(true);
  }, []);

  const handleDeckItemClick = useCallback((deck: Deck) => {
    if (deck.type === 'folder') {
      setCurrentParentId(deck.id);
      setSelectedDeckId(null);
    } else {
      setSelectedDeckId(deck.id);
    }
  }, []);
  
  const handleSearchResultClick = useCallback((deck: Deck) => {
    setCurrentParentId(deck.parentId);
    setHighlightedItemId(deck.id);
    handleToggleSearch();
  }, [handleToggleSearch]);

  const handleCardSearchResultClick = useCallback((result: CardSearchResult) => {
    setSelectedDeckId(result.deck.id);
    setCardIdToHighlight(result.card.id!);
    handleToggleSearch();
  }, [handleToggleSearch]);

  const handleAddDeck = useCallback(async (title: string, type: 'deck' | 'folder'): Promise<{ success: boolean; message?: string; }> => {
    const result = await addDeck(title, type, currentParentId);
    if (result.success) {
        setIsAddDeckModalOpen(false);
    }
    return result;
  }, [addDeck, currentParentId]);

  const toggleFabMenu = () => setIsFabMenuOpen(prev => !prev);
  
  const handleOpenAddDeckModal = () => {
      setIsAddDeckModalOpen(true);
      setIsFabMenuOpen(false);
  };
  
  const handleOpenAiCardModal = () => {
    setIsDeckSelectorOpen(true);
    setIsFabMenuOpen(false);
  };

  const handleOpenAiDeckModal = () => {
    setIsAiDeckModalOpen(true);
    setIsFabMenuOpen(false);
  };

  const handleDeckSelectedForAI = (deckId: number) => {
    setIsDeckSelectorOpen(false);
    setDeckIdForAiModal(deckId);
    setIsAiCardModalOpen(true);
  };

  const handleShowContextMenu = useCallback((event: React.MouseEvent, deckId: number) => {
    const menuWidth = 192;
    const menuHeight = 220;
    const padding = 10;

    let x = event.clientX;
    let y = event.clientY;

    if (x + menuWidth > window.innerWidth) x = window.innerWidth - menuWidth - padding;
    if (y + menuHeight > window.innerHeight) y = window.innerHeight - menuHeight - padding;

    setContextMenuState({ isVisible: true, x, y, deckId, triggerElement: event.currentTarget as HTMLElement });
  }, []);

  const handleCloseContextMenu = useCallback(() => {
    if (contextMenuState.triggerElement) contextMenuState.triggerElement.focus();
    setContextMenuState(prevState => ({ ...prevState, isVisible: false, triggerElement: null }));
  }, [contextMenuState.triggerElement]);
  
  const handleRenameDeck = useCallback((deckId: number) => {
    const deckToEdit = decks.find(d => d.id === deckId);
    if (deckToEdit) setEditDeckTarget(deckToEdit);
  }, [decks]);

  const handleCopyDeck = useCallback(async (deckId: number) => {
    await duplicateDeck(deckId);
  }, [duplicateDeck]);

  const handleMoveDeck = useCallback((deckId: number) => {
    setMoveDeckTarget(deckId);
  }, []);
  
  const handleDeleteDeck = useCallback((deckId: number) => {
    const deckToDelete = decks.find(d => d.id === deckId);
    if (deckToDelete) {
      setDeleteConfirmation({ deckId: deckToDelete.id, title: deckToDelete.title });
    }
  }, [decks]);
  
  const handleExportDeck = useCallback((deckId: number) => {
    setExportTargetId(deckId);
    setIsExportModalOpen(true);
    handleCloseContextMenu();
  }, [handleCloseContextMenu]);

  const handleConfirmDelete = useCallback(async () => {
    if (deleteConfirmation) {
      await deleteDeck(deleteConfirmation.deckId);
      setDeleteConfirmation(null);
    }
  }, [deleteConfirmation, deleteDeck]);

  const handleConfirmRename = useCallback(async (deckId: number, newTitle: string) => {
    const result = await updateDeckTitle(deckId, newTitle);
    if (result.success) {
        setEditDeckTarget(null);
    }
    // Mengembalikan hasil agar modal dapat menampilkan error jika ada
    return result;
  }, [updateDeckTitle]);
  
  const handleConfirmMove = useCallback(async (deckId: number, newParentId: number | null) => {
    await updateDeckParent(deckId, newParentId);
    setMoveDeckTarget(null);
  }, [updateDeckParent]);
  
  const handleDeleteCard = useCallback((card: Card) => {
    setDeleteCardTarget(card);
  }, []);

  const handleSaveEditedCard = useCallback(async (cardId: number, data: Partial<Omit<Card, 'id'>>) => {
    await updateCard(cardId, data);
    setCardToEdit(null);
  }, [updateCard]);

  const handleConfirmDeleteCard = useCallback(async () => {
    if (deleteCardTarget?.id) {
      await deleteCard(deleteCardTarget.id);
      setDeleteCardTarget(null);
    }
  }, [deleteCard, deleteCardTarget]);
  
  const handlePlayClick = useCallback((deckId: number) => {
    setOpeningDeckId(deckId);
    setDeckIdToQuiz(deckId);
    setIsQuizModeSelectorOpen(true);
  }, []);

  const handleImportClick = useCallback(() => {
      setIsMainMenuOpen(false);
      fileInputRef.current?.click();
  }, []);
  
  const handleSidebarExportClick = useCallback(() => {
    setIsMainMenuOpen(false);
    setExportTargetId(null);
    setIsExportModalOpen(true);
  }, []);

  const handleCloseExportModal = useCallback(() => {
    setIsExportModalOpen(false);
    setExportTargetId(null);
  }, []);

  const handleCardListBack = useCallback(() => {
    setSelectedDeckId(null);
    setIsSelectionMode(false);
    setSelectedCardIds(new Set());
  }, []);

  const handleBreadcrumbNavigate = useCallback((id: number | null) => {
    setCurrentParentId(id);
    setSelectedDeckId(null);
  }, []);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
        const parsedData = await parseFile(file);
        setImportData(parsedData);
    } catch (error) {
        console.error("Kesalahan saat memproses file:", error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        useCardStore.getState().showNotification({ message: errorMessage, type: 'error' });
    } finally {
        if (event.target) event.target.value = '';
    }
  };

  const finalizeImport = async (deckTitle: string, mapping: Record<string, string>) => {
    if (!importData) return;
    try {
      const result = await importDeckFromFile(deckTitle, currentParentId, importData, mapping);
      if (result.success) {
        useCardStore.getState().showNotification({
          message: `${result.count} kartu berhasil diimpor ke dek '${deckTitle}'!`,
          type: 'success',
        });
      } else {
        useCardStore.getState().showNotification({
          message: `Gagal mengimpor: ${result.message || 'Terjadi kesalahan.'}`,
          type: 'error',
        });
      }
    } catch (error) {
      console.error("Gagal menyelesaikan impor:", error);
      useCardStore.getState().showNotification({ message: "Terjadi kesalahan saat mengimpor dek.", type: 'error' });
    } finally {
      setImportData(null);
    }
  };
  
  const handleCloseSidebar = useCallback(() => {
    setIsMainMenuOpen(false);
  }, []);
  
  const handleToggleSelectionMode = useCallback(() => {
    setIsSelectionMode(prev => !prev);
    setSelectedCardIds(new Set());
  }, []);
  
  const handleCardSelection = useCallback((cardId: number) => {
    setSelectedCardIds(prev => {
        const newSelection = new Set(prev);
        if (newSelection.has(cardId)) newSelection.delete(cardId);
        else newSelection.add(cardId);
        return newSelection;
    });
  }, []);
  
  const handleStartSelectionMode = useCallback((cardId: number) => {
    setIsSelectionMode(true);
    setSelectedCardIds(new Set([cardId]));
  }, []);

  const handleOpenBulkMove = () => setIsMoveCardsModalOpen(true);
  const handleOpenBulkDelete = () => setIsBulkDeleteModalOpen(true);
  const handleTriggerSelectAll = () => setSelectAllTrigger(c => c + 1);

  const handleBulkDeleteConfirm = async () => {
    await deleteCards(Array.from(selectedCardIds));
    setIsBulkDeleteModalOpen(false);
    handleToggleSelectionMode();
  };
  
  const handleMoveCardsConfirm = async (targetDeckId: number) => {
    await moveCards(Array.from(selectedCardIds), targetDeckId);
    setIsMoveCardsModalOpen(false);
    handleToggleSelectionMode();
  };

  const isHeaderVisible = !cardToEdit && !gameType && !quizDeck;

  const renderPage = () => {
    if (cardToEdit) {
      return (
        <EditCardPage
          card={cardToEdit}
          onBack={() => setCardToEdit(null)}
          onSave={handleSaveEditedCard}
        />
      );
    }
    if (gameType) return <GamePage />;
    if (quizDeck) return <Quiz />;
    
    if (selectedDeckId === null) {
        const isSearching = searchQuery.trim() !== '';
        const isCardSearch = isSearching && searchScope === 'card';
        const effectiveOnItemClick = isSearching && !isCardSearch ? handleSearchResultClick : handleDeckItemClick;
        return (
            <>
                <main className="flex-1 flex flex-col px-4 pb-20 transition-all duration-300 ease-in-out min-h-0">
                    <Breadcrumbs 
                        currentDeckId={currentParentId} 
                        onNavigate={handleBreadcrumbNavigate}
                    />
                    <div key={currentParentId ?? 'root'} className="flex-1 min-h-0 mt-2">
                        {isCardSearch ? (
                        <CardSearchResultList
                            results={cardSearchResults}
                            onItemClick={handleCardSearchResultClick}
                            loading={!isInitialized}
                        />
                        ) : (
                        <DeckList 
                            decks={decksToDisplay} 
                            loading={!isInitialized} 
                            onItemClick={effectiveOnItemClick} 
                            onShowContextMenu={handleShowContextMenu} 
                            onPlayClick={handlePlayClick} 
                            openingDeckId={openingDeckId}
                            highlightedItemId={highlightedItemId}
                            searchQuery={searchQuery}
                        />
                        )}
                    </div>
                </main>
                <div className="absolute bottom-6 right-4 z-20 flex flex-col items-end">
                  <AnimatePresence>
                      {isFabMenuOpen && (
                          <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 20 }}
                              transition={{ duration: 0.2, ease: 'easeOut' }}
                              className="flex flex-col items-end space-y-3 mb-3"
                          >
                              <div className="flex items-center space-x-2">
                                  <div className="bg-white dark:bg-[#2B2930] text-gray-700 dark:text-gray-200 text-sm font-semibold px-3 py-1 rounded-lg shadow-md">
                                      Buat Dek dengan AI
                                  </div>
                                  <button onClick={handleOpenAiDeckModal} className="w-14 h-14 flex items-center justify-center bg-blue-400 text-white rounded-2xl shadow-lg hover:bg-blue-500 transition-colors" aria-label="Buat Dek dengan AI">
                                      <Icon name="sparkle" className="w-6 h-6" />
                                  </button>
                              </div>
                              <div className="flex items-center space-x-2">
                                  <div className="bg-white dark:bg-[#2B2930] text-gray-700 dark:text-gray-200 text-sm font-semibold px-3 py-1 rounded-lg shadow-md">
                                      Isi Kartu dengan AI
                                  </div>
                                  <button onClick={handleOpenAiCardModal} className="w-14 h-14 flex items-center justify-center bg-violet-400 text-white rounded-2xl shadow-lg hover:bg-violet-500 transition-colors" aria-label="Buat dengan AI">
                                      <Icon name="sparkle" className="w-6 h-6" />
                                  </button>
                              </div>
                              <div className="flex items-center space-x-2">
                                  <div className="bg-white dark:bg-[#2B2930] text-gray-700 dark:text-gray-200 text-sm font-semibold px-3 py-1 rounded-lg shadow-md">
                                      Buat Folder/Deck
                                  </div>
                                  <button onClick={handleOpenAddDeckModal} className="w-14 h-14 flex items-center justify-center bg-gray-500 text-white rounded-2xl shadow-lg hover:bg-gray-600 transition-colors" aria-label="Buat Folder atau Dek Baru">
                                      <Icon name="edit" className="w-6 h-6" />
                                  </button>
                              </div>
                          </motion.div>
                      )}
                  </AnimatePresence>
                  <button onClick={toggleFabMenu} className="w-16 h-16 flex items-center justify-center bg-[#C8B4F3] text-black rounded-2xl shadow-lg hover:bg-[#D8C4F8] transition-all duration-300 ease-in-out hover:scale-105 active:scale-95" aria-label={isFabMenuOpen ? "Tutup menu aksi" : "Buka menu aksi"} aria-expanded={isFabMenuOpen}>
                      <motion.div animate={{ rotate: isFabMenuOpen ? 45 : 0 }} transition={{ duration: 0.3 }}>
                          <Icon name="plus" className="w-8 h-8" />
                      </motion.div>
                  </button>
                </div>
                <AnimatePresence mode="wait">
                    {isAddDeckModalOpen && (
                        <AddDeckModal key="add-deck-modal" onClose={() => setIsAddDeckModalOpen(false)} onAdd={handleAddDeck} />
                    )}
                </AnimatePresence>
            </>
        );
    } else {
        return (
            <CardListView 
                deckId={selectedDeckId} 
                onBack={handleCardListBack}
                onEditCard={setCardToEdit}
                onDeleteCard={handleDeleteCard}
                cardIdToHighlight={cardIdToHighlight}
                onHighlightDone={() => setCardIdToHighlight(null)}
                isSelectionMode={isSelectionMode}
                selectedCardIds={selectedCardIds}
                onToggleSelection={handleCardSelection}
                setSelectedCardIds={setSelectedCardIds}
                onStartSelectionMode={handleStartSelectionMode}
                selectAllTrigger={selectAllTrigger}
            />
        );
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-[#1C1B1F] h-screen flex flex-col text-gray-900 dark:text-[#E6E1E5] font-sans relative">
      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .rotate-y-180 { transform: rotateY(180deg); }
        .backface-hidden { backface-visibility: hidden; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes fade-in-slow { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in-slow { animation: fade-in-slow 0.5s ease-out forwards; }
      `}</style>
      
      <div className={`flex-1 flex flex-col min-h-0 transition-all duration-300 ease-in-out ${isMainMenuOpen ? 'blur-sm pointer-events-none' : ''}`}>
        {isHeaderVisible && (
          <Header 
              onToggleSearch={handleToggleSearch}
              onOpenSortFilter={handleOpenSortFilter}
              onOpenCardSortFilter={handleOpenCardSortModal}
              onMenuClick={handleMenuClick}
              deckId={selectedDeckId}
              deckTitle={currentDeckForHeader?.title}
              onBack={handleCardListBack}
              isSelectionMode={isSelectionMode && selectedDeckId !== null}
              onToggleSelectionMode={handleToggleSelectionMode}
              selectedCardCount={selectedCardIds.size}
              onBulkMove={handleOpenBulkMove}
              onBulkDelete={handleOpenBulkDelete}
              onSelectAll={handleTriggerSelectAll}
          />
        )}
        
        {renderPage()}
      </div>

      <AnimatePresence mode="wait">
        {contextMenuState.isVisible && contextMenuState.deckId !== null && (
          <ContextMenu
            key="context-menu"
            x={contextMenuState.x}
            y={contextMenuState.y}
            deckId={contextMenuState.deckId}
            onClose={handleCloseContextMenu}
            onRename={handleRenameDeck}
            onCopy={handleCopyDeck}
            onMove={handleMoveDeck}
            onExport={handleExportDeck}
            onDelete={handleDeleteDeck}
          />
        )}
      </AnimatePresence>
      
      <AnimatePresence mode="wait">
        {deleteConfirmation && (
          <ConfirmDeleteModal
            key="delete-modal"
            deckTitle={deleteConfirmation.title}
            onClose={() => setDeleteConfirmation(null)}
            onConfirm={handleConfirmDelete}
          />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {moveDeckTarget !== null && (
          <MoveDeckModal
            key="move-modal"
            deckToMoveId={moveDeckTarget}
            onClose={() => setMoveDeckTarget(null)}
            onMove={handleConfirmMove}
            getPossibleParents={getPossibleParentDecks}
          />
        )}
      </AnimatePresence>
      
      <AnimatePresence mode="wait">
        {editDeckTarget && (
          <EditDeckModal
            key="edit-modal"
            deckToEdit={editDeckTarget}
            onClose={() => setEditDeckTarget(null)}
            onSave={handleConfirmRename}
          />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {deleteCardTarget && (
          <ConfirmDeleteCardModal
            key="delete-card-modal"
            cardFront={deleteCardTarget.front}
            onClose={() => setDeleteCardTarget(null)}
            onConfirm={handleConfirmDeleteCard}
          />
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {isMoveCardsModalOpen && selectedDeckId && (
          <TargetDeckSelectorModal
            key="move-cards-modal"
            isOpen={isMoveCardsModalOpen}
            onClose={() => setIsMoveCardsModalOpen(false)}
            onMoveConfirm={handleMoveCardsConfirm}
            currentDeckId={selectedDeckId}
            selectedCardCount={selectedCardIds.size}
            mode="bulk"
          />
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {isBulkDeleteModalOpen && (
          <ConfirmBulkDeleteCardModal 
            key="bulk-delete-modal"
            isOpen={isBulkDeleteModalOpen}
            onClose={() => setIsBulkDeleteModalOpen(false)}
            onConfirm={handleBulkDeleteConfirm}
            cardCount={selectedCardIds.size}
          />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {isQuizModeSelectorOpen && deckIdToQuiz && (
          <QuizModeSelector
            key="quiz-mode-selector"
            deckId={deckIdToQuiz}
            onClose={() => {
                setIsQuizModeSelectorOpen(false);
                setDeckIdToQuiz(null);
                setOpeningDeckId(null);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {isSortFilterModalOpen && (
          <SortFilterModal
            key="sort-filter-modal"
            isOpen={isSortFilterModalOpen}
            onClose={() => setIsSortFilterModalOpen(false)}
          />
        )}
      </AnimatePresence>
      
      <AnimatePresence mode="wait">
        {isCardSortModalOpen && (
          <CardSortModal
            key="card-sort-modal"
            isOpen={isCardSortModalOpen}
            onClose={() => setIsCardSortModalOpen(false)}
          />
        )}
      </AnimatePresence>
      
      <AnimatePresence mode="wait">
        {isAiCardModalOpen && deckIdForAiModal !== null && (
          <AICardInputModal
            key="ai-card-modal-home"
            isOpen={isAiCardModalOpen}
            onClose={() => {
                setIsAiCardModalOpen(false);
                setDeckIdForAiModal(null);
            }}
            deckId={deckIdForAiModal}
          />
        )}
      </AnimatePresence>
      
      <AnimatePresence mode="wait">
        {isAiDeckModalOpen && (
            <AIGenerateDeckModal
                key="ai-deck-modal"
                isOpen={isAiDeckModalOpen}
                onClose={(newDeckId?: number) => {
                    setIsAiDeckModalOpen(false);
                    if (newDeckId) {
                        // Jeda singkat untuk memungkinkan animasi modal selesai sebelum navigasi
                        setTimeout(() => {
                            setSelectedDeckId(newDeckId);
                        }, 250);
                    }
                }}
                parentId={currentParentId}
            />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {isDeckSelectorOpen && (
            <TargetDeckSelectorModal
                key="deck-selector-modal-ai"
                isOpen={isDeckSelectorOpen}
                onClose={() => setIsDeckSelectorOpen(false)}
                onDeckSelected={handleDeckSelectedForAI}
                mode="single"
            />
        )}
      </AnimatePresence>

      <input
        type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden"
        accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
      />
      
      <AnimatePresence>
        {isMainMenuOpen && (
          <>
            <motion.div
              key="sidebar-backdrop"
              className="fixed inset-0 bg-black/60 z-40"
              onClick={handleCloseSidebar}
              variants={backdropVariants} initial="hidden" animate="visible" exit="hidden"
            />
            <motion.aside
              key="app-sidebar"
              className="fixed top-0 left-0 h-screen w-3/4 md:w-80 bg-white dark:bg-[#2B2930] shadow-2xl z-50 flex flex-col"
              variants={sidebarVariants} initial="hidden" animate="visible" exit="hidden"
              aria-modal="true" role="dialog"
            >
              <Sidebar onClose={handleCloseSidebar} onImport={handleImportClick} onExport={handleSidebarExportClick} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {importData && (
          <ImportMappingModal
            key="import-mapping-modal"
            isOpen={!!importData}
            onClose={() => setImportData(null)}
            headers={importData.headers}
            previewData={importData.previewData}
            fileName={importData.fileName}
            onSave={finalizeImport}
          />
        )}
      </AnimatePresence>
      
      <AnimatePresence mode="wait">
        {isExportModalOpen && (
          <ExportModal
            key="export-modal"
            isOpen={isExportModalOpen}
            onClose={handleCloseExportModal}
            initialItemId={exportTargetId}
            currentParentId={currentParentId}
            selectedDeckId={selectedDeckId}
          />
        )}
      </AnimatePresence>

      <SearchOverlay
          isOpen={isSearchVisible}
          onClose={handleToggleSearch}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          searchScope={searchScope}
          onSearchScopeChange={handleSearchScopeChange}
      />

      <SuccessNotification />
    </div>
  );
}

export default App;