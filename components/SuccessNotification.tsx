import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCardStore } from '../store/cardStore';
import Icon from './Icon';

const notificationVariants = {
  initial: { y: 50, opacity: 0 },
  animate: { y: 0, opacity: 1, transition: { type: 'spring', damping: 30, stiffness: 250 } },
  exit: { y: 50, opacity: 0, transition: { type: 'spring', damping: 30, stiffness: 250 } }
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
    <AnimatePresence>
      {notification?.isVisible && (
        <motion.div
          layout
          key="success-notification"
          className={`fixed bottom-8 left-1/2 -translate-x-1/2 ${
            notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'
          } text-white px-6 py-3 rounded-xl shadow-2xl z-50 flex items-center space-x-3`}
          variants={notificationVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          role="alert"
        >
          <Icon name={notification.type === 'success' ? 'sparkle' : 'trash'} className="w-5 h-5" />
          <p className="font-semibold">{notification.message}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SuccessNotification;
