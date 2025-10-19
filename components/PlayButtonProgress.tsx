import React from 'react';
import Icon from './Icon';

interface PlayButtonProgressProps {
  deckId: number;
  progressPercentage: number;
  onPlayClick: (deckId: number) => void;
  disabled?: boolean;
  isLoading?: boolean;
}

const PlayButtonProgress: React.FC<PlayButtonProgressProps> = ({
  deckId,
  progressPercentage,
  onPlayClick,
  disabled = false,
  isLoading = false,
}) => {
  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!disabled && !isLoading) {
      onPlayClick(deckId);
    }
  };

  return (
    <button
      onClick={handlePlay}
      disabled={disabled || isLoading}
      className="bg-gray-700/80 dark:bg-gray-200/80 rounded-full flex items-center shadow-md overflow-hidden transition-all duration-200 ease-in-out hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
      aria-label={`Mulai kuis untuk dek ini`}
    >
      <div className="bg-violet-600 text-white p-3 rounded-full flex items-center justify-center">
        {isLoading ? (
          <Icon name="refresh" className="w-6 h-6 animate-spin" />
        ) : (
          <Icon name="play" className="w-6 h-6" />
        )}
      </div>
      <div className="text-lg font-bold px-3 py-2 text-yellow-400">
        {Math.round(progressPercentage)}%
      </div>
    </button>
  );
};

export default PlayButtonProgress;
