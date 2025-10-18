import React from 'react';
import { useThemeStore } from '../store/themeStore';

const StudyDirectionToggle: React.FC = () => {
  const { studyDirection, setStudyDirection } = useThemeStore(state => ({
    studyDirection: state.studyDirection,
    setStudyDirection: state.setStudyDirection,
  }));

  // Kelas dasar untuk kedua tombol, termasuk padding dan transisi
  const baseButtonClasses = "px-3 py-1 rounded-full whitespace-nowrap transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-gray-700";

  return (
    <div className="flex items-center justify-center text-sm mb-2 h-9">
      <div className="inline-flex bg-gray-700 p-1 rounded-full text-sm font-medium">
        <button
          onClick={() => setStudyDirection('kanji')}
          className={`
            ${baseButtonClasses} 
            ${studyDirection === 'kanji' 
              ? 'bg-violet-600 text-white shadow-md' // Kelas aktif
              : 'text-gray-300 hover:bg-white/10' // Kelas non-aktif
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
              : 'text-gray-300 hover:bg-white/10' // Kelas non-aktif
            }`
          }
          aria-pressed={studyDirection === 'katakana'}
        >
          日本語(片仮名)
        </button>
      </div>
    </div>
  );
};

export default StudyDirectionToggle;