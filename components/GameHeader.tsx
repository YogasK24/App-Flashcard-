import React from 'react';
import { motion } from 'framer-motion';
import Icon from './Icon';
import { useCardStore } from '../store/cardStore';
import { useThemeStore } from '../store/themeStore';
import HorizontalTimerBar from './HorizontalTimerBar';

interface GameHeaderProps {
  modeTitle: string;
  currentIndex: number;
  totalCards: number;
  progress?: number;
  boxInfo?: string;
  onOpenFontSizeSettings?: () => void;
  onOpenTimerSettings?: () => void;
  timerProgress?: number;
  showTimerBar?: boolean;
}

const GameHeader: React.FC<GameHeaderProps> = ({ 
    modeTitle, 
    currentIndex, 
    totalCards,
    progress,
    boxInfo,
    onOpenFontSizeSettings, 
    onOpenTimerSettings,
    timerProgress,
    showTimerBar
}) => {
  const { endQuiz } = useCardStore(state => ({ endQuiz: state.endQuiz }));
  const { isTTSMuted, toggleTTSMute } = useThemeStore(state => ({ isTTSMuted: state.isTTSMuted, toggleTTSMute: state.toggleTTSMute }));

  const baseIconButtonClasses = "p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors duration-200";
  const defaultIconTextColor = "text-gray-800 dark:text-[#E6E1E5]";
  const mutedIconTextColor = "text-gray-500";


  return (
    <header className="flex flex-col w-full px-4 pt-2 flex-shrink-0">
      {/* Baris 1: Kontrol Utama */}
      <div className="flex justify-between items-center w-full">
        <div className="flex items-center space-x-2 min-w-0">
          <button onClick={endQuiz} aria-label="Kembali ke dek" className={`${baseIconButtonClasses} ${defaultIconTextColor}`}>
            <Icon name="chevronLeft" className="w-6 h-6" />
          </button>
          <h2 className="text-xl font-medium text-gray-900 dark:text-[#E6E1E5] truncate">{modeTitle}</h2>
        </div>

        <div className="flex items-center flex-shrink-0 space-x-1">
          {onOpenFontSizeSettings && (
            <button onClick={onOpenFontSizeSettings} aria-label="Ubah ukuran teks" className={`${baseIconButtonClasses} ${defaultIconTextColor}`}>
              <Icon name="text" className="w-6 h-6" />
            </button>
          )}
          <button onClick={toggleTTSMute} aria-label={isTTSMuted ? "Bunyikan suara" : "Matikan suara"} className={`${baseIconButtonClasses} ${isTTSMuted ? mutedIconTextColor : defaultIconTextColor}`}>
            <Icon name={isTTSMuted ? 'volumeOff' : 'volumeUp'} className="w-6 h-6" />
          </button>
          {onOpenTimerSettings && (
            <button onClick={onOpenTimerSettings} aria-label="Pengaturan" className={`${baseIconButtonClasses} ${defaultIconTextColor}`}>
              <Icon name="moreVert" className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>

      {/* Baris 2: Bar Statistik Detail */}
      {(progress !== undefined || boxInfo) && (
        <div className="mt-2 mb-2 p-2 bg-gray-200 dark:bg-gray-800 rounded-lg">
          <div className="flex justify-between items-center w-full space-x-3">
            
            {/* Item 1: Progress */}
            {progress !== undefined && (
              <div className="flex items-center space-x-2 flex-1 min-w-0">
                <div 
                    className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-2"
                    role="progressbar"
                    aria-label="Progres kuis"
                    aria-valuenow={Math.round(progress)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                >
                  <motion.div
                    className="bg-[#C8B4F3] h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                  />
                </div>
                <span className="text-sm font-mono text-gray-700 dark:text-gray-300">{Math.round(progress)}%</span>
              </div>
            )}
            
            {/* Item 2: Card Counter */}
            <div className={`flex items-center ${progress !== undefined ? 'border-l border-gray-400 dark:border-gray-600 pl-3' : ''}`}>
               <span className="text-sm font-mono text-gray-700 dark:text-gray-300 whitespace-nowrap">{`${currentIndex} / ${totalCards}`}</span>
            </div>

            {/* Item 3: Box/Level */}
            {boxInfo && (
               <div className="flex items-center border-l border-gray-400 dark:border-gray-600 pl-3">
                    <span className="text-sm font-mono text-gray-700 dark:text-gray-300 whitespace-nowrap">
                        {boxInfo}
                    </span>
               </div>
            )}
          </div>
        </div>
      )}
      
      {/* Baris 3: Timer Bar (Baru) */}
      {showTimerBar && timerProgress !== undefined && (
          <div className="mt-2">
            <HorizontalTimerBar timerProgress={timerProgress} />
          </div>
      )}
    </header>
  );
};

export default GameHeader;