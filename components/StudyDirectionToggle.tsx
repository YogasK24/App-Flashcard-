
import React from 'react';
import { useThemeStore } from '../store/themeStore';

const StudyDirectionToggle: React.FC = () => {
  const { studyDirection, setStudyDirection } = useThemeStore(state => ({
    studyDirection: state.studyDirection,
    setStudyDirection: state.setStudyDirection,
  }));

  // Kelas dasar untuk kedua tombol, termasuk padding dan transisi
  const baseButtonClasses = "px-3 py-1 rounded-full whitespace-nowrap transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 focus:ring-offset-gray-200";

  return (
    <div className="inline-flex bg-gray-200 dark:bg-[#2B2930] p-1 rounded-full text-sm font-medium flex-shrink-0">
        <button
          onClick={() => setStudyDirection('kanji')}
          className={`
            ${baseButtonClasses} 
            ${studyDirection === 'kanji' 
              ? 'bg-violet-600 text-white shadow-md' // Kelas aktif
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-300/50 dark:hover:bg-white/10' // Kelas non-aktif
            }`
          }
          aria-pressed={studyDirection === 'kanji'}
        >
          日本語(漢字)
        </button>
        <button
          onClick={() => setStudyDirection('katakana')}
          className={`
            ${baseButtonClasses} 
            ${studyDirection === 'katakana' 
              ? 'bg-violet-600 text-white shadow-md' // Kelas aktif
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-300/50 dark:hover:bg-white/10' // Kelas non-aktif
            }`
          }
          aria-pressed={studyDirection === 'katakana'}
        >
          日本語(片仮名)
        </button>
      </div>
  );
};

export default React.memo(StudyDirectionToggle);
