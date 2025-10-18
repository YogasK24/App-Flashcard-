import React from 'react';

interface CircularTimerProps {
  duration: number;
  timeLeft: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

const CircularTimer: React.FC<CircularTimerProps> = ({
  duration,
  timeLeft,
  size = 340,
  strokeWidth = 8,
  className = '',
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  const progress = duration > 0 ? timeLeft / duration : 0;
  const offset = circumference * (1 - progress);

  // Tentukan warna berdasarkan sisa waktu
  let strokeColor = '#ef4444'; // red-500
  if (progress > 0.7) {
    strokeColor = '#22c55e'; // green-500
  } else if (progress > 0.3) {
    strokeColor = '#f59e0b'; // amber-500
  }

  return (
    <div className={`flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
        {/* Latar belakang jalur */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          className="stroke-gray-300/50 dark:stroke-gray-700/50"
          fill="transparent"
        />
        {/* Lingkaran progres */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          stroke={strokeColor}
          style={{
            transition: 'stroke-dashoffset 0.3s linear, stroke 0.3s linear',
          }}
        />
      </svg>
    </div>
  );
};

export default CircularTimer;