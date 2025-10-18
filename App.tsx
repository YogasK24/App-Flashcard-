import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import StudyDirectionToggle from './components/StudyDirectionToggle';
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
  const { theme } = useThemeStore();

  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentParentId, setCurrentParentId] = useState<number | null>(null);
  const [currentParentDeck, setCurrentParentDeck] = useState<Deck | null>(null);
  const [selectedDeckId, setSelectedDeckId] = useState<number | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQuizModeSelectorOpen, setIsQuizModeSelectorOpen] = useState(false);
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

  const handleDeckItemClick = (deck: Deck) => {
    if (deck.type === 'folder') {
      setCurrentParentId(deck.id);
      setSelectedDeckId(null);
    } else {
      setSelectedDeckId(deck.id);
    }
  };
  
  const handleAddDeck = async (title: string, type: 'deck' | 'folder') => {
    await addDeck(title, type, currentParentId);
    setRefreshKey(k => k + 1); // Gunakan refreshKey untuk memuat ulang
    setIsModalOpen(false);
  };

  const handleFabClick = () => {
    setIsModalOpen(true);
  };

  const handleShowContextMenu = (event: React.MouseEvent, deckId: number) => {
    const menuWidth = 192; // Sesuai dengan w-48 di Tailwind
    const menuHeight = 176; // Perkiraan tinggi untuk 4 item menu
    const padding = 10;   // Jarak dari tepi layar

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
  };

  const handleCloseContextMenu = () => {
    setContextMenuState(prevState => ({ ...prevState, isVisible: false }));
  };
  
  const handleRenameDeck = (deckId: number) => {
    const deckToEdit = decks.find(d => d.id === deckId);
    if (deckToEdit) {
      setEditDeckTarget(deckToEdit);
    }
  };

  const handleCopyDeck = async (deckId: number) => {
    await duplicateDeck(deckId);
    setRefreshKey(k => k + 1);
  };

  const handleMoveDeck = (deckId: number) => {
    setMoveDeckTarget(deckId);
  };
  
  const handleDeleteDeck = (deckId: number) => {
    const deckToDelete = decks.find(d => d.id === deckId);
    if (deckToDelete) {
      setDeleteConfirmation({ deckId: deckToDelete.id, title: deckToDelete.title });
    }
  };

  const handleConfirmDelete = async () => {
    if (deleteConfirmation) {
      await deleteDeck(deleteConfirmation.deckId);
      setDeleteConfirmation(null);
      setRefreshKey(k => k + 1);
    }
  };

  const handleConfirmRename = async (deckId: number, newTitle: string) => {
    await updateDeckTitle(deckId, newTitle);
    setEditDeckTarget(null);
    setRefreshKey(k => k + 1);
  };
  
  const handleConfirmMove = async (deckId: number, newParentId: number | null) => {
    await updateDeckParent(deckId, newParentId);
    setMoveDeckTarget(null);
    setRefreshKey(k => k + 1);
  };
  
  const handleDeleteCard = (card: Card) => {
    setDeleteCardTarget(card);
  };

  const handleSaveEditedCard = async (cardId: number, data: Partial<Omit<Card, 'id'>>) => {
    await updateCard(cardId, data);
    setCardToEdit(null); // Kembali ke daftar kartu
    setRefreshKey(k => k + 1); // Segarkan daftar kartu
  };

  const handleConfirmDeleteCard = async () => {
    if (deleteCardTarget?.id) {
      await deleteCard(deleteCardTarget.id);
      setDeleteCardTarget(null);
      setRefreshKey(k => k + 1);
    }
  };
  
  const handlePlayClick = (deckId: number) => {
    setOpeningDeckId(deckId);
    setDeckIdToQuiz(deckId);
    setIsQuizModeSelectorOpen(true);
  };

  const MainScreen = () => {
    const containerVariants = {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.07, // Jeda 70ms antar item
          delayChildren: 0.1,    // Penundaan awal 100ms
        },
      },
    };

    return (
      <>
        {selectedDeckId === null ? (
          <>
            <Header />
            <main className="px-4 pb-4 space-y-2">
              <Breadcrumbs 
                currentDeckId={currentParentId} 
                onNavigate={(id) => {
                  setCurrentParentId(id);
                  setSelectedDeckId(null);
                }} 
              />
              <StudyDirectionToggle />
              <motion.div
                key={currentParentId ?? 'root'}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <DeckList 
                  decks={decks} 
                  loading={loading || !isInitialized} 
                  onItemClick={handleDeckItemClick} 
                  onShowContextMenu={handleShowContextMenu} 
                  onPlayClick={handlePlayClick} 
                  openingDeckId={openingDeckId}
                />
              </motion.div>
            </main>
            <FloatingActionButton 
              onAdd={handleFabClick} 
            />
            <AddDeckModal 
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              onAdd={handleAddDeck}
            />
          </>
        ) : (
          <CardListView 
            deckId={selectedDeckId} 
            onBack={() => {
                setSelectedDeckId(null);
                setRefreshKey(k => k + 1); // Segarkan daftar dek saat kembali
            }} 
            refreshKey={refreshKey}
            onEditCard={setCardToEdit}
            onDeleteCard={handleDeleteCard}
          />
        )}
      </>
    );
  };
  
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
    return <MainScreen />;
  };

  return (
    <div className="bg-gray-50 dark:bg-[#1C1B1F] min-h-screen text-gray-900 dark:text-[#E6E1E5] font-sans relative">
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

        @keyframes fade-in-backdrop {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in-backdrop {
          animation: fade-in-backdrop 0.3s ease-out forwards;
        }

        @keyframes fade-in-content {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in-content {
          animation: fade-in-content 0.3s ease-out forwards;
        }
      `}</style>
      
      {renderPage()}

      {contextMenuState.isVisible && contextMenuState.deckId !== null && (
        <ContextMenu
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
      
      {deleteConfirmation && (
        <ConfirmDeleteModal
          isOpen={!!deleteConfirmation}
          deckTitle={deleteConfirmation.title}
          onClose={() => setDeleteConfirmation(null)}
          onConfirm={handleConfirmDelete}
        />
      )}

      {moveDeckTarget !== null && (
        <MoveDeckModal
          isOpen={moveDeckTarget !== null}
          deckToMoveId={moveDeckTarget}
          onClose={() => setMoveDeckTarget(null)}
          onMove={handleConfirmMove}
          getPossibleParents={getPossibleParentDecks}
        />
      )}
      
      {editDeckTarget && (
        <EditDeckModal
          isOpen={!!editDeckTarget}
          deckToEdit={editDeckTarget}
          onClose={() => setEditDeckTarget(null)}
          onSave={handleConfirmRename}
        />
      )}

      {deleteCardTarget && (
        <ConfirmDeleteCardModal
          isOpen={!!deleteCardTarget}
          cardFront={deleteCardTarget.front}
          onClose={() => setDeleteCardTarget(null)}
          onConfirm={handleConfirmDeleteCard}
        />
      )}
      
      <AnimatePresence>
        {isQuizModeSelectorOpen && deckIdToQuiz && (
          <QuizModeSelector
            deckId={deckIdToQuiz}
            onClose={() => {
                setIsQuizModeSelectorOpen(false);
                setDeckIdToQuiz(null);
                setOpeningDeckId(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;