import React, { useEffect } from 'react';
import { Card } from '../types';
import { useThemeStore } from '../store/themeStore';
import { speakText } from '../services/ttsService';
import Icon from './Icon';

interface FlashcardProps {
  card: Card;
  isFlipped: boolean;
}

const Flashcard: React.FC<FlashcardProps> = ({ card, isFlipped }) => {
  const { studyDirection } = useThemeStore();

  const frontContent = studyDirection === 'kanji' ? card.front : card.back;
  const backContentMain = studyDirection === 'kanji' ? card.back : card.front;

  useEffect(() => {
    if (isFlipped) {
      // Secara otomatis mengucapkan konten utama bagian belakang saat kartu dibalik
      speakText(backContentMain, 'ja-JP');
    }
  }, [isFlipped, backContentMain]);

  const handlePlaySound = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Gunakan 'ja-JP' karena kontennya adalah Katakana/Kanji
    speakText(backContentMain, 'ja-JP');
  };

  return (
    <div className="w-full h-full max-h-80 perspective-1000">
      <div
        className={`relative w-full h-full transform transition-all duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}
      >
        {/* Depan kartu */}
        <div className="absolute w-full h-full bg-gray-200 dark:bg-[#4A4458] rounded-xl flex items-center justify-center p-6 backface-hidden">
          <p className="text-4xl md:text-5xl font-bold text-center text-gray-900 dark:text-[#E6E1E5]">{frontContent}</p>
        </div>
        {/* Belakang kartu */}
        <div className="absolute w-full h-full bg-gray-100 dark:bg-[#2B2930] rounded-xl flex flex-col justify-center items-center p-6 backface-hidden rotate-y-180 overflow-y-auto">
           <div className="text-center w-full">
            {/* Jawaban Utama dengan Ikon TTS */}
            <div className="flex justify-between items-center w-full max-w-xs mx-auto">
              <p className="text-3xl font-bold text-gray-900 dark:text-[#E6E1E5]">{backContentMain}</p>
              <button 
                  className="p-2 rounded-full text-gray-400 cursor-pointer hover:text-violet-400 dark:hover:text-violet-300 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                  onClick={handlePlaySound}
                  aria-label="Dengarkan pengucapan"
              >
                  <Icon name="volumeUp" className="w-8 h-8" />
              </button>
            </div>

            {/* Separator - hanya tampil jika ada konten lain */}
            {(card.transcription || card.example) && (
              <hr className="w-1/2 mx-auto my-3 border-gray-300 dark:border-gray-700" />
            )}
            
            {/* Transkripsi */}
            {card.transcription && (
              <p className="text-xl font-medium text-gray-700 dark:text-gray-300">[{card.transcription}]</p>
            )}
            
            {/* Contoh Kalimat */}
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