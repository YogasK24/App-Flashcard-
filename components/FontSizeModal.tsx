import React, { useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useThemeStore, QuizFontSize } from '../store/themeStore';

interface FontSizeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.3 } },
};

const modalVariants: Variants = {
  hidden: { scale: 0.9, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { duration: 0.2, ease: 'easeOut' } },
  exit: { scale: 0.9, opacity: 0, transition: { duration: 0.2, ease: 'easeOut' } },
};

const FontSizeModal: React.FC<FontSizeModalProps> = ({ isOpen, onClose }) => {
  const { quizFontSize, setQuizFontSize } = useThemeStore();

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

  const options: { label: string; value: QuizFontSize }[] = [
    { label: 'Kecil', value: 'small' },
    { label: 'Sedang', value: 'medium' },
    { label: 'Besar', value: 'large' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="font-size-settings-backdrop"
          onClick={handleBackdropClick}
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <motion.div
            className="bg-white dark:bg-[#2B2930] rounded-2xl p-6 w-full max-w-sm shadow-xl"
            variants={modalVariants}
            role="dialog"
            aria-modal="true"
            aria-labelledby="font-size-modal-title"
          >
            <h2 id="font-size-modal-title" className="text-xl font-bold text-gray-900 dark:text-white mb-6">Pengaturan Ukuran Teks</h2>
            <div className="mb-4">
              <p className="block text-sm font-medium text-gray-600 dark:text-[#C8C5CA] mb-3">
                Ukuran Teks Kartu
              </p>
              <div className="flex justify-between items-center space-x-2">
                {options.map(option => (
                  <button
                    key={option.value}
                    onClick={() => setQuizFontSize(option.value)}
                    className={`
                      w-full px-4 py-3 rounded-xl text-sm font-semibold transition-colors
                      ${quizFontSize === option.value
                        ? 'bg-[#C8B4F3] text-black shadow-sm'
                        : 'bg-gray-200 dark:bg-[#4A4458] text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600/60'
                      }
                    `}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 bg-[#C8B4F3] text-black font-semibold rounded-full"
              >
                Selesai
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FontSizeModal;