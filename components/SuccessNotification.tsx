import React, { useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useCardStore } from '../store/cardStore';
import Icon from './Icon';

// Fix: Explicitly type `notificationVariants` with `Variants` from framer-motion.
const notificationVariants: Variants = {
  initial: { y: -50, opacity: 0 },
  animate: { y: 0, opacity: 1, transition: { type: 'spring', damping: 30, stiffness: 250 } },
  exit: { y: -50, opacity: 0, transition: { type: 'spring', damping: 30, stiffness: 250 } }
};

const SuccessNotification: React.FC = () => {
  const { notification, hideNotification } = useCardStore(state => ({
    notification: state.notification,
    hideNotification: state.hideNotification,
  }));

  useEffect(() => {
    if (notification?.isVisible) {
      const timer = setTimeout(() => {
        hideNotification();
      }, 4000); // Sembunyikan otomatis setelah 4 detik

      return () => clearTimeout(timer);
    }
  }, [notification, hideNotification]);

  return (
    <div className="fixed top-8 inset-x-0 z-50 flex justify-center pointer-events-none">
      <AnimatePresence>
        {notification?.isVisible && (
          <motion.div
            key="success-notification"
            className={`pointer-events-auto ${
              notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'
            } text-white px-6 py-2 rounded-full shadow-2xl flex items-center space-x-3`}
            variants={notificationVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            role="alert"
          >
            <Icon name={notification.type === 'success' ? 'sparkle' : 'trash'} className="w-5 h-5" />
            <p className="font-semibold whitespace-nowrap">{notification.message}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SuccessNotification;