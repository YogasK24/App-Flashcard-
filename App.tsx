import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import FilterBar from './components/FilterBar';
import DeckList from './components/DeckList';
import FloatingActionButton from './components/FloatingActionButton';
import { useCardStore } from './store/cardStore';
import Quiz from './pages/Quiz';
import Breadcrumbs from './components/Breadcrumbs';
import { Deck } from './types';
import AddDeckModal from './components/AddDeckModal';

function App() {
  const { quizDeck, getDecksByParentId, addDeck: addDeckToDb } = useCardStore(state => ({
    quizDeck: state.quizDeck,
    getDecksByParentId: state.getDecksByParentId,
    addDeck: state.addDeck
  }));

  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentParentId, setCurrentParentId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchAndSetDecks = useCallback(async () => {
    setLoading(true);
    const fetchedDecks = await getDecksByParentId(currentParentId);
    setDecks(fetchedDecks);
    setLoading(false);
  }, [currentParentId, getDecksByParentId]);

  useEffect(() => {
    fetchAndSetDecks();
  }, [fetchAndSetDecks]);

  const handleNavigateTo = (deck: Deck) => {
    setCurrentParentId(deck.id);
  };
  
  const handleAddDeck = async (title: string, type: 'document' | 'folder') => {
    await addDeckToDb(title, type, currentParentId);
    await fetchAndSetDecks();
    setIsModalOpen(false); // Tutup modal setelah penambahan
  };

  const MainScreen = () => (
    <>
      <Header />
      <main className="p-4 space-y-4">
        <Breadcrumbs currentDeckId={currentParentId} onNavigate={setCurrentParentId} />
        <FilterBar />
        <DeckList decks={decks} loading={loading} onNavigate={handleNavigateTo} />
      </main>
      <FloatingActionButton onAdd={() => setIsModalOpen(true)} />
      <AddDeckModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddDeck}
      />
    </>
  );

  return (
    <div className="bg-[#1C1B1F] min-h-screen text-[#E6E1E5] font-sans relative">
      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .rotate-y-180 { transform: rotateY(180deg); }
        .backface-hidden { backface-visibility: hidden; }
      `}</style>
      
      {quizDeck ? <Quiz /> : <MainScreen />}
    </div>
  );
}

export default App;