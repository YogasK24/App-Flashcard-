import React from 'react';

interface FlashcardProps {
  front: string;
  back: string;
  isFlipped: boolean;
}

const Flashcard: React.FC<FlashcardProps> = ({ front, back, isFlipped }) => {
  return (
    <div className="w-full h-64 perspective-1000">
      <div
        className={`relative w-full h-full transition-transform duration-700 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}
      >
        {/* Depan kartu */}
        <div className="absolute w-full h-full bg-[#4A4458] rounded-xl flex items-center justify-center p-6 backface-hidden">
          <p className="text-2xl text-center text-[#E6E1E5]">{front}</p>
        </div>
        {/* Belakang kartu */}
        <div className="absolute w-full h-full bg-[#2B2930] rounded-xl flex items-center justify-center p-6 backface-hidden rotate-y-180">
          <p className="text-2xl text-center text-[#E6E1E5]">{back}</p>
        </div>
      </div>
    </div>
  );
};

export default Flashcard;
