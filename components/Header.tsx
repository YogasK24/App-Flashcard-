import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import Icon from './Icon';
import ThemeToggle from './ThemeToggle';

interface HeaderProps {
  isSearchVisible: boolean;
  searchQuery: string;
  onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onToggleSearch: () => void;
  onOpenSortFilter: () => void;
}

const motionVariants: Variants = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.2, ease: 'easeInOut' } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2, ease: 'easeInOut' } },
};


const Header: React.FC<HeaderProps> = ({ isSearchVisible, searchQuery, onSearchChange, onToggleSearch, onOpenSortFilter }) => {
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchVisible && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchVisible]);

  return (
    <header className="bg-transparent dark:bg-[#1C1B1F] text-gray-900 dark:text-[#E6E1E5] px-2 pt-4 mb-1 h-[60px] flex items-center">
      <AnimatePresence mode="wait">
        {isSearchVisible ? (
          <motion.div
            key="search-bar"
            variants={motionVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex justify-between items-center w-full"
          >
            <button onClick={onToggleSearch} aria-label="Tutup pencarian" className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10">
              <Icon name="chevronLeft" className="w-6 h-6" />
            </button>
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={onSearchChange}
              placeholder="Cari dek..."
              className="flex-grow bg-transparent text-lg mx-2 focus:outline-none"
            />
          </motion.div>
        ) : (
          <motion.div
            key="default-header"
            variants={motionVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex justify-between items-center w-full"
          >
            <button aria-label="Menu" className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10">
              <Icon name="menu" className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-semibold">Flashcards</h2>
            <div className="flex items-center space-x-1">
              <button onClick={onToggleSearch} aria-label="Cari" className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10">
                <Icon name="search" className="w-6 h-6" />
              </button>
              <button onClick={onOpenSortFilter} aria-label="Sortir dan filter" className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10">
                <Icon name="tune" className="w-6 h-6" />
              </button>
              <ThemeToggle />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;