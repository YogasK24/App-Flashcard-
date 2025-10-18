import React from 'react';

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
      <div
        style={menuStyle}
        className="fixed bg-white dark:bg-[#2B2930] text-gray-900 dark:text-[#E6E1E5] rounded-lg shadow-xl py-2 w-48 z-50 animate-fade-in"
      >
        <style>{`
          @keyframes fade-in {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
          .animate-fade-in {
            animation: fade-in 0.1s ease-out forwards;
          }
        `}</style>
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
      </div>
    </>
  );
};

export default ContextMenu;