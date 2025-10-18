import React from 'react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  deckTitle: string;
  onClose: () => void;
  onConfirm: () => void;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({ isOpen, deckTitle, onClose, onConfirm }) => {
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
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
    >
      <div className="bg-[#2B2930] rounded-2xl p-6 w-full max-w-sm shadow-xl">
        <h2 className="text-xl font-bold text-white mb-4">Konfirmasi Penghapusan</h2>
        <p className="text-[#C8C5CA] mb-6">
          Apakah Anda yakin ingin menghapus "<strong>{deckTitle}</strong>"? Semua dek dan kartu di dalamnya juga akan dihapus secara permanen. Tindakan ini tidak dapat diurungkan.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-full text-[#C8B4F3] font-semibold hover:bg-white/10"
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

export default ConfirmDeleteModal;
