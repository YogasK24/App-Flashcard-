import React from 'react';
import { motion, Variants } from 'framer-motion';

interface ContextMenuProps {
  x: number;
  y: number;
  deckId: number;
  onClose: () => void;
  onRename: (deckId: number) => void;
  onCopy: (deckId: number) => void;
  onMove: (deckId: number) => void;
  onDelete: (deckId: number) => void;
}

const menuVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, transition: { duration: 0.1 } },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.1 } },
};

const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, deckId, onClose, onRename, onCopy, onMove, onDelete }) => {
  const menuStyle = {
    top: `${y}px`,
    left: `${x}px`,
  };

  const handleAction = (action: (deckId: number) => void) => {
    action(deckId);
    onClose();
  };

  return (
    <>
      {/* Backdrop untuk menutup menu saat diklik */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
        onContextMenu={(e) => { e.preventDefault(); onClose(); }} // Juga tutup saat klik kanan di luar
      />
      <motion.div
        style={menuStyle}
        className="fixed bg-white dark:bg-[#2B2930] text-gray-900 dark:text-[#E6E1E5] rounded-lg shadow-xl py-2 w-48 z-50 origin-top-left"
        variants={menuVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
      >
        <ul>
          <li>
            <button
              onClick={() => handleAction(onRename)}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-[#4A4458] transition-colors"
            >
              Ubah Nama
            </button>
          </li>
          <li>
            <button
              onClick={() => handleAction(onCopy)}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-[#4A4458] transition-colors"
            >
              Salin
            </button>
          </li>
          <li>
            <button
              onClick={() => handleAction(onMove)}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-[#4A4458] transition-colors"
            >
              Pindahkan
            </button>
          </li>
          <li>
            <button
              onClick={() => handleAction(onDelete)}
              className="w-full text-left px-4 py-2 text-red-500 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-[#4A4458] transition-colors"
            >
              Hapus
            </button>
          </li>
        </ul>
      </motion.div>
    </>
  );
};

export default ContextMenu;