import React from 'react';
import Icon from './Icon';
import ThemeToggle from './ThemeToggle';

const Header: React.FC = () => {
  
  return (
    <header className="bg-transparent dark:bg-[#1C1B1F] text-gray-900 dark:text-[#E6E1E5] px-4 pt-4">
      <div className="flex justify-between items-center pb-2">
        <button aria-label="Menu" className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10">
            <Icon name="menu" className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-semibold">Flashcards</h2>
        <div className="flex items-center space-x-2">
            <button aria-label="More options" className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10">
                <Icon name="moreVert" className="w-6 h-6" />
            </button>
            <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default Header;