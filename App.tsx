import React, { useState } from 'react';
import { Deck } from './types';
import Header from './components/Header';
import FilterBar from './components/FilterBar';
import DeckList from './components/DeckList';
import FloatingActionButton from './components/FloatingActionButton';

// Data mock untuk meniru data yang akan datang dari database
const mockDecks: Deck[] = [
  {
    id: 1,
    title: '自動車整備',
    cardCount: 120,
    progress: 75,
    dueCount: 12,
    iconType: 'document',
  },
  {
    id: 2,
    title: 'JLPT',
    cardCount: 7039,
    progress: 30,
    dueCount: 0,
    iconType: 'folder',
  },
];

const App: React.FC = () => {
  const [decks, setDecks] = useState<Deck[]>(mockDecks);

  return (
    <div className="bg-[#141218] min-h-screen text-[#E6E1E5]">
      <div className="max-w-md mx-auto bg-[#1C1B1F] flex flex-col h-screen relative">
        <Header />
        <main className="flex-grow p-4 space-y-4 overflow-y-auto">
          <FilterBar />
          <DeckList decks={decks} />
        </main>
        <FloatingActionButton />
      </div>
    </div>
  );
};

export default App;