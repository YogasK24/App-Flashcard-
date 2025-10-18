import React, { useEffect } from 'react';
import Header from './components/Header';
import FilterBar from './components/FilterBar';
import DeckList from './components/DeckList';
import FloatingActionButton from './components/FloatingActionButton';
import { useCardStore } from './store/cardStore';
import Quiz from './pages/Quiz';

function App() {
  const { decks, loading, fetchDecks, quizDeck } = useCardStore(state => ({
    decks: state.decks,
    loading: state.loading,
    fetchDecks: state.fetchDecks,
    quizDeck: state.quizDeck
  }));

  useEffect(() => {
    fetchDecks();
  }, [fetchDecks]);

  const MainScreen = () => (
    <>
      <Header />
      <main className="p-4 space-y-4">
        <FilterBar />
        <DeckList decks={decks} loading={loading} />
      </main>
      <FloatingActionButton />
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
