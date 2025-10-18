import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../types';
import Icon from './Icon';
import { speakText } from '../services/ttsService';

interface CardListItemProps {
  card: Card;
  onEdit: () => void;
  onDelete: () => void;
  highlightedCardId: number | null;
}

const CardListItem: React.FC<CardListItemProps> = ({ card, onEdit, onDelete, highlightedCardId }) => {
  const [isFlashing, setIsFlashing] = useState(false);

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const isCurrentlyHighlighted = highlightedCardId === card.id;

  useEffect(() => {
    if (isCurrentlyHighlighted) {
      setIsFlashing(true);
      const timer = setTimeout(() => setIsFlashing(false), 1500); // Durasi flash
      return () => clearTimeout(timer);
    }
  }, [isCurrentlyHighlighted]);

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  const handlePlaySound = (e: React.MouseEvent) => {
    e.stopPropagation(); // Mencegah klik memicu navigasi edit
    // Ucapkan teks Kanji (sisi depan)
    speakText(card.front, 'ja-JP');
  };

  const highlightClasses = isCurrentlyHighlighted
    ? 'ring-2 ring-violet-500 ring-offset-2 ring-offset-gray-50 dark:ring-offset-[#1C1B1F] rounded-lg'
    : '';
  const flashClasses = isFlashing
    ? 'bg-yellow-400/50 dark:bg-yellow-800/50 rounded-lg'
    : '';

  return (
    <motion.div
      id={`card-list-item-${card.id!}`}
      variants={itemVariants}
      className={`relative border-b border-gray-200 dark:border-gray-700 transition-colors duration-300 ${flashClasses} ${highlightClasses}`}
      onClick={onEdit}
    >
      <div className="flex items-center py-4 cursor-pointer">
        {/* Separator Vertikal */}
        <div className="bg-blue-500 w-1 h-full absolute left-0 top-0"></div>

        {/* Kolom Kiri (Kanji) */}
        <div className="px-4">
          <p className="text-2xl font-semibold text-gray-800 dark:text-[#E6E1E5]">{card.front}</p>
        </div>

        {/* Kolom Kanan (Detail) */}
        <div className="flex flex-col flex-1 pl-4">
          <p className="text-lg text-gray-800 dark:text-[#E6E1E5]">{card.back}</p>
          {card.transcription && (
            <p className="text-sm text-gray-400 dark:text-gray-500 italic">[{card.transcription}]</p>
          )}
        </div>

        {/* Ikon Aksi */}
        <div className="flex items-center space-x-1 flex-shrink-0 pr-2">
          <button 
              className="p-2 rounded-full text-gray-600 dark:text-[#C8C5CA] hover:bg-black/5 dark:hover:bg-white/10 hover:text-violet-400 dark:hover:text-violet-300 transition-colors" 
              aria-label="Dengarkan pengucapan"
              onClick={handlePlaySound}
          >
            <Icon name="volumeUp" className="w-5 h-5" />
          </button>
          <button onClick={(e) => handleActionClick(e, onDelete)} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10" aria-label="Hapus kartu">
            <Icon name="trash" className="w-5 h-5 text-red-500/80 dark:text-red-400/80" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default React.memo(CardListItem);