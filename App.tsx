import React, { useState, useEffect } from 'react';
import { Deck } from './types';
import Header from './components/Header';
import FilterBar from './components/FilterBar';
import DeckList from './components/DeckList';
import FloatingActionButton from './components/FloatingActionButton';
import { db } from './services/databaseService';

const App: React.FC = () => {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDecks = async () => {
      try {
        setLoading(true);
        const count = await db.decks.count();
        if (count === 0) {
          // Isi database dengan data awal jika kosong
          const mockDecks: Omit<Deck, 'id'>[] = [
            {
              title: '自動車整備',
              cardCount: 120,
              progress: 75,
              dueCount: 12,
              iconType: 'document',
            },
            {
              title: 'JLPT',
              cardCount: 7039,
              progress: 30,
              dueCount: 0,
              iconType: 'folder',
            },
          ];
          await db.decks.bulkAdd(mockDecks as Deck[]);
        }
        const allDecks = await db.decks.toArray();
        setDecks(allDecks);
      } catch (error) {
        console.error("Gagal mengambil dek:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDecks();
  }, []);

  return (
    <div className="bg-[#141218] min-h-screen text-[#E6E1E5]">
      <div className="max-w-md mx-auto bg-[#1C1B1F] flex flex-col h-screen relative">
        <Header />
        <main className="flex-grow p-4 space-y-4 overflow-y-auto">
          <FilterBar />
          <DeckList decks={decks} loading={loading} />
        </main>
        <FloatingActionButton />
      </div>
    </div>
  );
};

export default App;
