import React, { useState, useEffect } from 'react';
import { motion, Variants } from 'framer-motion';
import { Deck } from '../types';
import Icon from './Icon';

interface MoveDeckModalProps {
  deckToMoveId: number;
  onClose: () => void;
  onMove: (deckId: number, newParentId: number | null) => void;
  getPossibleParents: (deckId: number) => Promise<Deck[]>;
}

const backdropVariants: Variants = {
  visible: { opacity: 1 },
  hidden: { opacity: 0 },
  exit: { opacity: 0 }
};

const modalVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.2, ease: 'easeOut' } },
  exit: { y: 20, opacity: 0, transition: { duration: 0.2, ease: 'easeIn' } }
};

const MoveDeckModal: React.FC<MoveDeckModalProps> = ({ deckToMoveId, onClose, onMove, getPossibleParents }) => {
  const [possibleParents, setPossibleParents] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedParentId, setSelectedParentId] = useState<number | null | undefined>(undefined);

  useEffect(() => {
    const fetchParents = async () => {
      setLoading(true);
      const parents = await getPossibleParents(deckToMoveId);
      setPossibleParents(parents);
      setLoading(false);
    };
    fetchParents();
  }, [deckToMoveId, getPossibleParents]);

  const handleConfirmMove = () => {
    if (selectedParentId !== undefined) {
      onMove(deckToMoveId, selectedParentId);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  
  const renderParentList = () => {
    if (loading) {
      return <div className="text-center text-gray-500 dark:text-[#C8C5CA]">Memuat folder...</div>;
    }

    return (
        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {/* Opsi untuk pindah ke root */}
            <button
            onClick={() => setSelectedParentId(null)}
            className={`w-full text-left flex items-center p-3 rounded-lg transition-colors ${selectedParentId === null ? 'bg-[#C8B4F3] text-black' : 'hover:bg-gray-100 dark:hover:bg-[#4A4458]'}`}
            >
            <Icon name="folder" className="w-5 h-5 mr-3" />
            <span className="font-semibold">Folder Utama</span>
            </button>

            {/* Daftar folder tujuan */}
            {possibleParents.map(deck => (
            <button
                key={deck.id}
                onClick={() => setSelectedParentId(deck.id)}
                className={`w-full text-left flex items-center p-3 rounded-lg transition-colors ${selectedParentId === deck.id ? 'bg-[#C8B4F3] text-black' : 'hover:bg-gray-100 dark:hover:bg-[#4A4458]'}`}
            >
                <Icon name="folder" className="w-5 h-5 mr-3" />
                <span className="font-semibold">{deck.title}</span>
            </button>
            ))}
      </div>
    );
  }

  return (
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
      >
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Pindahkan ke...</h2>
        
        <div className="mb-6">
          {renderParentList()}
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
            disabled={selectedParentId === undefined}
          >
            Pindahkan
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default MoveDeckModal;