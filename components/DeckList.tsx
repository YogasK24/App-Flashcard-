import React from 'react';
import { motion } from 'framer-motion';
import { Deck } from '../types';
import DeckItem from './DeckItem';
import Icon from './Icon';

interface DeckListProps {
  decks: Deck[];
  loading: boolean;
  onItemClick: (deck: Deck) => void;
  onShowContextMenu: (event: React.MouseEvent, deckId: number) => void;
  onPlayClick: (deckId: number) => void;
  openingDeckId: number | null;
  highlightedItemId: number | null;
}

const DeckList: React.FC<DeckListProps> = ({ decks, loading, onItemClick, onShowContextMenu, onPlayClick, openingDeckId, highlightedItemId }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <p className="text-gray-500 dark:text-[#C8C5CA]">Memuat dek...</p>
      </div>
    );
  }

  if (decks.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-48 text-center text-gray-500 dark:text-[#C8C5CA]">
        <Icon name="folder" className="w-16 h-16 mb-4 opacity-50" />
        <h3 className="text-lg font-semibold text-gray-700 dark:text-white">Belum ada dek</h3>
        <p className="mt-1">Ayo buat yang pertama menggunakan tombol + di bawah!</p>
      </div>
    );
  }

  return (
    <motion.div className="space-y-2">
      {decks.map((deck) => (
        <DeckItem 
          key={deck.id} 
          deck={deck} 
          onItemClick={onItemClick} 
          onShowContextMenu={onShowContextMenu} 
          onPlayClick={onPlayClick} 
          openingDeckId={openingDeckId}
          highlightedItemId={highlightedItemId}
        />
      ))}
    </motion.div>
  );
};

export default DeckList;