import React from 'react';
import { motion } from 'framer-motion';

interface HorizontalTimerBarProps {
  timerProgress: number; // Nilai dari 1.0 (penuh) hingga 0.0 (kosong)
  duration?: number;     // Durasi total dalam detik (opsional)
}

const HorizontalTimerBar: React.FC<HorizontalTimerBarProps> = ({ timerProgress }) => {
  // Pastikan progres berada dalam rentang 0-100%
  const progressPercentage = Math.max(0, Math.min(100, timerProgress * 100));

  return (
    <div 
      className="h-2 bg-gray-700 rounded-full overflow-hidden"
      role="progressbar"
      aria-label="Sisa waktu"
      aria-valuenow={Math.round(progressPercentage)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <motion.div
        className="bg-violet-500 h-full rounded-full"
        initial={{ width: '100%' }}
        animate={{ width: `${progressPercentage}%` }}
        transition={{ duration: 0.1, ease: 'linear' }}
      />
    </div>
  );
};

export default HorizontalTimerBar;