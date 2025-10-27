import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import Icon from './Icon';
import { GeneratedCard } from './AICardInputModal';

interface VocabPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  cardsToPreview: GeneratedCard[];
  onSave: (cards: GeneratedCard[]) => void;
  targetDeckTitle: string;
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

// Varian animasi untuk kontainer daftar dan item-itemnya
const listContainerVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: 'easeOut',
        staggerChildren: 0.05,
      },
    },
};
  
const listItemVariants: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
};

const VocabPreviewModal: React.FC<VocabPreviewModalProps> = ({
  isOpen,
  onClose,
  cardsToPreview,
  onSave,
  targetDeckTitle,
}) => {
  const [cards, setCards] = useState<GeneratedCard[]>(cardsToPreview);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            onClose();
        }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
        document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Sinkronkan state internal saat props berubah
  useEffect(() => {
    setCards(cardsToPreview);
  }, [cardsToPreview]);

  const handleRemoveCard = (cardToRemove: GeneratedCard) => {
    setCards(prev => prev.filter(card => card.kanji !== cardToRemove.kanji));
  };

  const handleSaveClick = () => {
    onSave(cards);
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="vocab-preview-modal-backdrop"
          onClick={handleBackdropClick}
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <motion.div
            onClick={e => e.stopPropagation()}
            className="bg-white dark:bg-[#2B2930] rounded-2xl w-full max-w-lg shadow-xl flex flex-col h-full max-h-[90vh]"
            variants={modalVariants}
            role="dialog"
            aria-modal="true"
            aria-labelledby="preview-modal-title"
          >
            {/* Header telah dihapus */}

            {/* Content List: Padding disesuaikan untuk memulai dari atas */}
            <div className="flex-grow p-6 pt-4 overflow-y-auto">
              {/* Menampilkan Nama Deck di sini */}
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  Target: <span className="font-semibold text-gray-800 dark:text-white">{targetDeckTitle}</span>
              </p>
              
              <AnimatePresence mode="wait">
                {cards.length > 0 ? (
                  <motion.div
                      key="card-list"
                      className="space-y-2"
                      variants={listContainerVariants}
                      initial="hidden"
                      animate="visible"
                  >
                      <AnimatePresence>
                      {cards.map((card, index) => (
                      <motion.div
                          layout
                          key={card.kanji + index}
                          variants={listItemVariants}
                          exit="exit"
                          className="bg-gray-100 dark:bg-[#4A4458]/40 p-3 rounded-lg flex items-center"
                      >
                          <div className="flex-grow min-w-0">
                          <p className="text-2xl font-semibold text-gray-800 dark:text-[#E6E1E5] truncate">{card.kanji}</p>
                          <div className="text-sm text-gray-600 dark:text-[#C8C5CA] mt-1 flex items-center flex-wrap">
                              <span className="truncate">{card.katakana}</span>
                              <span className="mx-2 text-gray-400 dark:text-gray-500">/</span>
                              <span className="italic truncate">{card.transcription}</span>
                          </div>
                          </div>
                          <button
                          onClick={() => handleRemoveCard(card)}
                          className="ml-2 p-2 rounded-full text-gray-500 hover:bg-red-100 dark:hover:bg-red-900/50 hover:text-red-600 dark:hover:text-red-400 transition-colors flex-shrink-0"
                          aria-label="Hapus kartu ini"
                          >
                          <Icon name="trash" className="w-5 h-5" />
                          </button>
                      </motion.div>
                      ))}
                      </AnimatePresence>
                  </motion.div>
                ) : (
                  <motion.div
                      key="empty-state"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-10 text-gray-500 dark:text-gray-400"
                  >
                      <p>Tidak ada kartu yang akan ditambahkan.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
              <button type="button" onClick={onClose} className="px-4 py-2 rounded-full text-[#C8B4F3] font-semibold hover:bg-gray-500/10 dark:hover:bg-white/10">
                Batal
              </button>
              <button
                onClick={handleSaveClick}
                disabled={cards.length === 0}
                className="px-6 py-2 bg-[#C8B4F3] text-black font-semibold rounded-full disabled:opacity-50 flex items-center justify-center min-w-[150px]"
              >
                Simpan {cards.length} Kartu
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default VocabPreviewModal;