
import React from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import Icon from './Icon';
import ThemeToggle from './ThemeToggle';
import StudyDirectionToggle from './StudyDirectionToggle';

interface HeaderProps {
  onToggleSearch: () => void;
  onOpenSortFilter: () => void;
  onMenuClick: () => void;
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
    onToggleSearch, 
    onOpenSortFilter, 
    onMenuClick,
    deckId,
    deckTitle,
    onBack
}) => {
  const iconButtonClasses = "p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors duration-200";
  const isCardListView = deckId !== null;

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
    
    return (
        <motion.div
            key="default-header"
            variants={headerVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex flex-col justify-start items-center w-full"
        >
            {/* Baris 1: Header Utama */}
            <div className="flex justify-between items-center w-full h-[52px]">
                <button onClick={(e) => { e.stopPropagation(); onMenuClick(); }} aria-label="Menu" className={iconButtonClasses}>
                    <Icon name="menu" className="w-6 h-6" />
                </button>
                <h2 className="text-2xl font-bold">Flashcards</h2>
                <ThemeToggle />
            </div>

            {/* Baris 2: Action Bar */}
            <div className="flex justify-between items-center w-full pb-4">
                <button
                    onClick={(e) => { e.stopPropagation(); onToggleSearch(); }}
                    aria-label="Cari"
                    className={iconButtonClasses}
                >
                    <Icon name="search" className="w-6 h-6" />
                </button>
                <div className="flex-1 flex justify-center">
                    <StudyDirectionToggle />
                </div>
                <button onClick={(e) => { e.stopPropagation(); onOpenSortFilter(); }} aria-label="Sortir dan filter" className={iconButtonClasses}>
                    <Icon name="tune" className="w-6 h-6" />
                </button>
            </div>
        </motion.div>
    );
  };

  const placeholderHeight = isCardListView ? 'h-[60px]' : 'h-[116px]';


  return (
    // Wrapper ini menyediakan placeholder tinggi tetap untuk mencegah konten di bawahnya bergeser.
    <div className={placeholderHeight}>
      {/* Header sebenarnya diposisikan secara absolut dan dapat mengubah ketinggian untuk tumpang tindih dengan konten di bawahnya. */}
      {/* Transisi CSS dihapus untuk memberikan kendali penuh pada Framer Motion, mencegah konflik. */}
      <header className={`absolute top-0 left-0 w-full z-20 bg-gray-50 dark:bg-[#1C1B1F] text-gray-900 dark:text-[#E6E1E5] px-4 pt-2 flex items-start`}>
        <AnimatePresence mode="wait">
          {renderHeaderContent()}
        </AnimatePresence>
      </header>
    </div>
  );
};

export default React.memo(Header);
