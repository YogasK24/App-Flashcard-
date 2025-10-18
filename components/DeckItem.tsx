import React from 'react';
import { Deck } from '../types';
import Icon from './Icon';
import { useCardStore } from '../store/cardStore';

interface DeckItemProps {
  deck: Deck;
}

const DeckItem: React.FC<DeckItemProps> = ({ deck }) => {
  const startQuiz = useCardStore((state) => state.startQuiz);

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (deck.dueCount > 0) {
      startQuiz(deck.id);
    } else {
      alert("Tidak ada kartu yang perlu diulang di dek ini.");
    }
  };

  return (
    <div className="bg-[#2B2930] p-4 rounded-lg flex items-center space-x-4">
      <Icon name={deck.iconType} className="w-6 h-6 text-[#C8B4F3]" />
      <div className="flex-grow">
        <h3 className="text-[#E6E1E5] font-semibold">{deck.title}</h3>
        <div className="text-xs text-[#948F99] mt-1">
          <span>{deck.cardCount} kartu</span>
          {deck.dueCount > 0 && <span className="ml-2 text-yellow-400">{deck.dueCount} perlu diulang</span>}
        </div>
        <div className="w-full bg-[#4A4458] rounded-full h-1 mt-2">
          <div
            className="bg-[#C8B4F3] h-1 rounded-full"
            style={{ width: `${deck.progress}%` }}
          ></div>
        </div>
      </div>
      <button
        onClick={handlePlay}
        disabled={deck.dueCount === 0}
        className="p-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10"
        aria-label={`Mulai kuis untuk ${deck.title}`}
      >
        <Icon name="play" className="w-6 h-6 text-[#C8B4F3]" />
      </button>
    </div>
  );
};

export default DeckItem;
