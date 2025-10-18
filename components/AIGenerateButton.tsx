import React, { useState } from 'react';
import Icon from './Icon';

interface AIGenerateButtonProps {
  onClick: () => Promise<void>;
  className?: string;
  disabled?: boolean;
}

const AIGenerateButton: React.FC<AIGenerateButtonProps> = ({ onClick, className = '', disabled = false }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    try {
      await onClick();
    } catch (error) {
      console.error("AI Generation failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const isButtonDisabled = isLoading || disabled;

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isButtonDisabled}
      className={`
        bg-gray-700 dark:bg-gray-200 text-white dark:text-gray-900 
        px-3 py-2 rounded-full flex items-center shadow-md 
        transition-colors duration-200
        hover:bg-gray-600 dark:hover:bg-gray-300
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500
        disabled:opacity-70 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {isLoading ? (
        <Icon name="refresh" className="w-5 h-5 mr-2 animate-spin" />
      ) : (
        <Icon name="sparkle" className="w-5 h-5 mr-2" />
      )}
      <span className="text-sm font-semibold whitespace-nowrap">
        {isLoading ? 'Generating...' : 'Generate with AI'}
      </span>
    </button>
  );
};

export default AIGenerateButton;