import React from 'react';
import Icon from './Icon';
import { useCardStore } from '../store/cardStore';

interface QuizHeaderProps {
  currentCardIndex: number;
  totalCards: number;
  onOpenSettings: () => void;
}

const QuizHeader: React.FC<QuizHeaderProps> = ({ currentCardIndex, totalCards, onOpenSettings }) => {
  const { quizDeck, endQuiz } = useCardStore(state => ({ quizDeck: state.quizDeck, endQuiz: state.endQuiz }));

  return (
    <header className="flex justify-between items-center w-full mb-4">
      {/* Sisi Kiri: Tombol Kembali, Judul & Penghitung */}
      <div className="flex items-center space-x-2 min-w-0">
        <button onClick={endQuiz} aria-label="Kembali ke dek" className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 flex-shrink-0">
          <Icon name="chevronLeft" className="w-6 h-6 text-gray-800 dark:text-[#E6E1E5]" />
        </button>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-[#E6E1E5] truncate">{quizDeck?.title || 'Kuis'}</h2>
        <span className="text-gray-500 dark:text-[#C8C5CA] font-mono text-sm whitespace-nowrap pt-0.5">{`${currentCardIndex} / ${totalCards}`}</span>
      </div>

      {/* Sisi Kanan: Tombol Opsi */}
      <div className="flex items-center flex-shrink-0">
        <button onClick={onOpenSettings} aria-label="Pengaturan" className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10">
          <Icon name="moreVert" className="w-6 h-6 text-gray-800 dark:text-[#E6E1E5]" />
        </button>
      </div>
    </header>
  );
};

export default QuizHeader;