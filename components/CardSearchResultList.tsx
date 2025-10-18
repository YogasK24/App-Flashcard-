import React from 'react';
import { motion } from 'framer-motion';
import { CardSearchResult } from '../App';
import CardSearchResultItem from './CardSearchResultItem';
import Icon from './Icon';

interface CardSearchResultListProps {
  results: CardSearchResult[];
  loading: boolean;
  onItemClick: (result: CardSearchResult) => void;
}

const CardSearchResultList: React.FC<CardSearchResultListProps> = ({ results, loading, onItemClick }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <p className="text-gray-500 dark:text-[#C8C5CA]">Mencari kartu...</p>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-48 text-center text-gray-500 dark:text-[#C8C5CA]">
        <Icon name="search" className="w-16 h-16 mb-4 opacity-50" />
        <h3 className="text-lg font-semibold text-gray-700 dark:text-white">Tidak ada kartu yang ditemukan</h3>
        <p className="mt-1">Coba kata kunci pencarian yang berbeda.</p>
      </div>
    );
  }

  return (
    <motion.div className="space-y-2">
      {results.map((result) => (
        <CardSearchResultItem 
          key={result.card.id} 
          result={result} 
          onItemClick={onItemClick} 
        />
      ))}
    </motion.div>
  );
};

export default CardSearchResultList;
