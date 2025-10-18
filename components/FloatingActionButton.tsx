import React from 'react';
import Icon from './Icon';

interface FloatingActionButtonProps {
  onAdd: () => void;
  text?: string;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ onAdd, text }) => {
  if (text) {
    return (
      <div className="absolute bottom-6 right-4">
        <button
          onClick={onAdd}
          className="h-14 px-6 bg-[#C8B4F3] rounded-2xl flex items-center justify-center text-black shadow-lg hover:bg-[#D8C4F8] transition-all duration-200 ease-in-out hover:scale-105 active:scale-95"
          aria-label={text}
        >
          <Icon name="plus" className="w-6 h-6 mr-2" />
          <span className="font-semibold">{text}</span>
        </button>
      </div>
    );
  }

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