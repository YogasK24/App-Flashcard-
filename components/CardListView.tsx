import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
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
}

const CardListView: React.FC<CardListViewProps> = ({ deckId, onBack, refreshKey, onEditCard, onDeleteCard }) => {
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

  return (
    <div className="flex flex-col h-full animate-fade-in-slow relative">
      <header className="p-4 flex items-center space-x-4">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10" aria-label="Kembali">
          <Icon name="chevronLeft" className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-semibold">{deck?.title || 'Memuat...'}</h2>
      </header>
      <main className="flex-grow px-4 overflow-y-auto pb-20">
        {loading ? (
          <div className="text-center text-gray-500 dark:text-[#C8C5CA]">Memuat kartu...</div>
        ) : cards.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-48 text-center text-gray-500 dark:text-[#C8C5CA]">
            <Icon name="document" className="w-16 h-16 mb-4 opacity-50" />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Belum ada kartu</h3>
            <p className="mt-1">Ayo buat yang pertama menggunakan tombol di bawah!</p>
          </div>
        ) : (
          <motion.div
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
              />
            ))}
          </motion.div>
        )}
      </main>
      <FloatingActionButton 
        onAdd={() => setIsAddCardModalOpen(true)}
        text="Tambah Kartu"
      />
      <AddCardModal
        isOpen={isAddCardModalOpen}
        onClose={() => setIsAddCardModalOpen(false)}
        onAddCard={handleAddCard}
      />
    </div>
  );
};

export default CardListView;