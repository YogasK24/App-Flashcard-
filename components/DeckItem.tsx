
import React from 'react';
import { Deck } from '../types';
import Icon from './Icon';

interface DeckItemProps {
  deck: Deck;
}

const DeckItem: React.FC<DeckItemProps> = ({ deck }) => {
  return (
    <div className="bg-[#2D2C30] p-4 rounded-2xl flex items-center justify-between">
      <div className="flex-grow pr-4">
        <div className="flex items-center space-x-2 text-xs text-[#C8C5CA] mb-1">
          <Icon name={deck.iconType} className="w-4 h-4" />
          <span>{deck.cardCount} kata</span>
        </div>
        <h3 className="text-lg font-medium text-[#E6E1E5]">{deck.title}</h3>
        <div className="flex items-center space-x-2 mt-3">
          <div className="w-full bg-[#4A4458] rounded-full h-2">
            <div
              className="bg-[#A487E1] h-2 rounded-full"
              style={{ width: `${deck.progress}%` }}
            ></div>
          </div>
          <span className="text-xs text-[#C8C5CA]">{deck.progress}%</span>
        </div>
      </div>
      <div className="relative">
        <button
          className="w-16 h-16 bg-[#C8B4F3] rounded-full flex items-center justify-center text-black"
          aria-label={`Mulai belajar dek ${deck.title}`}
        >
          <Icon name="play" className="w-8 h-8 ml-1" />
        </button>
        {deck.dueCount > 0 && (
          <div className="absolute -top-1 -right-1 bg-[#55D484] text-black text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-[#2D2C30]">
            {deck.dueCount}
          </div>
        )}
      </div>
    </div>
  );
};

export default DeckItem;
