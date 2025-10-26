import React, { useEffect, useRef, useCallback } from 'react';
import { motion, Variants } from 'framer-motion';
import Icon from './Icon';

interface ContextMenuProps {
  x: number;
  y: number;
  deckId: number;
  onClose: () => void;
  onRename: (deckId: number) => void;
  onCopy: (deckId: number) => void;
  onMove: (deckId: number) => void;
  onExport: (deckId: number) => void;
  onDelete: (deckId: number) => void;
}

const menuVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, transition: { duration: 0.1 } },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.1 } },
};

const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, deckId, onClose, onRename, onCopy, onMove, onExport, onDelete }) => {
  const menuRef = useRef<HTMLUListElement>(null);

  const menuStyle = {
    top: `${y}px`,
    left: `${x}px`,
  };

  const handleAction = (action: (deckId: number) => void) => {
    action(deckId);
    onClose();
  };
  
  const baseButtonClass = "w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-[#4A4458] transition-colors flex items-center rounded-md";

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
      return;
    }

    const menuItems = menuRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]');
    if (!menuItems || menuItems.length === 0) return;

    const activeIndex = Array.from(menuItems).findIndex(item => item === document.activeElement);

    let nextIndex = -1;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      nextIndex = activeIndex === -1 ? 0 : (activeIndex + 1) % menuItems.length;
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      nextIndex = activeIndex === -1 ? menuItems.length - 1 : (activeIndex - 1 + menuItems.length) % menuItems.length;
    }
    
    if (nextIndex !== -1) {
        menuItems[nextIndex]?.focus();
    }
  }, [onClose]);

  useEffect(() => {
    // Fokuskan item pertama saat menu terbuka
    menuRef.current?.querySelector<HTMLButtonElement>('[role="menuitem"]')?.focus();
    
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);


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
        <ul ref={menuRef} role="menu" aria-orientation="vertical" aria-label="Opsi dek" className="p-1 space-y-1">
          <li role="none">
            <button
              onClick={() => handleAction(onRename)}
              className={baseButtonClass}
              role="menuitem"
            >
              <Icon name="edit" className="w-5 h-5 mr-3 text-gray-500 dark:text-gray-400" />
              Ubah Nama
            </button>
          </li>
          <li role="none">
            <button
              onClick={() => handleAction(onCopy)}
              className={baseButtonClass}
              role="menuitem"
            >
              <Icon name="document" className="w-5 h-5 mr-3 text-gray-500 dark:text-gray-400" />
              Salin
            </button>
          </li>
          <li role="none">
            <button
              onClick={() => handleAction(onMove)}
              className={baseButtonClass}
              role="menuitem"
            >
              <Icon name="swap" className="w-5 h-5 mr-3 text-gray-500 dark:text-gray-400" />
              Pindahkan
            </button>
          </li>
          <li role="none">
            <button
              onClick={() => handleAction(onExport)}
              className={baseButtonClass}
              role="menuitem"
            >
              <Icon name="upload" className="w-5 h-5 mr-3 text-gray-500 dark:text-gray-400" />
              Ekspor
            </button>
          </li>
          <li role="none">
            <button
              onClick={() => handleAction(onDelete)}
              className={`${baseButtonClass} text-red-500 dark:text-red-400`}
              role="menuitem"
            >
              <Icon name="trash" className="w-5 h-5 mr-3" />
              Hapus
            </button>
          </li>
        </ul>
      </motion.div>
    </>
  );
};

export default ContextMenu;