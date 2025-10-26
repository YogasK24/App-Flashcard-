import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Deck } from '../types';
import { db } from '../services/databaseService';
import Icon from './Icon';

interface TargetDeckSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'single' | 'bulk';
  onDeckSelected?: (deckId: number) => void; // Untuk mode pemilihan tunggal
  onMoveConfirm?: (targetDeckId: number) => void; // Untuk mode pemindahan massal
  currentDeckId?: number; // Kecualikan dek ini dalam mode massal
  selectedCardCount?: number; // Tampilkan ini di judul untuk mode massal
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

const TargetDeckSelectorModal: React.FC<TargetDeckSelectorModalProps> = ({ 
    isOpen, 
    onClose, 
    mode,
    onDeckSelected,
    onMoveConfirm,
    currentDeckId,
    selectedCardCount = 0
}) => {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeckId, setSelectedDeckId] = useState<number | null>(null);

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

  useEffect(() => {
    if (isOpen) {
      const fetchDecks = async () => {
        setLoading(true);
        // Kecualikan dek saat ini jika dalam mode pemindahan massal
        const allDecks = await db.decks.where('type').equals('deck')
          .filter(deck => mode === 'bulk' ? deck.id !== currentDeckId : true)
          .toArray();
        setDecks(allDecks);
        setLoading(false);
      };
      fetchDecks();
    } else {
        // Atur ulang state saat ditutup
        setSearchQuery('');
        setSelectedDeckId(null);
    }
  }, [isOpen, currentDeckId, mode]);

  const handleDeckClick = (deckId: number) => {
    if (mode === 'single' && onDeckSelected) {
      onDeckSelected(deckId);
    } else if (mode === 'bulk') {
      setSelectedDeckId(deckId);
    }
  };

  const handleConfirm = () => {
    if (mode === 'bulk' && onMoveConfirm && selectedDeckId !== null) {
      onMoveConfirm(selectedDeckId);
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

  const modalTitle = mode === 'bulk' 
    ? `Pindahkan ${selectedCardCount} Kartu ke...`
    : "Pilih Dek Tujuan";
  
  const showBackButton = mode === 'single';

  const renderDeckList = () => {
    if (loading) {
      return <div className="text-center text-gray-500 dark:text-[#C8C5CA] h-40 flex items-center justify-center">Memuat dek...</div>;
    }
    if (decks.length === 0) {
      return (
        <div className="text-center text-gray-500 dark:text-[#C8C5CA] h-40 flex flex-col items-center justify-center">
          <p>Tidak ada dek yang ditemukan.</p>
          <p className="text-sm mt-2">{mode === 'bulk' ? 'Tidak ada dek tujuan lain yang tersedia.' : 'Silakan buat dek terlebih dahulu.'}</p>
        </div>
      );
    }
    if (filteredDecks.length === 0) {
      return (
        <div className="text-center text-gray-500 dark:text-[#C8C5CA] h-40 flex items-center justify-center">
          <p>Tidak ada dek yang cocok.</p>
        </div>
      );
    }
    return (
      <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
        {filteredDecks.map(deck => (
          <button
            key={deck.id}
            onClick={() => handleDeckClick(deck.id)}
            className={`w-full text-left flex items-center p-3 rounded-lg transition-colors ${selectedDeckId === deck.id ? 'bg-[#C8B4F3] text-black' : 'hover:bg-gray-100 dark:hover:bg-[#4A4458]'}`}
          >
            <Icon name="document" className="w-5 h-5 mr-3 text-violet-400" />
            <span className="font-semibold text-gray-900 dark:text-[#E6E1E5]">{deck.title}</span>
            {mode === 'bulk' && selectedDeckId === deck.id && <Icon name="check" className="w-5 h-5 ml-auto text-black" />}
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
            aria-labelledby="deck-selector-title"
            >
            <div className="flex items-center mb-4 relative">
                {showBackButton && (
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors absolute left-0" aria-label="Kembali">
                        <Icon name="chevronLeft" className="w-6 h-6" />
                    </button>
                )}
                <h2 id="deck-selector-title" className="text-xl font-bold text-gray-900 dark:text-white text-center w-full">{modalTitle}</h2>
            </div>

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
            
            {mode === 'bulk' && (
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
                        onClick={handleConfirm}
                        className="px-6 py-2 bg-[#C8B4F3] text-black font-semibold rounded-full disabled:opacity-50"
                        disabled={selectedDeckId === null}
                    >
                        Pindahkan
                    </button>
                </div>
            )}
            </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TargetDeckSelectorModal;