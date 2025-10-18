import React from 'react';
import { Card } from '../types';
import Icon from './Icon';

interface CardItemProps {
  card: Card;
  onEdit: () => void;
  onDelete: () => void;
}

const CardItem: React.FC<CardItemProps> = ({ card, onEdit, onDelete }) => {
  return (
    <div className="bg-[#2B2930] p-4 rounded-lg flex space-x-4">
      <div className="flex-grow flex flex-col space-y-2">
        <div>
          <h4 className="text-xs text-[#948F99] mb-1">DEPAN</h4>
          <p className="text-[#E6E1E5]">{card.front}</p>
        </div>
        <hr className="border-t border-[#4A4458]" />
        <div>
          <h4 className="text-xs text-[#948F99] mb-1">BELAKANG</h4>
          <p className="text-[#E6E1E5]">{card.back}</p>
        </div>
      </div>
      <div className="flex flex-col space-y-2">
        <button onClick={onEdit} className="p-2 rounded-full hover:bg-white/10" aria-label="Ubah kartu">
          <Icon name="edit" className="w-5 h-5 text-[#C8C5CA]" />
        </button>
        <button onClick={onDelete} className="p-2 rounded-full hover:bg-white/10" aria-label="Hapus kartu">
          <Icon name="trash" className="w-5 h-5 text-red-400/80" />
        </button>
      </div>
    </div>
  );
};

export default CardItem;