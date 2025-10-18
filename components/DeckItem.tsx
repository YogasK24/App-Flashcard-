import React from 'react';
import { Deck } from '../types';
import Icon from './Icon';
import { useCardStore } from '../store/cardStore';

interface DeckItemProps {
  deck: Deck;
  onNavigate: (deck: Deck) => void;
  onShowContextMenu: (event: React.MouseEvent, deckId: number) => void;
}

const DeckItem: React.FC<DeckItemProps> = ({ deck, onNavigate, onShowContextMenu }) => {
  const { startQuiz } = useCardStore(state => ({
    startQuiz: state.startQuiz,
  }));

  const isContainer = deck.type === 'folder';

  const handleItemClick = () => {
    if (isContainer) {
      onNavigate(deck);
    } else {
      // Jika ini adalah dek, mulai kuis jika ada kartu yang jatuh tempo.
      if (deck.dueCount > 0) {
        startQuiz(deck.id);
      } else {
        alert("Tidak ada kartu yang perlu diulang di dek ini.");
      }
    }
  };
  
  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation(); // Mencegah handleItemClick terpicu juga
    if (deck.dueCount > 0) {
      startQuiz(deck.id);
    } else {
      // Seharusnya tidak terjadi karena tombol dinonaktifkan, tetapi sebagai pengaman
      alert("Tidak ada kartu yang perlu diulang di dek ini.");
    }
  };

  return (
    <div 
      onClick={handleItemClick}
      onContextMenu={(e) => {
        e.preventDefault();
        onShowContextMenu(e, deck.id);
      }}
      className="bg-[#2B2930] p-4 rounded-lg flex items-center space-x-4 cursor-pointer hover:bg-[#3A3841] transition-all duration-200 ease-in-out hover:scale-105 active:scale-95"
      role="button"
      tabIndex={0}
      onKeyPress={(e) => (e.key === 'Enter') && handleItemClick()}
    >
      <Icon name={isContainer ? 'folder' : 'document'} className="w-6 h-6 text-[#C8B4F3]" />
      <div className="flex-grow">
        <h3 className="text-[#E6E1E5] font-semibold">{deck.title}</h3>
        {!isContainer && (
          <>
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
          </>
        )}
      </div>
      {isContainer ? (
        <div className="p-2" aria-hidden="true">
          <Icon name="chevronRight" className="w-6 h-6 text-[#948F99]" />
        </div>
      ) : (
        <button
          onClick={handlePlay}
          disabled={deck.dueCount === 0}
          className="p-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-transform duration-200 ease-in-out hover:scale-105 active:scale-95"
          aria-label={`Mulai kuis untuk ${deck.title}`}
        >
          <Icon name="play" className="w-6 h-6 text-[#C8B4F3]" />
        </button>
      )}
    </div>
  );
};

export default DeckItem;