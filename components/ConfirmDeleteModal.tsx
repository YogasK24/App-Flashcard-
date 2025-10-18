import React from 'react';
import { motion, Variants } from 'framer-motion';

interface ConfirmDeleteModalProps {
  deckTitle: string;
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

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({ deckTitle, onClose, onConfirm }) => {
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
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
      >
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Konfirmasi Penghapusan</h2>
        <p className="text-gray-600 dark:text-[#C8C5CA] mb-6">
          Apakah Anda yakin ingin menghapus "<strong>{deckTitle}</strong>"? Semua dek dan kartu di dalamnya juga akan dihapus secara permanen. Tindakan ini tidak dapat diurungkan.
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
  );
};

export default ConfirmDeleteModal;