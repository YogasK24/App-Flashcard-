import React from 'react';

interface QuizControlsProps {
  isFlipped: boolean;
  onShowAnswer: () => void;
  onRate: (feedback: 'lupa' | 'ingat') => void;
  isBlitzMode?: boolean;
  disabled?: boolean;
}

const QuizControls: React.FC<QuizControlsProps> = ({ isFlipped, onShowAnswer, onRate, isBlitzMode = false, disabled = false }) => {
  if (!isFlipped) {
    if (isBlitzMode) {
      return (
        <div className="mt-8 w-full h-[52px] flex items-center justify-center">
          {/* Placeholder or message for when timer is running */}
          <p className="text-sm text-gray-500 dark:text-gray-400 animate-pulse">Waktu berjalan...</p>
        </div>
      );
    }
    return (
      <div className="mt-8 w-full">
        <button
          onClick={onShowAnswer}
          disabled={disabled}
          className="w-full bg-[#C8B4F3] text-[#1C1B1F] font-bold py-3 rounded-full text-lg transition-transform duration-200 ease-in-out hover:scale-105 active:scale-95 disabled:opacity-50 disabled:transform-none"
        >
          Tampilkan Jawaban
        </button>
      </div>
    );
  }

  const baseButtonClass = "text-white font-semibold py-3 rounded-full transition-all duration-200 ease-in-out hover:scale-105 active:scale-95 disabled:opacity-50 disabled:transform-none";

  return (
    <div className="mt-8 w-full grid grid-cols-2 gap-4">
      <button
        onClick={() => onRate('lupa')}
        disabled={disabled}
        className={`${baseButtonClass} bg-red-500/80 hover:bg-red-500`}
      >
        Lupa
      </button>
      <button
        onClick={() => onRate('ingat')}
        disabled={disabled}
        className={`${baseButtonClass} bg-green-500/80 hover:bg-green-500`}
      >
        Ingat
      </button>
    </div>
  );
};

export default QuizControls;
