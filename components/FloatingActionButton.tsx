import React from 'react';
import Icon from './Icon';

interface FloatingActionButtonProps {
  onAdd: () => void;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ onAdd }) => {
  return (
    <div className="absolute bottom-6 right-4">
      <button
        onClick={onAdd}
        className="w-16 h-16 bg-[#C8B4F3] rounded-2xl flex items-center justify-center text-black shadow-lg hover:bg-[#D8C4F8] transition-all duration-200 ease-in-out hover:scale-105 active:scale-95"
        aria-label="Tambah item baru"
      >
        <Icon name="plus" className="w-8 h-8" />
      </button>
    </div>
  );
};

export default FloatingActionButton;