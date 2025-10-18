import React, { useState, useEffect, FormEvent } from 'react';
import { Deck } from '../types';

interface EditDeckModalProps {
  isOpen: boolean;
  deckToEdit: Deck;
  onClose: () => void;
  onSave: (deckId: number, newTitle: string) => void;
}

const EditDeckModal: React.FC<EditDeckModalProps> = ({ isOpen, deckToEdit, onClose, onSave }) => {
  const [title, setTitle] = useState(deckToEdit.title);

  useEffect(() => {
    if (isOpen) {
      setTitle(deckToEdit.title);
    }
  }, [isOpen, deckToEdit.title]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (title.trim() && title.trim() !== deckToEdit.title) {
      onSave(deckToEdit.id, title.trim());
    } else {
      onClose(); // Tutup jika tidak ada perubahan
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
        className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
    >
      <div className="bg-[#2B2930] rounded-2xl p-6 w-full max-w-sm shadow-xl">
        <h2 className="text-xl font-bold text-white mb-6">Ubah Nama</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="deck-title-edit" className="block text-sm font-medium text-[#C8C5CA] mb-2">
              Judul
            </label>
            <input
              type="text"
              id="deck-title-edit"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#4A4458] border border-[#645F73] text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#C8B4F3]"
              required
              autoFocus
              onFocus={(e) => e.target.select()}
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full text-[#C8B4F3] font-semibold hover:bg-white/10"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[#C8B4F3] text-black font-semibold rounded-full disabled:opacity-50"
              disabled={!title.trim()}
            >
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditDeckModal;
