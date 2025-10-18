import React from 'react';

interface CardInputFieldProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  onAddAttribute?: () => void;
  attributeLabel?: string;
}

const CardInputField: React.FC<CardInputFieldProps> = ({
  label,
  value,
  onChange,
  placeholder,
  onAddAttribute,
  attributeLabel,
}) => {
  // Gunakan ID unik untuk input berdasarkan label untuk aksesibilitas
  const inputId = `card-input-${label.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <div className="relative flex flex-col mb-4">
      <label htmlFor={inputId} className="block text-sm font-medium text-gray-600 dark:text-[#C8C5CA] mb-2">
        {label}
      </label>
      <div className="relative flex items-center">
        <input
          id={inputId}
          type="text"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#C8B4F3]"
        />
        {onAddAttribute && attributeLabel && (
          <div className="absolute right-3">
             <button
                type="button"
                onClick={onAddAttribute}
                className="bg-gray-600 dark:bg-gray-300 text-gray-300 dark:text-gray-700 px-2 py-1 rounded-full text-xs cursor-pointer hover:opacity-80 transition-opacity"
              >
                + {attributeLabel}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CardInputField;
