import React from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useThemeStore, SortOption, FilterOption } from '../store/themeStore';

interface SortFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const backdropVariants: Variants = {
  visible: { opacity: 1 },
  hidden: { opacity: 0 },
  exit: { opacity: 0 },
};

const modalVariants: Variants = {
  hidden: { y: "100%", opacity: 0 },
  visible: { 
    y: 0,
    opacity: 1,
    transition: { type: "spring", damping: 30, stiffness: 250 }
  },
  exit: {
    y: "100%",
    opacity: 0,
    transition: { type: "spring", damping: 30, stiffness: 250 }
  }
};

const SortFilterModal: React.FC<SortFilterModalProps> = ({ isOpen, onClose }) => {
    const { sortOption, setSortOption, filterOption, setFilterOption } = useThemeStore();

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
    };

    const OptionButton = ({ label, value, current, setter }: { label: string, value: string, current: string, setter: (val: any) => void }) => (
        <button
            onClick={() => setter(value)}
            className={`w-full px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                current === value
                ? 'bg-[#C8B4F3] text-black shadow-sm'
                : 'bg-gray-200 dark:bg-[#4A4458] text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600/60'
            }`}
        >
            {label}
        </button>
    );

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                  key="sort-filter-backdrop"
                  onClick={handleBackdropClick}
                  className="fixed inset-0 bg-black/60 flex items-end justify-center z-50"
                  aria-modal="true"
                  role="dialog"
                  aria-labelledby="sort-filter-title"
                  variants={backdropVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                    <motion.div 
                      onClick={(e) => e.stopPropagation()}
                      variants={modalVariants}
                      className="bg-white dark:bg-[#2B2930] pt-3 pb-6 rounded-t-2xl shadow-2xl w-full max-w-md"
                    >
                        <div className="w-10 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-4" />
                        <h2 id="sort-filter-title" className="text-xl font-bold text-center mb-6 text-gray-900 dark:text-white">Sortir & Filter</h2>
                        
                        <div className="px-4 space-y-6">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-500 dark:text-[#C8C5CA] mb-3 px-1">SORTIR BERDASARKAN</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <OptionButton label="Terbaru" value="date-desc" current={sortOption} setter={setSortOption} />
                                    <OptionButton label="Terlama" value="date-asc" current={sortOption} setter={setSortOption} />
                                    <OptionButton label="Nama (A-Z)" value="title-asc" current={sortOption} setter={setSortOption} />
                                    <OptionButton label="Nama (Z-A)" value="title-desc" current={sortOption} setter={setSortOption} />
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-semibold text-gray-500 dark:text-[#C8C5CA] mb-3 px-1">TAMPILKAN</h3>
                                <div className="grid grid-cols-3 gap-3">
                                    <OptionButton label="Semua" value="all" current={filterOption} setter={setFilterOption} />
                                    <OptionButton label="Hanya Folder" value="folders" current={filterOption} setter={setFilterOption} />
                                    <OptionButton label="Hanya Dek" value="decks" current={filterOption} setter={setFilterOption} />
                                </div>
                            </div>
                        </div>

                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default SortFilterModal;