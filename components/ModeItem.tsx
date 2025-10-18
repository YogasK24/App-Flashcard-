import React from 'react';
import Icon from './Icon';

interface ModeItemProps {
  icon?: string;
  iconColor?: string;
  title: string;
  subtitle: string;
  onClick: () => void;
  disabled?: boolean;
  highlighted?: boolean;
}

const ModeItem: React.FC<ModeItemProps> = ({ icon, iconColor = 'text-gray-500 dark:text-gray-400', title, subtitle, onClick, disabled = false, highlighted = false }) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
      onClick();
    }
  };
  
  return (
    <div
      onClick={disabled ? undefined : onClick}
      className={`
        flex items-center p-3 border-b border-gray-200 dark:border-gray-700 
        transition-all duration-200 last:border-b-0
        ${disabled 
          ? 'opacity-50 cursor-not-allowed' 
          : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50'
        }
        ${highlighted ? 'bg-blue-100 dark:bg-blue-900/60 rounded-lg' : ''}
      `}
      role="button"
      tabIndex={disabled ? -1 : 0}
      onKeyPress={handleKeyPress}
      aria-disabled={disabled}
      aria-label={`${title}, ${subtitle}`}
    >
      {/* Ikon Utama */}
      {icon && (
          <div className="flex-shrink-0">
            <Icon name={icon} className={`text-4xl ${iconColor}`} />
          </div>
      )}

      {/* Judul & Subjudul */}
      <div className={`${icon ? 'ml-4' : ''} flex-grow`}>
        <h3 className={`font-semibold ${highlighted ? 'text-blue-800 dark:text-blue-200' : 'text-gray-900 dark:text-white'}`}>{title}</h3>
        <p className={`text-sm ${highlighted ? 'text-blue-600 dark:text-blue-300' : 'text-gray-500 dark:text-gray-400'}`}>{subtitle}</p>
      </div>
      
      {/* Ikon Chevron */}
      <div className="flex-shrink-0 ml-auto">
        <Icon name="chevronRight" className="w-6 h-6 text-gray-400 dark:text-gray-500" />
      </div>
    </div>
  );
};

export default ModeItem;