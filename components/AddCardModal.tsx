import React, { useState, FormEvent } from 'react';

interface AddCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCard: (front: string, back: string) => void;
}

const AddCardModal: React.FC<AddCardModalProps> = ({ isOpen, onClose, onAddCard }) => {
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');

  if (!isOpen) {
    return null;
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (front.trim() && back.trim()) {
      onAddCard(front.trim(), back.trim());
      setFront(''); // Reset form
      setBack('');
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
      <div className="bg-white dark:bg-[#2B2930] rounded-2xl p-6 w-full max-w-sm shadow-xl animate-fade-in-content">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Tambah Kartu Baru</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="card-front" className="block text-sm font-medium text-gray-600 dark:text-[#C8C5CA] mb-2">
              Depan
            </label>
            <textarea
              id="card-front"
              value={front}
              onChange={(e) => setFront(e.target.value)}
              className="w-full bg-gray-100 dark:bg-[#4A4458] border border-gray-300 dark:border-[#645F73] text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#C8B4F3] h-24 resize-none"
              placeholder="e.g., こんにちは"
              required
              autoFocus
            />
          </div>

          <div className="mb-6">
            <label htmlFor="card-back" className="block text-sm font-medium text-gray-600 dark:text-[#C8C5CA] mb-2">
              Belakang
            </label>
             <textarea
              id="card-back"
              value={back}
              onChange={(e) => setBack(e.target.value)}
              className="w-full bg-gray-100 dark:bg-[#4A4458] border border-gray-300 dark:border-[#645F73] text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#C8B4F3] h-24 resize-none"
              placeholder="e.g., Halo"
              required
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full text-[#C8B4F3] font-semibold hover:bg-gray-500/10 dark:hover:bg-white/10"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[#C8B4F3] text-black font-semibold rounded-full disabled:opacity-50"
              disabled={!front.trim() || !back.trim()}
            >
              Tambah
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCardModal;