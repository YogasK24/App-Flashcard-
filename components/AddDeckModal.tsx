import React, { useState, FormEvent } from 'react';
import { motion, Variants } from 'framer-motion';
import Icon from './Icon';

interface AddDeckModalProps {
  onClose: () => void;
  onAdd: (title: string, type: 'deck' | 'folder') => void;
}

const backdropVariants: Variants = {
  visible: { opacity: 1 },
  hidden: { opacity: 0 },
  exit: { opacity: 0 }
};

const modalVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.2, ease: 'easeOut' } },
  exit: { y: 20, opacity: 0, transition: { duration: 0.2, ease: 'easeIn' } }
};

const AddDeckModal: React.FC<AddDeckModalProps> = ({ onClose, onAdd }) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'deck' | 'folder'>('deck');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onAdd(title.trim(), type);
      setTitle(''); // Reset form
      setType('deck');
    }
  };
  
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
        onClose();
    }
  }

  return (
    <motion.div 
        onClick={handleBackdropClick}
        className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
        variants={backdropVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
    >
      <motion.div 
        onClick={e => e.stopPropagation()}
        className="bg-white dark:bg-[#2B2930] rounded-2xl p-6 w-full max-w-sm shadow-xl"
        variants={modalVariants}
      >
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Buat Item Baru</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="deck-title" className="block text-sm font-medium text-gray-600 dark:text-[#C8C5CA] mb-2">
              Judul
            </label>
            <input
              type="text"
              id="deck-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-gray-100 dark:bg-[#4A4458] border border-gray-300 dark:border-[#645F73] text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#C8B4F3]"
              placeholder="e.g., JLPT N5 Kanji"
              required
              autoFocus
            />
          </div>

          <div className="mb-6">
            <span className="block text-sm font-medium text-gray-600 dark:text-[#C8C5CA] mb-2">Tipe</span>
            <div className="grid grid-cols-2 gap-3">
              <label className={`flex items-center justify-center p-3 rounded-lg cursor-pointer transition-colors ${type === 'deck' ? 'bg-[#C8B4F3] text-black' : 'bg-gray-200 text-black dark:bg-[#4A4458] dark:text-white'}`}>
                <input type="radio" name="type" value="deck" checked={type === 'deck'} onChange={() => setType('deck')} className="sr-only" />
                <Icon name="document" className="w-5 h-5 mr-2" />
                <span className="font-semibold">Dek</span>
              </label>
              <label className={`flex items-center justify-center p-3 rounded-lg cursor-pointer transition-colors ${type === 'folder' ? 'bg-[#C8B4F3] text-black' : 'bg-gray-200 text-black dark:bg-[#4A4458] dark:text-white'}`}>
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
              className="px-4 py-2 rounded-full text-[#C8B4F3] font-semibold hover:bg-gray-500/10 dark:hover:bg-white/10"
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
      </motion.div>
    </motion.div>
  );
};

export default AddDeckModal;