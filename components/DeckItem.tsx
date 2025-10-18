import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Deck } from '../types';
import Icon from './Icon';

interface DeckItemProps {
  deck: Deck;
  onItemClick: (deck: Deck) => void;
  onShowContextMenu: (event: React.MouseEvent, deckId: number) => void;
  onPlayClick: (deckId: number) => void;
  openingDeckId: number | null;
  highlightedItemId: number | null;
}

const DeckItem: React.FC<DeckItemProps> = ({ deck, onItemClick, onShowContextMenu, onPlayClick, openingDeckId, highlightedItemId }) => {
  const [isFlashing, setIsFlashing] = useState(false);

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const isContainer = deck.type === 'folder';
  const isLoading = openingDeckId === deck.id;
  const isCurrentlyHighlighted = highlightedItemId === deck.id;

  useEffect(() => {
    // Memicu animasi flash saat item ini disorot
    if (isCurrentlyHighlighted) {
      setIsFlashing(true);
      const timer = setTimeout(() => {
        setIsFlashing(false);
      }, 1500); // Durasi flash adalah 1.5 detik

      // Membersihkan timer jika komponen di-unmount atau disorot lagi
      return () => clearTimeout(timer);
    }
  }, [isCurrentlyHighlighted]);

  const handleItemClick = () => {
    onItemClick(deck);
  };
  
  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPlayClick(deck.id);
  };
  
  const highlightClasses = isCurrentlyHighlighted
    ? 'ring-2 ring-violet-500 ring-offset-2 ring-offset-gray-50 dark:ring-offset-[#1C1B1F]' 
    : '';

  // Terapkan kelas flash jika isFlashing true, jika tidak gunakan kelas latar belakang normal
  const flashClasses = isFlashing
    ? 'bg-yellow-400/50 dark:bg-yellow-800/50'
    : 'bg-white dark:bg-[#2B2930]';

  return (
    <motion.div 
      id={`deck-item-${deck.id}`}
      variants={itemVariants}
      onClick={handleItemClick}
      onContextMenu={(e) => {
        e.preventDefault();
        onShowContextMenu(e, deck.id);
      }}
      className={`${flashClasses} p-4 rounded-lg flex items-center space-x-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#3A3841] transition-all duration-300 ease-in-out hover:scale-105 active:scale-95 shadow-sm ${highlightClasses}`}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => (e.key === 'Enter') && handleItemClick()}
    >
      <Icon name={isContainer ? 'folder' : 'document'} className="w-6 h-6 text-[#C8B4F3]" />
      <div className="flex-grow">
        <h3 className="text-gray-900 dark:text-[#E6E1E5] font-semibold">{deck.title}</h3>
        
        <div className="text-xs text-gray-500 dark:text-[#948F99] mt-1">
          <span>{deck.cardCount} kartu</span>
          {deck.dueCount > 0 && <span className="ml-2 text-yellow-500 dark:text-yellow-400">{deck.dueCount} perlu diulang</span>}
        </div>
        
        {!isContainer && (
            <div className="w-full bg-gray-200 dark:bg-[#4A4458] rounded-full h-1 mt-2">
              <div
                className="bg-[#C8B4F3] h-1 rounded-full"
                style={{ width: `${deck.progress}%` }}
              ></div>
            </div>
        )}
      </div>

      <div className="flex items-center flex-shrink-0">
        {isContainer && (
            <div className="p-2" aria-hidden="true">
            <Icon name="chevronRight" className="w-6 h-6 text-gray-400 dark:text-[#948F99]" />
            </div>
        )}
        <button
            onClick={handlePlay}
            disabled={deck.cardCount === 0 || isLoading}
            className="p-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-black/5 dark:hover:bg-white/10 transition-transform duration-200 ease-in-out hover:scale-105 active:scale-95"
            aria-label={`Mulai kuis untuk ${deck.title}`}
        >
            {isLoading ? (
            <Icon name="refresh" className="w-6 h-6 text-[#C8B4F3] animate-spin" />
            ) : (
            <Icon name="play" className="w-6 h-6 text-[#C8B4F3]" />
            )}
        </button>
      </div>
    </motion.div>
  );
};

export default DeckItem;
