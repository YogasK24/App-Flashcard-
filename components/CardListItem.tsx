import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '../types';
import Icon from './Icon';

interface CardListItemProps {
  card: Card;
  onEdit: () => void;
  onDelete: () => void;
}

const CardListItem: React.FC<CardListItemProps> = ({ card, onEdit, onDelete }) => {
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  return (
    <motion.div
      variants={itemVariants}
      className="relative flex items-center py-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer"
      onClick={onEdit}
    >
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
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10" 
            aria-label="Dengarkan pengucapan"
            onClick={(e) => e.stopPropagation()} // Aksi placeholder untuk TTS
        >
          <Icon name="volumeUp" className="w-5 h-5 text-gray-600 dark:text-[#C8C5CA]" />
        </button>
        <button onClick={(e) => handleActionClick(e, onDelete)} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10" aria-label="Hapus kartu">
          <Icon name="trash" className="w-5 h-5 text-red-500/80 dark:text-red-400/80" />
        </button>
      </div>
    </motion.div>
  );
};

export default CardListItem;