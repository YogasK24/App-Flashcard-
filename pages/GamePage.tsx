import React from 'react';
import { useCardStore } from '../store/cardStore';
import Icon from '../components/Icon';

const gameTitles: { [key: string]: string } = {
  'pair-it': 'Pair It Game',
  'guess-it': 'Guess It Game',
  'recall-it': 'Recall It Game',
  'type-it': 'Type It Game',
};

const GamePage: React.FC = () => {
  const { gameType, quizDeck, endQuiz } = useCardStore(state => ({
    gameType: state.gameType,
    quizDeck: state.quizDeck,
    endQuiz: state.endQuiz,
  }));

  const title = gameType ? gameTitles[gameType] : 'Game Mode';

  return (
    <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-[#C8C5CA] p-4 animate-fade-in-slow">
      <Icon name="play" className="w-24 h-24 mb-6 opacity-50 text-red-500" />
      <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">{title}</h2>
      <p className="mb-4">Mode permainan untuk dek <strong className="text-gray-700 dark:text-white">{quizDeck?.title}</strong>.</p>
      <p className="mb-8">Fitur permainan ini sedang dalam pengembangan.</p>
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