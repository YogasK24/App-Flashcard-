import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Deck } from '../types';
import { db } from '../services/databaseService';
import Icon from './Icon';

interface MoveCardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMove: (targetDeckId: number) => void;
  currentDeckId: number;
  selectedCardCount: number;
}

const backdropVariants: Variants = {
  visible: { opacity: 1 },
  hidden: { opacity: 0 },
  exit: { opacity: 0 },
};

const modalVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.2, ease: 'easeOut' } },
  exit: { y: 20, opacity: 0, transition: { duration: 0.2, ease: 'easeIn' } },
};

const MoveCardsModal: React.FC<MoveCardsModalProps> = ({ isOpen, onClose, onMove, currentDeckId, selectedCardCount }) => {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeckId, setSelectedDeckId] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      const fetchDecks = async () => {
        setLoading(true);
        const allDecks = await db.decks.where('type').equals('deck').filter(deck => deck.id !== currentDeckId).toArray();
        setDecks(allDecks);
        setLoading(false);
      };
      fetchDecks();
    }
  }, [isOpen, currentDeckId]);

  const handleConfirmMove = () => {
    if (selectedDeckId !== null) {
      onMove(selectedDeckId);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const filteredDecks = decks.filter(deck =>
    deck.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderDeckList = () => {
    if (loading) {
      return <div className="text-center text-gray-500 dark:text-[#C8C5CA] h-40 flex items-center justify-center">Memuat dek...</div>;
    }
    if (filteredDecks.length === 0) {
      return (
        <div className="text-center text-gray-500 dark:text-[#C8C5CA] h-40 flex items-center justify-center">
          <p>Tidak ada dek tujuan lain yang tersedia.</p>
        </div>
      );
    }
    return (
      <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
        {filteredDecks.map(deck => (
          <button
            key={deck.id}
            onClick={() => setSelectedDeckId(deck.id)}
            className={`w-full text-left flex items-center p-3 rounded-lg transition-colors ${selectedDeckId === deck.id ? 'bg-[#C8B4F3] text-black' : 'hover:bg-gray-100 dark:hover:bg-[#4A4458]'}`}
          >
            <Icon name="document" className="w-5 h-5 mr-3 text-violet-400" />
            <span className="font-semibold text-gray-900 dark:text-[#E6E1E5]">{deck.title}</span>
            {selectedDeckId === deck.id && <Icon name="check" className="w-5 h-5 ml-auto text-black" />}
          </button>
        ))}
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          onClick={handleBackdropClick}
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <motion.div
            onClick={e => e.stopPropagation()}
            className="bg-white dark:bg-[#2B2930] rounded-2xl p-6 w-full max-w-sm shadow-xl"
            variants={modalVariants}
            role="dialog"
            aria-modal="true"
            aria-labelledby="move-cards-modal-title"
          >
            <h2 id="move-cards-modal-title" className="text-xl font-bold text-gray-900 dark:text-white mb-4">Pindahkan {selectedCardCount} Kartu ke...</h2>

            <div className="relative mb-4">
              <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari dek tujuan..."
                className="w-full bg-gray-100 dark:bg-[#4A4458] border border-gray-300 dark:border-[#645F73] text-gray-900 dark:text-white rounded-lg px-3 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-[#C8B4F3]"
                autoFocus
              />
            </div>

            <div className="mb-6">
              {renderDeckList()}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-full text-[#C8B4F3] font-semibold hover:bg-gray-500/10 dark:hover:bg-white/10"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmMove}
                className="px-6 py-2 bg-[#C8B4F3] text-black font-semibold rounded-full disabled:opacity-50"
                disabled={selectedDeckId === null}
              >
                Pindahkan
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MoveCardsModal;
