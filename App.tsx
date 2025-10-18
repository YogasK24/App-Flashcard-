
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import Header from './components/Header';
import DeckList from './components/DeckList';
import FloatingActionButton from './components/FloatingActionButton';
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
import { db } from './services/databaseService';
import CardSearchResultList from './components/CardSearchResultList';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import MainMenu from './components/MainMenu';
import ImportDeckModal from './components/ImportDeckModal';
import SearchScopeToggle from './components/SearchScopeToggle';
import Icon from './components/Icon';

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
    visible: { opacity: 1, transition: { duration: 0.3 } },
};

const contentVariants: Variants = {
    hidden: { y: '-100%', transition: { duration: 0.3, ease: 'easeOut' } },
    visible: { y: '0%', transition: { duration: 0.3, ease: 'easeOut' } },
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
            // Penundaan singkat untuk memungkinkan transisi
            setTimeout(() => searchInputRef.current?.focus(), 300);
        }
    }, [isOpen]);

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
                    >
                        <div className="flex items-center w-full mb-4">
                            <button onClick={onClose} aria-label="Tutup pencarian" className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors duration-200 mr-2">
                                <Icon name="chevronLeft" className="w-6 h-6" />
                            </button>
                            <input
                                ref={searchInputRef}
                                type="text"
                                value={searchQuery}
                                onChange={onSearchChange}
                                placeholder={getPlaceholderText()}
                                className="flex-grow bg-transparent text-lg focus:outline-none"
                            />
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

