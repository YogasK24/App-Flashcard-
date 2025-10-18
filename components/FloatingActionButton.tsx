import React from 'react';
import Icon from './Icon';
import { useCardStore } from '../store/cardStore';

const FloatingActionButton: React.FC = () => {
  const { addDeck } = useCardStore();

  const handleAddDeck = () => {
    // Meminta nama dek baru dari pengguna
    const title = prompt("Masukkan nama dek baru:");
    if (title && title.trim() !== '') {
      addDeck(title.trim());
    }
  };

  return (
    <div className="absolute bottom-6 right-4 flex flex-col-reverse items-end space-y-3 space-y-reverse">
      <button
        onClick={handleAddDeck}
        className="w-16 h-16 bg-[#C8B4F3] rounded-2xl flex items-center justify-center text-black shadow-lg"
        aria-label="Tambah dek baru"
      >
        <Icon name="plus" className="w-8 h-8" />
      </button>
      <button className="px-6 py-3 bg-[#4A4458] rounded-full text-[#E6E1E5] text-base shadow-lg">
        Add word
      </button>
    </div>
  );
};

export default FloatingActionButton;
