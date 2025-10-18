
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCardStore } from '../store/cardStore';
import { Card, Deck } from '../types';
import Icon from './Icon';
import CardListItem from './CardListItem';
import FloatingActionButton from './FloatingActionButton';
import AddCardModal from './AddCardModal';
import { FormCardData } from './AddEditCardForm';

interface CardListViewProps {
  deckId: number;
  onBack: () => void;
  refreshKey: number;
  onEditCard: (card: Card) => void;
  onDeleteCard: (card: Card) => void;
  cardIdToHighlight: number | null;
  onHighlightDone: () => void;
}

const CardListView: React.FC<CardListViewProps> = ({ deckId, onBack, refreshKey, onEditCard, onDeleteCard, cardIdToHighlight, onHighlightDone }) => {
  const { getDeckById, getCardsByDeckId, addCardToDeck } = useCardStore(state => ({
    getDeckById: state.getDeckById,
    getCardsByDeckId: state.getCardsByDeckId,
    addCardToDeck: state.addCardToDeck,
  }));

  const [deck, setDeck] = useState<Deck | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const fetchedDeck = await getDeckById(deckId);
    const fetchedCards = await getCardsByDeckId(deckId);
    setDeck(fetchedDeck || null);
    setCards(fetchedCards);
    setLoading(false);
  }, [deckId, getDeckById, getCardsByDeckId]);

  useEffect(() => {
    fetchData();
  }, [fetchData, refreshKey]);

  useEffect(() => {
    if (cardIdToHighlight !== null) {
      // Tunggu hingga DOM diperbarui setelah navigasi folder
      const timer = setTimeout(() => {
        const element = document.getElementById(`card-list-item-${cardIdToHighlight}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Hapus sorotan setelah beberapa saat
          const highlightTimer = setTimeout(() => {
            onHighlightDone();
          }, 2500); // Sorot selama 2.5 detik
          return () => clearTimeout(highlightTimer);
        } else {
          // Jika elemen tidak ditemukan, hapus saja sorotan
          onHighlightDone();
        }
      }, 150); // Penundaan singkat untuk rendering

      return () => clearTimeout(timer);
    }
  }, [cardIdToHighlight, cards, onHighlightDone]);

  const handleAddCard = async (cardsToAdd: Omit<FormCardData, 'key' | 'showTranscription' | 'showExample' | 'showImage'>[]) => {
    for (const card of cardsToAdd) {
        // TODO: Implement image upload and get URL
        await addCardToDeck(
            deckId,
            card.front,
            card.back,
            card.transcription || undefined,
            card.example || undefined,
            undefined // imageUrl
        );
    }
    setIsAddCardModalOpen(false);
    await fetchData(); // Muat ulang daftar kartu
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05, // Sedikit lebih cepat untuk kartu
        delayChildren: 0.1,
      },
    },
  };

  const hasCards = !loading && cards.length > 0;

  return (
    <div className="flex flex-col flex-1 min-h-0 animate-fade-in-slow relative">
      <main className={`flex-grow transition-all duration-300 ease-in-out ${hasCards ? 'px-4 overflow-y-auto pb-20' : 'flex flex-col items-center justify-center p-4'}`}>
        {loading ? (
          <div className="text-center text-gray-500 dark:text-[#C8C5CA]">Memuat kartu...</div>
        ) : hasCards ? (
          <motion.div
            key={deckId}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {cards.map(card => (
              <CardListItem 
                key={card.id} 
                card={card} 
                onEdit={() => onEditCard(card)}
                onDelete={() => onDeleteCard(card)}
                highlightedCardId={cardIdToHighlight}
              />
            ))}
          </motion.div>
        ) : (
          <div className="flex flex-col items-center text-center text-gray-500 dark:text-[#C8C5CA]">
            <Icon name="document" className="w-16 h-16 mb-4 opacity-50" />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Belum ada kartu</h3>
            <p className="mt-1">Ayo buat yang pertama menggunakan tombol di bawah!</p>
          </div>
        )}
      </main>
      <FloatingActionButton 
        onAdd={() => setIsAddCardModalOpen(true)}
        text="Tambah Kartu"
      />
      <AnimatePresence>
        {isAddCardModalOpen && (
          <AddCardModal
            key="add-card-modal"
            onClose={() => setIsAddCardModalOpen(false)}
            onAddCard={handleAddCard}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default CardListView;
