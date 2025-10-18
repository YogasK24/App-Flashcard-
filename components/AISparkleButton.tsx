import React from 'react';
import Icon from './Icon';

interface AISparkleButtonProps {
  onClick: () => void;
  isLoading: boolean;
  disabled?: boolean;
  title?: string;
}

const AISparkleButton: React.FC<AISparkleButtonProps> = ({ 
  onClick, 
  isLoading, 
  disabled = false,
  title = "Hasilkan dengan AI" 
}) => {
  const isButtonDisabled = isLoading || disabled;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isButtonDisabled}
      className="p-1 rounded-full text-violet-500 dark:text-violet-400 transition-all duration-200 ease-in-out hover:scale-110 hover:bg-violet-500/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      aria-label={title}
      title={title}
    >
      {isLoading ? (
        <Icon name="refresh" className="w-5 h-5 animate-spin" />
      ) : (
        <Icon name="sparkle" className="w-5 h-5" />
      )}
    </button>
  );
};

export default AISparkleButton;