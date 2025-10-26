import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FixedSizeList as List } from 'react-window';
import { useCardStore } from '../store/cardStore';
import { useThemeStore } from '../store/themeStore';
import { Card, Deck } from '../types';
import Icon from './Icon';
import CardListItem from './CardListItem';
import AddCardModal from './AddCardModal';
import { FormCardData } from './AddEditCardForm';
import AICardInputModal from './AICardInputModal';
import Breadcrumbs from './Breadcrumbs';

interface CardListViewProps {
  deckId: number;
  onBack: () => void;
  onEditCard: (card: Card) => void;
  onDeleteCard: (card: Card) => void;
  cardIdToHighlight: number | null;
  onHighlightDone: () => void;
  isSelectionMode: boolean;
  selectedCardIds: Set<number>;
  onToggleSelection: (cardId: number) => void;
  setSelectedCardIds: React.Dispatch<React.SetStateAction<Set<number>>>;
  onStartSelectionMode: (cardId: number) => void;
  selectAllTrigger: number;
  onNavigate: (deckId: number | null) => void;
}

const CardRow = React.memo(({ index, style, data }: { index: number; style: React.CSSProperties; data: any }) => {
    const { cards, onEditCard, onDeleteCard, cardIdToHighlight, isSelectionMode, selectedCardIds, onToggleSelection, onStartSelectionMode } = data;
    const card = cards[index];

    return (
        <div style={style}>
            <CardListItem
                key={card.id}
                card={card}
                onEdit={() => onEditCard(card)}
                onDelete={() => onDeleteCard(card)}
                highlightedCardId={cardIdToHighlight}
                isSelectionMode={isSelectionMode}
                isSelected={selectedCardIds.has(card.id!)}
                onToggleSelection={onToggleSelection}
                onStartSelectionMode={onStartSelectionMode}
            />
        </div>
    );
});
CardRow.displayName = 'CardRow';


