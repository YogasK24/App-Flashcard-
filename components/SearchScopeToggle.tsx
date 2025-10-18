import React from 'react';

type Scope = 'all' | 'folder' | 'deck' | 'card';

interface SearchScopeToggleProps {
  currentScope: Scope;
  onScopeChange: (scope: Scope) => void;
}

const SearchScopeToggle: React.FC<SearchScopeToggleProps> = ({ currentScope, onScopeChange }) => {
  const scopes: { value: Scope; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'folder', label: 'Folder' },
    { value: 'deck', label: 'Deck' },
    { value: 'card', label: 'Card' },
  ];

  return (
    <div className="flex space-x-2 overflow-x-auto py-2 -mx-2 px-2">
      {scopes.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => onScopeChange(value)}
          className={`
            whitespace-nowrap px-3 py-1 rounded-full text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-violet-400
            ${
              currentScope === value
                ? 'bg-violet-600 text-white font-medium'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }
          `}
        >
          {label}
        </button>
      ))}
    </div>
  );
};

export default SearchScopeToggle;
