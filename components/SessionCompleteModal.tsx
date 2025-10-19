import React from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import Icon from './Icon';

interface SessionCompleteModalProps {
  isOpen: boolean;
  onExit: () => void;
}

const backdropVariants: Variants = {
  visible: { opacity: 1 },
  hidden: { opacity: 0 },
  exit: { opacity: 0 }
};

const modalVariants: Variants = {
  hidden: { y: 20, opacity: 0, scale: 0.9 },
  visible: { y: 0, opacity: 1, scale: 1, transition: { duration: 0.2, ease: 'easeOut' } },
  exit: { y: 20, opacity: 0, scale: 0.9, transition: { duration: 0.2, ease: 'easeIn' } }
};

const SessionCompleteModal: React.FC<SessionCompleteModalProps> = ({ isOpen, onExit }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <motion.div
            className="bg-white dark:bg-[#2B2930] rounded-2xl p-6 w-full max-w-sm shadow-xl flex flex-col items-center text-center"
            variants={modalVariants}
          >
            <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1, transition: { type: 'spring', delay: 0.1 } }}
            >
                <Icon name="sparkle" className="w-20 h-20 mb-4 text-yellow-400" />
            </motion.div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Sesi Selesai!</h2>
            <p className="text-gray-600 dark:text-[#C8C5CA] mb-6">
              Kerja bagus! Anda telah menyelesaikan semua kartu dalam sesi ini.
            </p>
            <div className="flex justify-center">
              <button
                type="button"
                onClick={onExit}
                className="px-8 py-3 bg-[#C8B4F3] text-black font-semibold rounded-full hover:bg-[#D8C4F8] transition-colors text-lg"
              >
                Keluar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SessionCompleteModal;