const CardListView: React.FC<CardListViewProps> = ({ 
  deckId, 
  onBack, 
  onEditCard, 
  onDeleteCard, 
  cardIdToHighlight, 
  onHighlightDone,
  isSelectionMode,
  selectedCardIds,
  onToggleSelection,
  setSelectedCardIds,
  onStartSelectionMode,
  selectAllTrigger,
  onNavigate
}) => {
  const { 
    getDeckById, 
    bulkAddCardsToDeck,
    cards: allCards,
  } = useCardStore(state => ({
    getDeckById: state.getDeckById,
    bulkAddCardsToDeck: state.bulkAddCardsToDeck,
    cards: state.cards,
  }));
  const cardSortOption = useThemeStore(state => state.cardSortOption);

  const [deck, setDeck] = useState<Deck | null>(null);
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);
  const [isFabMenuOpen, setIsFabMenuOpen] = useState(false);
  const [isAiCardModalOpen, setIsAiCardModalOpen] = useState(false);
  const listContainerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<List>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const observer = new ResizeObserver(entries => {
        if (entries[0]) {
            const { width, height } = entries[0].contentRect;
            setSize({ width, height });
        }
    });
    if (listContainerRef.current) {
        observer.observe(listContainerRef.current);
    }
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const fetchDeckInfo = async () => {
        const fetchedDeck = await getDeckById(deckId);
        setDeck(fetchedDeck || null);
    };
    fetchDeckInfo();
  }, [deckId, getDeckById]);
  
  const cards = useMemo(() => {
    const filtered = allCards.filter(card => card.deckId === deckId);
    
    // Terapkan logika pengurutan
    filtered.sort((a, b) => {
        switch (cardSortOption) {
            case 'date-asc':
                return (a.id ?? 0) - (b.id ?? 0);
            case 'due-date-asc':
                return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
            case 'front-asc':
                return a.front.localeCompare(b.front);
            case 'front-desc':
                return b.front.localeCompare(a.front);
            case 'back-asc':
                return a.back.localeCompare(b.back);
            case 'back-desc':
                return b.back.localeCompare(a.back);
            case 'date-desc':
            default:
                return (b.id ?? 0) - (a.id ?? 0);
        }
    });
    return filtered;
  }, [allCards, deckId, cardSortOption]);


  useEffect(() => {
    if (cardIdToHighlight !== null) {
      const cardIndex = cards.findIndex(card => card.id === cardIdToHighlight);
      if (cardIndex !== -1) {
        listRef.current?.scrollToItem(cardIndex, 'center');
        const highlightTimer = setTimeout(() => {
            onHighlightDone();
        }, 2500); 
        return () => clearTimeout(highlightTimer);
      } else {
        // Jika kartu tidak ditemukan, hapus sorotan
        onHighlightDone();
      }
    }
  }, [cardIdToHighlight, cards, onHighlightDone]);

  const handleSelectAll = useCallback(() => {
    // FIX: Using .reduce for a more robust way to create the Set of IDs,
    // which avoids potential TypeScript inference issues with chained methods.
    const allCardIds = cards.reduce((acc, card) => {
      if (typeof card.id === 'number') {
        acc.add(card.id);
      }
      return acc;
    }, new Set<number>());
    setSelectedCardIds(allCardIds);
  }, [cards, setSelectedCardIds]);

  useEffect(() => {
    // Hanya picu jika pemicu lebih besar dari 0 (bukan pada render awal)
    if (selectAllTrigger > 0) {
      handleSelectAll();
    }
  }, [selectAllTrigger, handleSelectAll]);


  const handleAddCard = async (cardsToAdd: Omit<FormCardData, 'key' | 'showTranscription' | 'showExample' | 'showImage'>[]) => {
    const cardsData = cardsToAdd.map(card => ({
        front: card.front,
        back: card.back,
        transcription: card.transcription || undefined,
        example: card.example || undefined,
    }));
    await bulkAddCardsToDeck(deckId, cardsData);
    setIsAddCardModalOpen(false);
    setIsFabMenuOpen(false);
  };

  const handleOpenAiModal = () => {
    setIsAiCardModalOpen(true);
    setIsFabMenuOpen(false);
  };
  
  const handleOpenManualModal = () => {
    setIsAddCardModalOpen(true);
    setIsFabMenuOpen(false);
  };

  const hasCards = cards.length > 0;
  const CARD_ITEM_HEIGHT = 73;

  const itemData = useMemo(() => ({
    cards,
    onEditCard,
    onDeleteCard,
    cardIdToHighlight,
    isSelectionMode,
    selectedCardIds,
    onToggleSelection,
    onStartSelectionMode,
  }), [cards, onEditCard, onDeleteCard, cardIdToHighlight, isSelectionMode, selectedCardIds, onToggleSelection, onStartSelectionMode]);

  return (
    <div className="flex flex-col flex-1 min-h-0 animate-fade-in-slow relative">
       <div className="px-4 flex-shrink-0">
         <Breadcrumbs currentDeckId={deckId} onNavigate={onNavigate} />
       </div>
      <main ref={listContainerRef} className={`flex-grow transition-all duration-300 ease-in-out ${hasCards ? 'px-4 pb-32' : 'flex flex-col items-center justify-center p-4'}`}>
        {!deck ? (
          <div className="text-center text-gray-500 dark:text-[#C8C5CA]">Memuat kartu...</div>
        ) : hasCards ? (
          size.width > 0 && size.height > 0 && (
            <List
                ref={listRef}
                height={size.height}
                width={size.width}
                itemCount={cards.length}
                itemSize={CARD_ITEM_HEIGHT}
                itemData={itemData}
                overscanCount={5}
            >
                {CardRow}
            </List>
          )
        ) : (
          <div className="flex flex-col items-center text-center text-gray-500 dark:text-[#C8C5CA]">
            <Icon name="document" className="w-16 h-16 mb-4 opacity-50" />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Belum ada kartu</h3>
            <p className="mt-1">Ayo buat yang pertama menggunakan tombol di bawah!</p>
          </div>
        )}
      </main>
      
      {!isSelectionMode && (
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
                                Buat dengan AI
                            </div>
                            <button
                                onClick={handleOpenAiModal}
                                className="w-14 h-14 flex items-center justify-center bg-violet-400 text-white rounded-2xl shadow-lg hover:bg-violet-500 transition-colors"
                                aria-label="Buat dengan AI"
                            >
                                <Icon name="sparkle" className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="bg-white dark:bg-[#2B2930] text-gray-700 dark:text-gray-200 text-sm font-semibold px-3 py-1 rounded-lg shadow-md">
                                Tambah Manual
                            </div>
                            <button
                                onClick={handleOpenManualModal}
                                className="w-14 h-14 flex items-center justify-center bg-gray-500 text-white rounded-2xl shadow-lg hover:bg-gray-600 transition-colors"
                                aria-label="Tambah Manual"
                            >
                                <Icon name="edit" className="w-6 h-6" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            <button
                onClick={() => setIsFabMenuOpen(prev => !prev)}
                className="w-16 h-16 flex items-center justify-center bg-[#C8B4F3] text-black rounded-2xl shadow-lg hover:bg-[#D8C4F8] transition-all duration-300 ease-in-out hover:scale-105 active:scale-95"
                aria-label={isFabMenuOpen ? "Tutup menu tambah" : "Buka menu tambah"}
                aria-expanded={isFabMenuOpen}
            >
                <motion.div
                    animate={{ rotate: isFabMenuOpen ? 45 : 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <Icon name="plus" className="w-8 h-8" />
                </motion.div>
            </button>
          </div>
      )}

      <AnimatePresence>
        {isAddCardModalOpen && (
          <AddCardModal
            key="add-card-modal"
            onClose={() => setIsAddCardModalOpen(false)}
            onAddCard={handleAddCard}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAiCardModalOpen && (
          <AICardInputModal
            key="ai-card-modal"
            isOpen={isAiCardModalOpen}
            onClose={() => setIsAiCardModalOpen(false)}
            deckId={deckId}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default CardListView;