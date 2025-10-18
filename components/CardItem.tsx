import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '../types';
import Icon from './Icon';

interface CardItemProps {
  card: Card;
  onEdit: () => void;
  onDelete: () => void;
}

const CardItem: React.FC<CardItemProps> = ({ card, onEdit, onDelete }) => {
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div 
      variants={itemVariants}
      className="bg-white dark:bg-[#2B2930] p-4 rounded-lg flex space-x-4 shadow-sm"
    >
      <div className="flex-grow flex flex-col space-y-2">
        <div>
          <h4 className="text-xs text-gray-500 dark:text-[#948F99] mb-1">DEPAN</h4>
          <p className="text-gray-800 dark:text-[#E6E1E5]">{card.front}</p>
        </div>
        <hr className="border-t border-gray-200 dark:border-[#4A4458]" />
        <div>
          <h4 className="text-xs text-gray-500 dark:text-[#948F99] mb-1">BELAKANG</h4>
          <p className="text-gray-800 dark:text-[#E6E1E5]">{card.back}</p>
        </div>
      </div>
      <div className="flex flex-col space-y-2">
        <button onClick={onEdit} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10" aria-label="Ubah kartu">
          <Icon name="edit" className="w-5 h-5 text-gray-600 dark:text-[#C8C5CA]" />
        </button>
        <button onClick={onDelete} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10" aria-label="Hapus kartu">
          <Icon name="trash" className="w-5 h-5 text-red-500/80 dark:text-red-400/80" />
        </button>
      </div>
    </motion.div>
  );
};

export default CardItem;