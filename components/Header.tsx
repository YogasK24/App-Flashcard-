import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import Icon from './Icon';
import ThemeToggle from './ThemeToggle';
import SearchScopeToggle from './SearchScopeToggle';

interface HeaderProps {
  isSearchVisible: boolean;
  searchQuery: string;
  onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onToggleSearch: () => void;
  onOpenSortFilter: () => void;
  searchScope: 'all' | 'folder' | 'deck' | 'card';
  onSearchScopeChange: (scope: 'all' | 'folder' | 'deck' | 'card') => void;
  onMenuClick: () => void;
  // Properti baru untuk header yang sadar konteks
  deckId: number | null;
  deckTitle?: string;
  onBack?: () => void;
}

const headerVariants: Variants = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.2, ease: 'easeInOut' } },
  exit: { opacity: 0, y: 20, transition: { duration: 0.2, ease: 'easeInOut' } },
};


const Header: React.FC<HeaderProps> = ({ 
    isSearchVisible, 
    searchQuery, 
    onSearchChange, 
    onToggleSearch, 
    onOpenSortFilter, 
    searchScope, 
    onSearchScopeChange,
    onMenuClick,
    deckId,
    deckTitle,
    onBack
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const iconButtonClasses = "p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors duration-200";
  const isCardListView = deckId !== null;

  useEffect(() => {
    if (isSearchVisible && !isCardListView && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchVisible, isCardListView]);

  const getPlaceholderText = () => {
    switch (searchScope) {
      case 'folder': return "Cari folder...";
      case 'deck': return "Cari dek...";
      case 'card': return "Cari kartu...";
      case 'all':
      default:
        return "Cari di semua...";
    }
  };

  const renderHeaderContent = () => {
    if (isCardListView) {
        return (
            <motion.div
                key="card-list-header"
                variants={headerVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="flex items-center space-x-4 w-full h-[52px]" // Tinggi eksplisit untuk konsistensi
            >
                <button onClick={onBack} className={iconButtonClasses} aria-label="Kembali">
                    <Icon name="chevronLeft" className="w-6 h-6" />
                </button>
                <h2 className="text-xl font-semibold truncate">{deckTitle || 'Memuat...'}</h2>
            </motion.div>
        );
    }
    
    if (isSearchVisible) {
        return (
            <motion.div
                key="search-bar"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="flex flex-col justify-start items-center w-full overflow-hidden"
            >
                <div className="flex justify-between items-center w-full h-[52px]">
                    <button onClick={(e) => { e.stopPropagation(); onToggleSearch(); }} aria-label="Tutup pencarian" className={iconButtonClasses}>
                    <Icon name="chevronLeft" className="w-6 h-6" />
                    </button>
                    <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={onSearchChange}
                    placeholder={getPlaceholderText()}
                    className="flex-grow bg-transparent text-lg mx-2 focus:outline-none"
                    />
                </div>

                <div className="w-full">
                    <SearchScopeToggle
                    currentScope={searchScope}
                    onScopeChange={onSearchScopeChange}
                    />
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            key="default-header"
            variants={headerVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex justify-between items-center w-full h-[52px]" // Tinggi eksplisit untuk konsistensi
        >
            <button onClick={(e) => { e.stopPropagation(); onMenuClick(); }} aria-label="Menu" className={iconButtonClasses}>
                <Icon name="menu" className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-semibold">Flashcards</h2>
            <div className="flex items-center space-x-1">
                <button onClick={(e) => { e.stopPropagation(); onToggleSearch(); }} aria-label="Cari" className={iconButtonClasses}>
                <Icon name="search" className="w-6 h-6" />
                </button>
                <button onClick={(e) => { e.stopPropagation(); onOpenSortFilter(); }} aria-label="Sortir dan filter" className={iconButtonClasses}>
                <Icon name="tune" className="w-6 h-6" />
                </button>
                <ThemeToggle />
            </div>
        </motion.div>
    );
  };

  const searchShadowClass = (isSearchVisible && !isCardListView) ? 'shadow-lg' : '';

  return (
    // Wrapper ini menyediakan placeholder tinggi tetap untuk mencegah konten di bawahnya bergeser.
    <div className="h-[60px] mb-1">
      {/* Header sebenarnya diposisikan secara absolut dan dapat mengubah ketinggian untuk tumpang tindih dengan konten di bawahnya. */}
      {/* Transisi CSS dihapus untuk memberikan kendali penuh pada Framer Motion, mencegah konflik. */}
      <header className={`absolute top-0 left-0 w-full z-20 bg-gray-50 dark:bg-[#1C1B1F] text-gray-900 dark:text-[#E6E1E5] px-2 pt-2 flex items-start ${searchShadowClass}`}>
        <AnimatePresence mode="wait">
          {renderHeaderContent()}
        </AnimatePresence>
      </header>
    </div>
  );
};

export default React.memo(Header);