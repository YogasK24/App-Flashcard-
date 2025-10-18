import React, { useState } from 'react';
import AddEditCardForm, { FormCardData } from './AddEditCardForm';

interface AddCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCard: (cards: Omit<FormCardData, 'key' | 'showTranscription' | 'showExample' | 'showImage'>[]) => void;
}

const AddCardModal: React.FC<AddCardModalProps> = ({ isOpen, onClose, onAddCard }) => {
  const [isFormValid, setIsFormValid] = useState(false);

  if (!isOpen) {
    return null;
  }

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
    <div 
        onClick={handleBackdropClick}
        className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in-backdrop"
    >
      <div className="bg-white dark:bg-[#2B2930] rounded-2xl p-6 w-full max-w-lg shadow-xl animate-fade-in-content flex flex-col">
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
      </div>
    </div>
  );
};

export default AddCardModal;