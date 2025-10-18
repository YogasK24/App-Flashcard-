import React from 'react';
import { Card } from '../types';

interface FlashcardProps {
  card: Card;
  isFlipped: boolean;
}

const Flashcard: React.FC<FlashcardProps> = ({ card, isFlipped }) => {
  return (
    <div className="w-full h-full max-h-80 perspective-1000">
      <div
        className={`relative w-full h-full transform transition-all duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}
      >
        {/* Depan kartu */}
        <div className="absolute w-full h-full bg-gray-200 dark:bg-[#4A4458] rounded-xl flex items-center justify-center p-6 backface-hidden">
          <p className="text-4xl md:text-5xl font-bold text-center text-gray-900 dark:text-[#E6E1E5]">{card.front}</p>
        </div>
        {/* Belakang kartu */}
        <div className="absolute w-full h-full bg-gray-100 dark:bg-[#2B2930] rounded-xl flex flex-col justify-center items-center p-6 backface-hidden rotate-y-180 overflow-y-auto">
           <div className="text-center w-full">
            {/* Katakana/Back (Side B 1) */}
            <p className="text-xl font-bold text-dark-400 dark:text-gray-500">{card.back}</p>

            {/* Separator */}
            <hr className="w-1/2 mx-auto my-3 border-gray-300 dark:border-gray-700" />
            
            {/* Transcription (Side B 2) */}
            {card.transcription && (
              <p className="text-2xl font-medium text-gray-900 dark:text-[#E6E1E5]">[{card.transcription}]</p>
            )}
            
            {/* Example Sentence (Side B 3 - Italic) */}
            {card.example && (
              <p className="text-lg italic text-gray-500 dark:text-gray-400 mt-2 whitespace-pre-wrap">
                {card.example}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Flashcard;