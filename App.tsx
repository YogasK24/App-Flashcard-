import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import Header from './components/Header';
import FilterBar from './components/FilterBar';
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
import AddCardModal from './components/AddCardModal';
import CardListView from './components/CardListView';
import EditCardModal from './components/EditCardModal';
import ConfirmDeleteCardModal from './components/ConfirmDeleteCardModal';


function App() {
  const { 
    quizDeck, 
    getDecksByParentId, 
    addDeck, 
    deleteDeck, 
    updateDeckParent, 
    getPossibleParentDecks,
    updateDeckTitle,
    duplicateDeck,
    getDeckById,
    addCardToDeck,
    updateCard,
    deleteCard,
  } = useCardStore(state => ({
    quizDeck: state.quizDeck,
    getDecksByParentId: state.getDecksByParentId,
    addDeck: state.addDeck,
    deleteDeck: state.deleteDeck,
    updateDeckParent: state.updateDeckParent,
    getPossibleParentDecks: state.getPossibleParentDecks,
    updateDeckTitle: state.updateDeckTitle,
    duplicateDeck: state.duplicateDeck,
    getDeckById: state.getDeckById,
    addCardToDeck: state.addCardToDeck,
    updateCard: state.updateCard,
    deleteCard: state.deleteCard,
  }));
  const { theme } = useThemeStore();

  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentParentId, setCurrentParentId] = useState<number | null>(null);
  const [currentParentDeck, setCurrentParentDeck] = useState<Deck | null>(null);
  const [selectedDeckId, setSelectedDeckId] = useState<number | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [filter, setFilter] = useState<'kanji' | 'katakana'>('kanji');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);
  const [contextMenuState, setContextMenuState] = useState({
    isVisible: false,
    x: 0,
    y: 0,
    deckId: null as number | null,
  });
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ deckId: number; title: string } | null>(null);
  const [moveDeckTarget, setMoveDeckTarget] = useState<number | null>(null);
  const [editDeckTarget, setEditDeckTarget] = useState<Deck | null>(null);
  const [editCardTarget, setEditCardTarget] = useState<Card | null>(null);
  const [deleteCardTarget, setDeleteCardTarget] = useState<Card | null>(null);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

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
    fetchAndSetDecks();
  }, [fetchAndSetDecks]);

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
    await fetchAndSetDecks();
    setIsModalOpen(false);
  };

  const handleAddCard = async (front: string, back: string) => {
    if (selectedDeckId) {
        await addCardToDeck(selectedDeckId, front, back);
        setIsAddCardModalOpen(false);
        setRefreshKey(k => k + 1);
        await fetchAndSetDecks(); // Muat ulang untuk memperbarui jumlah kartu
    }
  };
  
  const handleFabClick = () => {
    if (selectedDeckId !== null) {
      setIsAddCardModalOpen(true);
    } else {
      setIsModalOpen(true);
    }
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
    await fetchAndSetDecks();
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
      await fetchAndSetDecks();
    }
  };

  const handleConfirmRename = async (deckId: number, newTitle: string) => {
    await updateDeckTitle(deckId, newTitle);
    setEditDeckTarget(null);
    await fetchAndSetDecks();
  };
  
  const handleConfirmMove = async (deckId: number, newParentId: number | null) => {
    await updateDeckParent(deckId, newParentId);
    setMoveDeckTarget(null);
    await fetchAndSetDecks();
  };
  
  const handleEditCard = (card: Card) => {
    setEditCardTarget(card);
  };

  const handleDeleteCard = (card: Card) => {
    setDeleteCardTarget(card);
  };

  const handleConfirmEditCard = async (cardId: number, front: string, back: string) => {
    await updateCard(cardId, front, back);
    setEditCardTarget(null);
    setRefreshKey(k => k + 1);
  };

  const handleConfirmDeleteCard = async () => {
    if (deleteCardTarget?.id) {
      await deleteCard(deleteCardTarget.id);
      setDeleteCardTarget(null);
      setRefreshKey(k => k + 1);
      await fetchAndSetDecks(); // Muat ulang untuk memperbarui jumlah kartu
    }
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
              <FilterBar filter={filter} onFilterChange={setFilter} />
              <motion.div
                key={currentParentId ?? 'root'}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <DeckList decks={decks} loading={loading} onItemClick={handleDeckItemClick} onShowContextMenu={handleShowContextMenu} />
              </motion.div>
            </main>
          </>
        ) : (
          <CardListView 
            deckId={selectedDeckId} 
            onBack={() => setSelectedDeckId(null)} 
            refreshKey={refreshKey}
            onEditCard={handleEditCard}
            onDeleteCard={handleDeleteCard}
          />
        )}

        <FloatingActionButton 
          onAdd={handleFabClick} 
          text={selectedDeckId !== null ? 'Tambah Kartu' : undefined}
        />
        <AddDeckModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAdd={handleAddDeck}
        />
        <AddCardModal
          isOpen={isAddCardModalOpen}
          onClose={() => setIsAddCardModalOpen(false)}
          onAddCard={handleAddCard}
        />
      </>
    );
  };

  return (
    <div className="bg-gray-50 dark:bg-[#1C1B1F] min-h-screen text-gray-900 dark:text-[#E6E1E5] font-sans relative">
      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .rotate-y-180 { transform: rotateY(180deg); }
        .backface-hidden { backface-visibility: hidden; }

        /* Animasi */
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
      
      {quizDeck ? <Quiz /> : <MainScreen />}

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

      {editCardTarget && (
        <EditCardModal
          isOpen={!!editCardTarget}
          // Perbaikan: Mengganti variabel `cardToEdit` yang tidak terdefinisi dengan `editCardTarget` dari state.
          cardToEdit={editCardTarget}
          onClose={() => setEditCardTarget(null)}
          onSave={handleConfirmEditCard}
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
    </div>
  );
}

export default App;