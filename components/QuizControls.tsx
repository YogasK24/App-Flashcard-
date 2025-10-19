import React from 'react';
import CircularTimerButton from './CircularTimerButton';

interface QuizControlsProps {
  isFlipped: boolean;
  onShowAnswer: () => void;
  onRate: (feedback: 'lupa' | 'ingat') => void;
  isBlitzMode?: boolean;
  disabled?: boolean;
  timerProgress: number;
}

const QuizControls: React.FC<QuizControlsProps> = ({ isFlipped, onShowAnswer, onRate, isBlitzMode = false, disabled = false, timerProgress }) => {
  if (!isFlipped) {
    return (
      <div className="mt-8 w-full flex justify-center h-[96px] items-center">
        <CircularTimerButton
          onClick={onShowAnswer}
          timerProgress={isBlitzMode ? timerProgress : 1}
          disabled={disabled}
        >
          Tampilkan
        </CircularTimerButton>
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