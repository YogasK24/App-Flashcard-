import React from 'react';
import Icon from './Icon';

interface FloatingActionButtonProps {
  onAdd: () => void;
  text?: string;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ onAdd, text }) => {
  const hasText = !!text;

  return (
    <div className="absolute bottom-6 right-4">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onAdd();
        }}
        className={`
          flex items-center justify-center 
          bg-[#C8B4F3] text-black 
          rounded-2xl shadow-lg 
          transition-all duration-300 ease-in-out 
          hover:bg-[#D8C4F8] hover:scale-105 active:scale-95
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#1C1B1F] focus:ring-[#C8B4F3]
          ${hasText ? 'h-14 pl-4 pr-6' : 'w-16 h-16'}
        `}
        aria-label={text || "Tambah item baru"}
      >
        <Icon name="plus" className={`transition-transform duration-300 ${hasText ? 'w-6 h-6' : 'w-8 h-8'}`} />
        <span 
          className={`
            font-semibold whitespace-nowrap overflow-hidden
            transition-all duration-300 ease-in-out
            ${hasText ? 'ml-2 max-w-[200px] opacity-100' : 'ml-0 max-w-0 opacity-0'}
          `}
        >
          {text}
        </span>
      </button>
    </div>
  );
};

export default FloatingActionButton;