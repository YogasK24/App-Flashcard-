
import React from 'react';
import Icon from './Icon';

const FilterBar: React.FC = () => {
  return (
    <div className="flex items-center space-x-2 text-sm">
      <button className="p-2 rounded-full hover:bg-white/10">
        <Icon name="search" className="w-5 h-5 text-[#C8C5CA]" />
      </button>
      <div className="flex items-center flex-grow space-x-2">
        <button className="bg-[#4A4458] px-4 py-2 rounded-full">日本語(漢字)</button>
        <button className="p-1 rounded-full hover:bg-white/10">
          <Icon name="swap" className="w-5 h-5" />
        </button>
        <button className="bg-[#4A4458] px-4 py-2 rounded-full">日本語(片仮名)</button>
      </div>
      <button className="p-2 rounded-full hover:bg-white/10">
        <Icon name="filterList" className="w-5 h-5 text-[#C8C5CA]" />
      </button>
    </div>
  );
};

export default FilterBar;
