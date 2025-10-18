import React from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useThemeStore } from '../store/themeStore';

interface TimerSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.3 } },
};

const modalVariants: Variants = {
  hidden: { scale: 0.9, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { duration: 0.2, ease: 'easeOut' } },
  exit: { scale: 0.9, opacity: 0, transition: { duration: 0.2, ease: 'easeOut' } },
};

const TimerSettingsModal: React.FC<TimerSettingsModalProps> = ({ isOpen, onClose }) => {
  const { timerDuration, setTimerDuration } = useThemeStore();

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          onClick={handleBackdropClick}
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <motion.div
            className="bg-white dark:bg-[#2B2930] rounded-2xl p-6 w-full max-w-sm shadow-xl"
            variants={modalVariants}
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Pengaturan Timer Blitz</h2>
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="timer-duration" className="block text-sm font-medium text-gray-600 dark:text-[#C8C5CA]">
                  Durasi per kartu
                </label>
                <span className="font-semibold text-lg text-[#C8B4F3]">{timerDuration}s</span>
              </div>
              <input
                type="range"
                id="timer-duration"
                min="3"
                max="30"
                step="1"
                value={timerDuration}
                onChange={(e) => setTimerDuration(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer transition-colors duration-300
                           [&::-webkit-slider-thumb]:appearance-none
                           [&::-webkit-slider-thumb]:w-5
                           [&::-webkit-slider-thumb]:h-5
                           [&::-webkit-slider-thumb]:rounded-full
                           [&::-webkit-slider-thumb]:bg-[#C8B4F3]
                           
                           [&::-moz-range-thumb]:w-5
                           [&::-moz-range-thumb]:h-5
                           [&::-moz-range-thumb]:rounded-full
                           [&::-moz-range-thumb]:bg-[#C8B4F3]
                           [&::-moz-range-thumb]:border-none
                           "
              />
            </div>
            <div className="flex justify-end mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 bg-[#C8B4F3] text-black font-semibold rounded-full"
              >
                Selesai
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TimerSettingsModal;