function App() {
  const { 
    quizDeck,
    gameType, 
    getDecksByParentId, 
    addDeck, 
    deleteDeck, 
    updateDeckParent, 
    getPossibleParentDecks,
    updateDeckTitle,
    duplicateDeck,
    getDeckById,
    updateCard,
    deleteCard,
    recalculateAllDeckStats,
  } = useCardStore(state => ({
    quizDeck: state.quizDeck,
    gameType: state.gameType,
    getDecksByParentId: state.getDecksByParentId,
    addDeck: state.addDeck,
    deleteDeck: state.deleteDeck,
    updateDeckParent: state.updateDeckParent,
    getPossibleParentDecks: state.getPossibleParentDecks,
    updateDeckTitle: state.updateDeckTitle,
    duplicateDeck: state.duplicateDeck,
    getDeckById: state.getDeckById,
    updateCard: state.updateCard,
    deleteCard: state.deleteCard,
    recalculateAllDeckStats: state.recalculateAllDeckStats,
  }));
  const { theme, sortOption, filterOption } = useThemeStore();

  const [decks, setDecks] = useState<Deck[]>([]); // Dek dalam folder saat ini
  const [decksToDisplay, setDecksToDisplay] = useState<Deck[]>([]); // Dek yang akan ditampilkan, baik hasil penelusuran atau penelusuran
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentParentId, setCurrentParentId] = useState<number | null>(null);
  const [currentParentDeck, setCurrentParentDeck] = useState<Deck | null>(null);
  const [selectedDeckId, setSelectedDeckId] = useState<number | null>(null);
  const [currentDeckForHeader, setCurrentDeckForHeader] = useState<Deck | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQuizModeSelectorOpen, setIsQuizModeSelectorOpen] = useState(false);
  const [isSortFilterModalOpen, setIsSortFilterModalOpen] = useState(false);
  const [deckIdToQuiz, setDeckIdToQuiz] = useState<number | null>(null);
  const [openingDeckId, setOpeningDeckId] = useState<number | null>(null);
  const [contextMenuState, setContextMenuState] = useState({
    isVisible: false,
    x: 0,
    y: 0,
    deckId: null as number | null,
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

  // State untuk fungsionalitas impor
  const [isMainMenuOpen, setIsMainMenuOpen] = useState(false);
  const [importModalData, setImportModalData] = useState<{ headers: string[], rows: string[][], fileName: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    initializeTTS(); // Pastikan fungsi inisialisasi ini dipanggil sekali saat komponen dimuat.
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  // Efek untuk inisialisasi aplikasi satu kali
  useEffect(() => {
    const initializeApp = async () => {
        await recalculateAllDeckStats();
        setIsInitialized(true); // Tandai bahwa inisialisasi selesai
    };
    initializeApp();
  }, [recalculateAllDeckStats]);

  useEffect(() => {
    // Saat kuis/permainan berakhir (quizDeck/gameType menjadi null), reset status loading.
    // Ini memperbaiki bug di mana tombol putar tetap menampilkan spinner setelah kembali ke daftar dek.
    if (!quizDeck && !gameType && openingDeckId !== null) {
      setOpeningDeckId(null);
    }
  }, [quizDeck, gameType, openingDeckId]);

  useEffect(() => {
    if (highlightedItemId !== null) {
      // Tunggu hingga DOM diperbarui setelah navigasi folder
      const timer = setTimeout(() => {
        const element = document.getElementById(`deck-item-${highlightedItemId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Hapus sorotan setelah beberapa saat
          const highlightTimer = setTimeout(() => {
            setHighlightedItemId(null);
          }, 2500); // Sorot selama 2.5 detik
          return () => clearTimeout(highlightTimer);
        } else {
          // Jika elemen tidak ditemukan (misalnya, dek yang difilter), hapus saja sorotan
          setHighlightedItemId(null);
        }
      }, 150); // Penundaan singkat untuk rendering

      return () => clearTimeout(timer);
    }
  }, [highlightedItemId]);

  useEffect(() => {
    if (selectedDeckId !== null) {
        const fetchDeck = async () => {
            const deck = await getDeckById(selectedDeckId);
            setCurrentDeckForHeader(deck || null);
        };
        fetchDeck();
    } else {
        setCurrentDeckForHeader(null);
    }
  }, [selectedDeckId, getDeckById]);

  const fetchAndSetDecks = useCallback(async () => {
    setLoading(true);
    if (currentParentId) {
        const parentDeck = await getDeckById(currentParentId);
        setCurrentParentDeck(parentDeck || null);
    } else {
        setCurrentParentDeck(null); // Atur ke null untuk root
    }
    const fetchedDecks = await getDecksByParentId(currentParentId);
    setDecks(fetchedDecks);
    setLoading(false);
  }, [currentParentId, getDecksByParentId, getDeckById]);

  useEffect(() => {
    // Hanya muat dek setelah aplikasi diinisialisasi
    if (isInitialized) {
        fetchAndSetDecks();
    }
  }, [fetchAndSetDecks, isInitialized, refreshKey]);

  useEffect(() => {
    const updateDisplay = async () => {
      if (!isInitialized) return;
  
      setLoading(true);
      const lowerCaseQuery = searchQuery.trim().toLowerCase();
      let finalDecks: Deck[] = [];
      let finalCardResults: CardSearchResult[] = [];
  
      if (lowerCaseQuery === '') {
        // --- MODE TELUSUR ---
        setCardSearchResults([]);
        let processedDecks = [...decks];
        // 1. Filter berdasarkan tipe
        if (filterOption === 'folders') {
          processedDecks = processedDecks.filter(deck => deck.type === 'folder');
        } else if (filterOption === 'decks') {
          processedDecks = processedDecks.filter(deck => deck.type === 'deck');
        }
        finalDecks = processedDecks;
      } else {
        // --- MODE PENCARIAN ---
        if (searchScope === 'card') {
          const matchingCards = await db.cards.filter(card =>
            card.front.toLowerCase().includes(lowerCaseQuery) ||
            card.back.toLowerCase().includes(lowerCaseQuery)
          ).toArray();
          
          if (matchingCards.length > 0) {
            const deckIds = [...new Set(matchingCards.map(card => card.deckId))];
            const parentDecks = await db.decks.where('id').anyOf(deckIds).toArray();
            const deckMap = new Map(parentDecks.map(deck => [deck.id, deck]));

            finalCardResults = matchingCards.map(card => ({
                card,
                deck: deckMap.get(card.deckId)!
            })).filter(result => result.deck); // Filter kartu yang deknya tidak ditemukan
          }
        } else {
          // Cari dek/folder
          const allItems = await db.decks.toArray();
          finalDecks = allItems.filter(item => {
            const titleMatch = item.title.toLowerCase().includes(lowerCaseQuery);
            if (!titleMatch) return false;
  
            switch (searchScope) {
              case 'all':
                return true;
              case 'folder':
                return item.type === 'folder';
              case 'deck':
                return item.type === 'deck';
              default:
                return false;
            }
          });
        }
      }
  
      // --- PENYORTIRAN (diterapkan pada dek) ---
      finalDecks.sort((a, b) => {
        switch (sortOption) {
          case 'title-asc':
            return a.title.localeCompare(b.title);
          case 'title-desc':
            return b.title.localeCompare(a.title);
          case 'date-asc':
            return a.id - b.id;
          case 'date-desc':
          default:
            return b.id - a.id;
        }
      });
  
      setDecksToDisplay(finalDecks);
      setCardSearchResults(finalCardResults);
      setLoading(false);
    };
  
    updateDisplay();
  
  }, [decks, searchQuery, searchScope, filterOption, sortOption, isInitialized]);

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
  
  const handleOpenSortFilter = useCallback(() => {
    setIsSortFilterModalOpen(true);
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
        setRefreshKey(k => k + 1);
        setIsModalOpen(false); // Tutup modal jika berhasil
    }
    return result; // Kembalikan hasil agar modal dapat menangani tampilan kesalahan
  }, [addDeck, currentParentId]);

  const handleFabClick = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const handleShowContextMenu = useCallback((event: React.MouseEvent, deckId: number) => {
    const menuWidth = 192;
    const menuHeight = 176;
    const padding = 10;

    let x = event.clientX;
    let y = event.clientY;

    if (x + menuWidth > window.innerWidth) {
      x = window.innerWidth - menuWidth - padding;
    }

    if (y + menuHeight > window.innerHeight) {
      y = window.innerHeight - menuHeight - padding;
    }

    setContextMenuState({
      isVisible: true,
      x,
      y,
      deckId,
    });
  }, []);

  const handleCloseContextMenu = useCallback(() => {
    setContextMenuState(prevState => ({ ...prevState, isVisible: false }));
  }, []);
  
  const handleRenameDeck = useCallback((deckId: number) => {
    const deckToEdit = decks.find(d => d.id === deckId);
    if (deckToEdit) {
      setEditDeckTarget(deckToEdit);
    }
  }, [decks]);

  const handleCopyDeck = useCallback(async (deckId: number) => {
    await duplicateDeck(deckId);
    setRefreshKey(k => k + 1);
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

  const handleConfirmDelete = useCallback(async () => {
    if (deleteConfirmation) {
      await deleteDeck(deleteConfirmation.deckId);
      setDeleteConfirmation(null);
      setRefreshKey(k => k + 1);
    }
  }, [deleteConfirmation, deleteDeck]);

  const handleConfirmRename = useCallback(async (deckId: number, newTitle: string) => {
    await updateDeckTitle(deckId, newTitle);
    setEditDeckTarget(null);
    setRefreshKey(k => k + 1);
  }, [updateDeckTitle]);
  
  const handleConfirmMove = useCallback(async (deckId: number, newParentId: number | null) => {
    await updateDeckParent(deckId, newParentId);
    setMoveDeckTarget(null);
    setRefreshKey(k => k + 1);
  }, [updateDeckParent]);
  
  const handleDeleteCard = useCallback((card: Card) => {
    setDeleteCardTarget(card);
  }, []);

  const handleSaveEditedCard = useCallback(async (cardId: number, data: Partial<Omit<Card, 'id'>>) => {
    await updateCard(cardId, data);
    setCardToEdit(null);
    setRefreshKey(k => k + 1);
  }, [updateCard]);

  const handleConfirmDeleteCard = useCallback(async () => {
    if (deleteCardTarget?.id) {
      await deleteCard(deleteCardTarget.id);
      setDeleteCardTarget(null);
      setRefreshKey(k => k + 1);
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
  
  const handleCardListBack = useCallback(() => {
    setSelectedDeckId(null);
    setRefreshKey(k => k + 1);
  }, []);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, "");

      reader.onload = (e) => {
          try {
              const data = e.target?.result;
              if (!data) throw new Error("Gagal membaca file.");

              let headers: string[] = [];
              let rows: string[][] = [];

              if (fileExtension === 'csv') {
                  const result = Papa.parse<string[]>(data as string, { header: false, skipEmptyLines: true });
                  if (result.data.length > 0) {
                      headers = result.data[0];
                      rows = result.data.slice(1);
                  }
              } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
                  const workbook = XLSX.read(data, { type: 'binary' });
                  const sheetName = workbook.SheetNames[0];
                  const worksheet = workbook.Sheets[sheetName];
                  const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];
                  if (json.length > 0) {
                      headers = json[0];
                      rows = json.slice(1);
                  }
              } else {
                  alert("Tipe file tidak didukung. Silakan pilih file CSV atau Excel.");
                  return;
              }

              const nonEmptyRows = rows.filter(row => row.some(cell => cell && String(cell).trim() !== ''));

              if (headers.length > 0 && nonEmptyRows.length > 0) {
                  setImportModalData({ headers, rows: nonEmptyRows, fileName: fileNameWithoutExt });
              } else {
                  alert("File yang dipilih kosong atau tidak memiliki header.");
              }
          } catch (error) {
              console.error("Kesalahan saat mem-parsing file:", error);
              alert("Terjadi kesalahan saat mem-parsing file.");
          }
      };

      if (fileExtension === 'csv') {
          reader.readAsText(file);
      } else {
          reader.readAsBinaryString(file);
      }

      event.target.value = ''; // Reset input file
  };

  const handleConfirmImport = async (deckTitle: string, frontHeader: string, backHeader: string) => {
    if (!importModalData) return;

    try {
        const { headers, rows } = importModalData;
        const frontIndex = headers.indexOf(frontHeader);
        const backIndex = headers.indexOf(backHeader);

        if (frontIndex === -1 || backIndex === -1) {
            alert("Pemetaan kolom tidak valid. Silakan pilih kolom yang berbeda untuk depan dan belakang.");
            return;
        }
        
        // Buat dek baru
        const newDeckId = await db.decks.add({
            title: deckTitle,
            parentId: currentParentId,
            type: 'deck',
            cardCount: 0, // Akan dihitung ulang
            progress: 0,
            dueCount: 0,
        } as Deck);

        // Ubah setiap baris menjadi objek kartu
        const newCards = rows.map(row => {
            const front = String(row[frontIndex] || '').trim();
            const back = String(row[backIndex] || '').trim();
            
            // Hanya buat kartu jika kedua sisi depan dan belakang memiliki konten
            if (front && back) {
                return {
                    deckId: newDeckId,
                    front,
                    back,
                    // Tetapkan nilai default untuk bidang SRS
                    dueDate: new Date(),
                    interval: 0,
                    easeFactor: 2.5,
                    repetitions: 0,
                } as Card;
            }
            return null;
        }).filter((card): card is Card => card !== null); // Hapus baris kosong

        // Simpan semua kartu baru ke database
        if (newCards.length > 0) {
            await db.cards.bulkAdd(newCards);
        }

        // Perbarui statistik dan segarkan UI
        await recalculateAllDeckStats();

        // Beri tahu pengguna tentang keberhasilan
        alert(`${newCards.length} kartu baru berhasil diimpor ke dek '${deckTitle}'!`);

    } catch (error) {
        console.error("Gagal menyelesaikan impor:", error);
        alert("Terjadi kesalahan saat mengimpor dek. Silakan coba lagi.");
    } finally {
        // Tutup modal dan segarkan daftar dek
        setImportModalData(null);
        setRefreshKey(k => k + 1);
    }
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
    if (gameType) {
        return <GamePage />;
    }
    if (quizDeck) {
        return <Quiz />;
    }
    
    // Tampilan Utama: Daftar Dek atau Daftar Kartu
    if (selectedDeckId === null) {
        // Tampilan Daftar Dek
        const isSearching = searchQuery.trim() !== '';
        const isCardSearch = isSearching && searchScope === 'card';
        const effectiveOnItemClick = isSearching && !isCardSearch ? handleSearchResultClick : handleDeckItemClick;
        return (
            <>
                <main className="flex-1 px-4 pb-20 space-y-2 transition-all duration-300 ease-in-out overflow-y-auto">
                    <Breadcrumbs 
                        currentDeckId={currentParentId} 
                        onNavigate={(id) => {
                        setCurrentParentId(id);
                        setSelectedDeckId(null);
                        }} 
                    />
                    <div
                        key={currentParentId ?? 'root'}
                    >
                        {isCardSearch ? (
                        <CardSearchResultList
                            results={cardSearchResults}
                            onItemClick={handleCardSearchResultClick}
                            loading={loading || !isInitialized}
                        />
                        ) : (
                        <DeckList 
                            decks={decksToDisplay} 
                            loading={loading || !isInitialized} 
                            onItemClick={effectiveOnItemClick} 
                            onShowContextMenu={handleShowContextMenu} 
                            onPlayClick={handlePlayClick} 
                            openingDeckId={openingDeckId}
                            highlightedItemId={highlightedItemId}
                        />
                        )}
                    </div>
                </main>
                <FloatingActionButton 
                onAdd={handleFabClick} 
                />
                <AnimatePresence mode="wait">
                    {isModalOpen && (
                        <AddDeckModal
                        key="add-deck-modal"
                        onClose={() => setIsModalOpen(false)}
                        onAdd={handleAddDeck}
                        />
                    )}
                </AnimatePresence>
            </>
        );
    } else {
        // Tampilan Daftar Kartu
        return (
            <CardListView 
                deckId={selectedDeckId} 
                onBack={handleCardListBack}
                refreshKey={refreshKey}
                onEditCard={setCardToEdit}
                onDeleteCard={handleDeleteCard}
                cardIdToHighlight={cardIdToHighlight}
                onHighlightDone={() => setCardIdToHighlight(null)}
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

        /* Animasi */
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        
        @keyframes fade-in-slow {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in-slow {
          animation: fade-in-slow 0.5s ease-out forwards;
        }
      `}</style>
      
      {isHeaderVisible && (
        <Header 
            onToggleSearch={handleToggleSearch}
            onOpenSortFilter={handleOpenSortFilter}
            onMenuClick={handleMenuClick}
            deckId={selectedDeckId}
            deckTitle={currentDeckForHeader?.title}
            onBack={handleCardListBack}
        />
      )}
      
      {renderPage()}

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

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        className="hidden"
        accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
      />
      
      <AnimatePresence mode="wait">
        {isMainMenuOpen && (
          <MainMenu
            key="main-menu"
            isOpen={isMainMenuOpen}
            onClose={() => setIsMainMenuOpen(false)}
            onImport={handleImportClick}
          />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {importModalData && (
          <ImportDeckModal
            key="import-deck-modal"
            isOpen={!!importModalData}
            onClose={() => setImportModalData(null)}
            data={importModalData}
            onConfirmImport={handleConfirmImport}
          />
        )}
      </AnimatePresence>

      <SearchOverlay
          isOpen={isSearchVisible}
          onClose={handleToggleSearch}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          searchScope={searchScope}
          onSearchScopeChange={setSearchScope}
      />
    </div>
  );
}

export default App;
