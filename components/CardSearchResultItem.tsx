import React from 'react';
import { motion } from 'framer-motion';
import { CardSearchResult } from '../App';
import Icon from './Icon';

interface CardSearchResultItemProps {
  result: CardSearchResult;
  onItemClick: (result: CardSearchResult) => void;
}

const CardSearchResultItem: React.FC<CardSearchResultItemProps> = ({ result, onItemClick }) => {
    const { card, deck } = result;
    
    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onItemClick(result);
        }
    };

    return (
        <motion.div
            variants={itemVariants}
            onClick={() => onItemClick(result)}
            className="bg-white dark:bg-[#2B2930] p-4 rounded-lg flex flex-col space-y-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-[#3A3841] transition-colors duration-200 shadow-sm"
            role="button"
            tabIndex={0}
            onKeyPress={handleKeyPress}
            aria-label={`Buka kartu: ${card.front}, dari dek: ${deck.title}`}
        >
            <div className="flex items-start justify-between">
                <p className="font-semibold text-lg text-gray-900 dark:text-[#E6E1E5]">{card.front}</p>
                <div className="flex items-center text-xs text-gray-500 dark:text-[#948F99] bg-gray-200 dark:bg-[#4A4458] px-2 py-1 rounded-full whitespace-nowrap">
                    <Icon name="document" className="w-3 h-3 mr-1.5 flex-shrink-0" />
                    <span className="truncate">{deck.title}</span>
                </div>
            </div>
            <p className="text-gray-600 dark:text-[#C8C5CA]">{card.back}</p>
        </motion.div>
    );
};

export default CardSearchResultItem;