import React, { useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useThemeStore, CardSortOption } from '../store/themeStore';

interface CardSortModalProps {
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

const CardSortModal: React.FC<CardSortModalProps> = ({ isOpen, onClose }) => {
    const { cardSortOption, setCardSortOption } = useThemeStore();

    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
    };

    const OptionButton = ({ label, value, current, setter }: { label: string, value: CardSortOption, current: CardSortOption, setter: (val: CardSortOption) => void }) => (
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
                  key="card-sort-modal-backdrop"
                  onClick={handleBackdropClick}
                  className="fixed inset-0 bg-black/60 flex items-end justify-center z-50"
                  variants={backdropVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                    <motion.div 
                      onClick={(e) => e.stopPropagation()}
                      variants={modalVariants}
                      className="bg-white dark:bg-[#2B2930] pt-3 pb-6 rounded-t-2xl shadow-2xl w-full max-w-md"
                      role="dialog"
                      aria-modal="true"
                      aria-labelledby="card-sort-title"
                    >
                        <div className="w-10 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-4" />
                        <h2 id="card-sort-title" className="text-xl font-bold text-center mb-6 text-gray-900 dark:text-white">Urutkan Kartu</h2>
                        
                        <div className="px-4 space-y-6">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-500 dark:text-[#C8C5CA] mb-3 px-1">URUTKAN BERDASARKAN</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <OptionButton label="Tanggal Dibuat (Baru)" value="date-desc" current={cardSortOption} setter={setCardSortOption} />
                                    <OptionButton label="Tanggal Dibuat (Lama)" value="date-asc" current={cardSortOption} setter={setCardSortOption} />
                                    <OptionButton label="Jatuh Tempo" value="due-date-asc" current={cardSortOption} setter={setCardSortOption} />
                                    <OptionButton label="Depan (A-Z)" value="front-asc" current={cardSortOption} setter={setCardSortOption} />
                                    <OptionButton label="Depan (Z-A)" value="front-desc" current={cardSortOption} setter={setCardSortOption} />
                                    <OptionButton label="Belakang (A-Z)" value="back-asc" current={cardSortOption} setter={setCardSortOption} />
                                    <OptionButton label="Belakang (Z-A)" value="back-desc" current={cardSortOption} setter={setCardSortOption} />
                                </div>
                            </div>
                        </div>

                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

export default CardSortModal;