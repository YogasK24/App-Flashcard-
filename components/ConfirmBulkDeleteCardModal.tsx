import React, { useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';

interface ConfirmBulkDeleteCardModalProps {
  isOpen: boolean;
  cardCount: number;
  onClose: () => void;
  onConfirm: () => void;
}

const backdropVariants: Variants = {
  visible: { opacity: 1 },
  hidden: { opacity: 0 },
  exit: { opacity: 0 }
};

const modalVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.2, ease: 'easeOut' } },
  exit: { y: 20, opacity: 0, transition: { duration: 0.2, ease: 'easeIn' } }
};

const ConfirmBulkDeleteCardModal: React.FC<ConfirmBulkDeleteCardModalProps> = ({ isOpen, cardCount, onClose, onConfirm }) => {
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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          onClick={handleBackdropClick}
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <motion.div
            onClick={e => e.stopPropagation()}
            className="bg-white dark:bg-[#2B2930] rounded-2xl p-6 w-full max-w-sm shadow-xl"
            variants={modalVariants}
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="bulk-delete-card-modal-title"
            aria-describedby="bulk-delete-card-modal-description"
          >
            <h2 id="bulk-delete-card-modal-title" className="text-xl font-bold text-gray-900 dark:text-white mb-4">Hapus Kartu</h2>
            <p id="bulk-delete-card-modal-description" className="text-gray-600 dark:text-[#C8C5CA] mb-6">
              Apakah Anda yakin ingin menghapus <strong>{cardCount}</strong> kartu yang dipilih? Tindakan ini tidak dapat diurungkan.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-full text-[#C8B4F3] font-semibold hover:bg-gray-500/10 dark:hover:bg-white/10"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className="px-6 py-2 bg-red-600 text-white font-semibold rounded-full hover:bg-red-700 transition-colors"
              >
                Hapus
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmBulkDeleteCardModal;