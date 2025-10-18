import React, { useState, FormEvent } from 'react';
import Icon from './Icon';

interface AddDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (title: string, type: 'document' | 'folder') => void;
}

const AddDeckModal: React.FC<AddDeckModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'document' | 'folder'>('document');

  if (!isOpen) {
    return null;
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onAdd(title.trim(), type);
      setTitle(''); // Reset form
      setType('document');
    }
  };
  
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
        onClose();
    }
  }

  return (
    <div 
        onClick={handleBackdropClick}
        className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
    >
      <div className="bg-[#2B2930] rounded-2xl p-6 w-full max-w-sm shadow-xl">
        <h2 className="text-xl font-bold text-white mb-6">Buat Item Baru</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="deck-title" className="block text-sm font-medium text-[#C8C5CA] mb-2">
              Judul
            </label>
            <input
              type="text"
              id="deck-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#4A4458] border border-[#645F73] text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#C8B4F3]"
              placeholder="e.g., JLPT N5 Kanji"
              required
              autoFocus
            />
          </div>

          <div className="mb-6">
            <span className="block text-sm font-medium text-[#C8C5CA] mb-2">Tipe</span>
            <div className="grid grid-cols-2 gap-3">
              <label className={`flex items-center justify-center p-3 rounded-lg cursor-pointer transition-colors ${type === 'document' ? 'bg-[#C8B4F3] text-black' : 'bg-[#4A4458] text-white'}`}>
                <input type="radio" name="type" value="document" checked={type === 'document'} onChange={() => setType('document')} className="sr-only" />
                <Icon name="document" className="w-5 h-5 mr-2" />
                <span className="font-semibold">Dek</span>
              </label>
              <label className={`flex items-center justify-center p-3 rounded-lg cursor-pointer transition-colors ${type === 'folder' ? 'bg-[#C8B4F3] text-black' : 'bg-[#4A4458] text-white'}`}>
                <input type="radio" name="type" value="folder" checked={type === 'folder'} onChange={() => setType('folder')} className="sr-only" />
                <Icon name="folder" className="w-5 h-5 mr-2" />
                <span className="font-semibold">Folder</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full text-[#C8B4F3] font-semibold hover:bg-white/10"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[#C8B4F3] text-black font-semibold rounded-full disabled:opacity-50"
              disabled={!title.trim()}
            >
              Buat
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDeckModal;
