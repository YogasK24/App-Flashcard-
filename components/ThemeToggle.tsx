import React from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useThemeStore } from '../store/themeStore';
import Icon from './Icon';

const sunVariants: Variants = {
  initial: { rotate: -90, opacity: 0, y: 20 },
  animate: { rotate: 0, opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeInOut' } },
  exit: { rotate: 90, opacity: 0, y: -20, transition: { duration: 0.3, ease: 'easeInOut' } },
};
const moonVariants: Variants = {
  initial: { rotate: 90, opacity: 0, y: -20 },
  animate: { rotate: 0, opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeInOut' } },
  exit: { rotate: -90, opacity: 0, y: 20, transition: { duration: 0.3, ease: 'easeInOut' } },
};

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <button
      onClick={toggleTheme}
      aria-label="Ganti tema"
      className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 relative w-10 h-10 flex items-center justify-center overflow-hidden"
    >
      <AnimatePresence initial={false} mode="wait">
        {theme === 'dark' ? (
          <motion.div
            key="sun"
            variants={sunVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="absolute"
          >
            <Icon name="sun" className="w-6 h-6" />
          </motion.div>
        ) : (
          <motion.div
            key="moon"
            variants={moonVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="absolute"
          >
            <Icon name="moon" className="w-6 h-6" />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
};

export default ThemeToggle;