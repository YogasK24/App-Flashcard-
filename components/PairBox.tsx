import React from 'react';

interface PairBoxProps {
  text: string;
  transcription?: string;
  type: 'A' | 'B';
  selected: boolean;
  matched: boolean;
  mismatched?: boolean;
  onClick: () => void;
}

const PairBox: React.FC<PairBoxProps> = ({ text, transcription, type, selected, matched, mismatched, onClick }) => {
  
  const baseStyle = 'p-4 rounded-xl shadow-lg h-20 flex items-center justify-center transition-all duration-300 text-center w-full';
  
  let stateStyle = 'bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900 cursor-pointer';
  
  if (matched) {
    stateStyle = 'bg-green-700/50 dark:bg-green-300/50 text-white dark:text-gray-900 cursor-not-allowed';
  } else if (mismatched) {
    stateStyle = 'bg-red-500/80 text-white animate-shake';
  } else if (selected) {
    stateStyle += ' ring-4 ring-violet-500 ring-offset-2';
  }
  
  const content = type === 'A' ? (
    <span className="font-semibold text-xl">{text}</span>
  ) : (
    <div className="flex flex-col">
      <span className="font-medium">{text}</span>
      {transcription && <span className="text-xs opacity-75">[{transcription}]</span>}
    </div>
  );

  return (
    <button
      onClick={matched ? undefined : onClick}
      disabled={matched}
      className={`${baseStyle} ${stateStyle}`}
    >
      {content}
    </button>
  );
};

export default PairBox;