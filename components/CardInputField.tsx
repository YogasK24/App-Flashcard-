import React from 'react';
import Icon from './Icon';

interface CardInputFieldProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  onAddAttribute?: () => void;
  attributeLabel?: string;
  iconName?: string;
  isHighlighted?: boolean;
  endAdornment?: React.ReactNode;
}

const CardInputField: React.FC<CardInputFieldProps> = ({
  label,
  value,
  onChange,
  placeholder,
  onAddAttribute,
  attributeLabel,
  iconName,
  isHighlighted,
  endAdornment,
}) => {
  // Gunakan ID unik untuk input berdasarkan label untuk aksesibilitas
  const inputId = `card-input-${label.replace(/\s+/g, '-').toLowerCase()}`;

  const baseInputClasses = "w-full text-gray-900 dark:text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#C8B4F3] transition-colors duration-300";
  const defaultBgClasses = "bg-gray-200 dark:bg-gray-700";
  const highlightedBgClasses = "bg-blue-100 dark:bg-blue-900/60";
  const paddingClass = endAdornment ? 'pr-10' : '';
  const inputClasses = `${baseInputClasses} ${isHighlighted ? highlightedBgClasses : defaultBgClasses} ${paddingClass}`;

  return (
    <div className="relative flex flex-col mb-4">
      <div className="flex items-center mb-2">
        {iconName && <Icon name={iconName} className="w-4 h-4 mr-2 text-violet-400" />}
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-600 dark:text-[#C8C5CA]">
          {label}
        </label>
      </div>
      <div className="relative flex items-center">
        <input
          id={inputId}
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={inputClasses}
        />
        <div className="absolute right-3 flex items-center space-x-2">
            {endAdornment}
            {onAddAttribute && attributeLabel && (
            <button
                type="button"
                onClick={onAddAttribute}
                className="bg-gray-600 dark:bg-gray-300 text-gray-300 dark:text-gray-700 px-2 py-1 rounded-full text-xs cursor-pointer hover:opacity-80 transition-opacity"
                >
                + {attributeLabel}
            </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default CardInputField;
