import React from 'react';
import Icon from './Icon';

const FloatingActionButton: React.FC = () => {
  return (
    <div className="absolute bottom-6 right-4 flex flex-col-reverse items-end space-y-3 space-y-reverse">
      <button className="w-16 h-16 bg-[#C8B4F3] rounded-2xl flex items-center justify-center text-black shadow-lg">
        <Icon name="plus" className="w-8 h-8" />
      </button>
      <button className="px-6 py-3 bg-[#4A4458] rounded-full text-[#E6E1E5] text-base shadow-lg">
        Add word
      </button>
    </div>
  );
};

export default FloatingActionButton;