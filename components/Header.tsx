import React from 'react';
import Icon from './Icon';

const Header: React.FC = () => {
  return (
    <header className="bg-[#1C1B1F] text-[#E6E1E5] px-4 pt-4 shadow-md">
      <div className="flex justify-between items-center pb-2">
        <button aria-label="Menu">
            <Icon name="menu" className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-semibold">Flashcards</h2>
        <button aria-label="More options">
            <Icon name="moreVert" className="w-6 h-6" />
        </button>
      </div>
    </header>
  );
};

export default Header;