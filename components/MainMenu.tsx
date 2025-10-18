import React from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import Icon from './Icon';

interface MainMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: () => void;
}

const backdropVariants: Variants = {
  visible: { opacity: 1 },
  hidden: { opacity: 0 },
};

const menuVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: -10 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0, 
    transition: { duration: 0.1, ease: 'easeOut' }
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: -10,
    transition: { duration: 0.1, ease: 'easeIn' }
  }
};

const MainMenu: React.FC<MainMenuProps> = ({ isOpen, onClose, onImport }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="main-menu-backdrop"
            className="fixed inset-0 z-40"
            onClick={onClose}
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
          />
          <motion.div
            key="main-menu-content"
            style={{ top: '60px', left: '10px' }}
            className="fixed bg-white dark:bg-[#2B2930] text-gray-900 dark:text-[#E6E1E5] rounded-lg shadow-xl py-2 w-56 z-50 origin-top-left"
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <ul>
              <li>
                <button
                  onClick={onImport}
                  className="w-full text-left px-4 py-2 flex items-center space-x-3 hover:bg-gray-100 dark:hover:bg-[#4A4458] transition-colors"
                >
                  <Icon name="upload" className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <span>Impor dari File</span>
                </button>
              </li>
              {/* Item menu lainnya dapat ditambahkan di sini */}
            </ul>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MainMenu;