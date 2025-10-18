import React from 'react';
import { useCardStore } from '../store/cardStore';
import Icon from '../components/Icon';
import PairItPage from './PairItPage';
import GuessItPage from './GuessItPage';
import RecallItPage from './RecallItPage';
import TypeItPage from './TypeItPage';

// Peta untuk merutekan gameType ke komponen yang sesuai
const gameComponents: { [key: string]: React.FC } = {
  'pair-it': PairItPage,
  'guess-it': GuessItPage, 
  'recall-it': RecallItPage,
  'type-it': TypeItPage,
};

const GamePage: React.FC = () => {
  const { gameType, endQuiz } = useCardStore(state => ({
    gameType: state.gameType,
    endQuiz: state.endQuiz,
  }));

  // Pilih komponen permainan yang benar berdasarkan gameType
  const GameComponent = gameType ? gameComponents[gameType] : null;

  if (GameComponent) {
    return <GameComponent />;
  }

  // Fallback jika gameType tidak valid atau belum diimplementasikan
  return (
    <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-[#C8C5CA] p-4 animate-fade-in-slow">
      <Icon name="gamepad" className="w-24 h-24 mb-6 opacity-50 text-red-500" />
      <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
        {gameType ? `Permainan "${gameType}"` : 'Mode Permainan'}
      </h2>
      <p className="mb-8">
        {gameType ? 'Fitur permainan ini sedang dalam pengembangan.' : 'Mode permainan tidak ditemukan.'}
      </p>
      <button
        onClick={endQuiz}
        className="bg-[#C8B4F3] text-[#1C1B1F] font-bold py-3 px-8 rounded-full text-lg"
      >
        Kembali ke Dek
      </button>
    </div>
  );
};

export default GamePage;