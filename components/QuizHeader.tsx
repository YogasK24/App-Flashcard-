import React from 'react';
import Icon from './Icon';
import { useCardStore } from '../store/cardStore';

interface QuizHeaderProps {
  currentCardIndex: number;
  totalCards: number;
}

const QuizHeader: React.FC<QuizHeaderProps> = ({ currentCardIndex, totalCards }) => {
  const { quizDeck, endQuiz } = useCardStore(state => ({ quizDeck: state.quizDeck, endQuiz: state.endQuiz }));

  return (
    <header className="flex justify-between items-center w-full mb-4">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-[#E6E1E5]">{quizDeck?.title || 'Kuis'}</h2>
      <div className="flex items-center space-x-4">
        <span className="text-gray-500 dark:text-[#C8C5CA]">{`${currentCardIndex} / ${totalCards}`}</span>
        <button onClick={endQuiz} aria-label="Tutup kuis">
          <Icon name="trash" className="w-6 h-6 text-gray-800 dark:text-[#E6E1E5]" />
        </button>
      </div>
    </header>
  );
};

export default QuizHeader;