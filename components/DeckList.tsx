
import React from 'react';
import { Deck } from '../types';
import DeckItem from './DeckItem';

interface DeckListProps {
  decks: Deck[];
}

const DeckList: React.FC<DeckListProps> = ({ decks }) => {
  return (
    <div className="space-y-3">
      {decks.map((deck) => (
        <DeckItem key={deck.id} deck={deck} />
      ))}
    </div>
  );
};

export default DeckList;
