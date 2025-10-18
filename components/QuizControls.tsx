import React from 'react';

interface QuizControlsProps {
  isFlipped: boolean;
  onShowAnswer: () => void;
  onRate: (quality: number) => void;
}

const QuizControls: React.FC<QuizControlsProps> = ({ isFlipped, onShowAnswer, onRate }) => {
  if (!isFlipped) {
    return (
      <div className="mt-8 w-full">
        <button
          onClick={onShowAnswer}
          className="w-full bg-[#C8B4F3] text-[#1C1B1F] font-bold py-3 rounded-full text-lg transition-transform duration-200 ease-in-out hover:scale-105 active:scale-95"
        >
          Tampilkan Jawaban
        </button>
      </div>
    );
  }

  const baseButtonClass = "text-white font-semibold py-3 rounded-full transition-all duration-200 ease-in-out hover:scale-105 active:scale-95";

  return (
    <div className="mt-8 w-full grid grid-cols-3 gap-3">
      <button
        onClick={() => onRate(1)}
        className={`${baseButtonClass} bg-red-500/80 hover:bg-red-500`}
      >
        Lagi
      </button>
      <button
        onClick={() => onRate(3)}
        className={`${baseButtonClass} bg-blue-500/80 hover:bg-blue-500`}
      >
        Baik
      </button>
      <button
        onClick={() => onRate(5)}
        className={`${baseButtonClass} bg-green-500/80 hover:bg-green-500`}
      >
        Mudah
      </button>
    </div>
  );
};

export default QuizControls;