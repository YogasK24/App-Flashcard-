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
          className="w-full bg-[#C8B4F3] text-[#1C1B1F] font-bold py-3 rounded-full text-lg"
        >
          Tampilkan Jawaban
        </button>
      </div>
    );
  }

  return (
    <div className="mt-8 w-full grid grid-cols-3 gap-3">
      <button
        onClick={() => onRate(1)}
        className="bg-red-500/50 hover:bg-red-500/70 text-white font-semibold py-3 rounded-full"
      >
        Lagi
      </button>
      <button
        onClick={() => onRate(3)}
        className="bg-blue-500/50 hover:bg-blue-500/70 text-white font-semibold py-3 rounded-full"
      >
        Baik
      </button>
      <button
        onClick={() => onRate(5)}
        className="bg-green-500/50 hover:bg-green-500/70 text-white font-semibold py-3 rounded-full"
      >
        Mudah
      </button>
    </div>
  );
};

export default QuizControls;
