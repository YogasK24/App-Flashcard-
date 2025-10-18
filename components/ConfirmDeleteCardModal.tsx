import React from 'react';

interface ConfirmDeleteCardModalProps {
  isOpen: boolean;
  cardFront: string;
  onClose: () => void;
  onConfirm: () => void;
}

const ConfirmDeleteCardModal: React.FC<ConfirmDeleteCardModalProps> = ({ isOpen, cardFront, onClose, onConfirm }) => {
  if (!isOpen) {
    return null;
  }

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in-backdrop"
    >
      <div className="bg-white dark:bg-[#2B2930] rounded-2xl p-6 w-full max-w-sm shadow-xl animate-fade-in-content">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Hapus Kartu</h2>
        <p className="text-gray-600 dark:text-[#C8C5CA] mb-6">
          Apakah Anda yakin ingin menghapus kartu "<strong>{cardFront}</strong>"? Tindakan ini tidak dapat diurungkan.
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
      </div>
    </div>
  );
};

export default ConfirmDeleteCardModal;