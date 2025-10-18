import React, { useState } from 'react';
import { motion, Variants } from 'framer-motion';
import AddEditCardForm, { FormCardData } from './AddEditCardForm';

interface AddCardModalProps {
  onClose: () => void;
  onAddCard: (cards: Omit<FormCardData, 'key' | 'showTranscription' | 'showExample' | 'showImage'>[]) => void;
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

const AddCardModal: React.FC<AddCardModalProps> = ({ onClose, onAddCard }) => {
  const [isFormValid, setIsFormValid] = useState(false);

  const handleSave = (cards: Omit<FormCardData, 'key' | 'showTranscription' | 'showExample' | 'showImage'>[]) => {
    if (cards.length > 0) {
      onAddCard(cards);
    }
  };
  
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
        onClose();
    }
  }

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
        className="bg-white dark:bg-[#2B2930] rounded-2xl p-6 w-full max-w-lg shadow-xl flex flex-col"
        variants={modalVariants}
      >
        <div className="flex justify-between items-center mb-6 flex-shrink-0">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Tambah Kartu Baru</h2>
            <button
                type="submit"
                form="add-edit-card-form"
                disabled={!isFormValid}
                className="bg-blue-600 dark:bg-blue-400 text-white font-semibold px-4 py-2 rounded-lg transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Simpan
            </button>
        </div>
        <AddEditCardForm onSave={handleSave} onValidationChange={setIsFormValid} />
      </motion.div>
    </motion.div>
  );
};

export default AddCardModal;