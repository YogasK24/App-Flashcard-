import React from 'react';
import { Deck } from '../types';
import DeckItem from './DeckItem';
import Icon from './Icon';

interface DeckListProps {
  decks: Deck[];
  loading: boolean;
  onNavigate: (deck: Deck) => void;
  onShowContextMenu: (event: React.MouseEvent, deckId: number) => void;
}

const DeckList: React.FC<DeckListProps> = ({ decks, loading, onNavigate, onShowContextMenu }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <p className="text-[#C8C5CA]">Memuat dek...</p>
      </div>
    );
  }

  if (decks.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-48 text-center text-[#C8C5CA]">
        <Icon name="folder" className="w-16 h-16 mb-4 opacity-50" />
        <h3 className="text-lg font-semibold">Belum ada dek</h3>
        <p className="mt-1">Ayo buat yang pertama menggunakan tombol + di bawah!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {decks.map((deck) => (
        <DeckItem key={deck.id} deck={deck} onNavigate={onNavigate} onShowContextMenu={onShowContextMenu} />
      ))}
    </div>
  );
};

export default DeckList;