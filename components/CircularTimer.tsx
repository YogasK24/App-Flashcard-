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
  size = 100,
  strokeWidth = 10,
  className,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // Pastikan progres tidak di bawah 0
  const progress = duration > 0 ? Math.max(0, timeLeft / duration) : 0;
  const offset = circumference * (1 - progress);

  // Tentukan warna berdasarkan sisa waktu
  let strokeColor = '#ef4444'; // Tailwind red-500
  if (progress > 0.7) {
    strokeColor = '#22c55e'; // Tailwind green-500
  } else if (progress > 0.3) {
    strokeColor = '#f59e0b'; // Tailwind amber-500
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={className}>
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
        className="transform -rotate-90 origin-center"
        style={{
          transition: 'stroke-dashoffset 0.3s linear, stroke 0.3s linear',
        }}
      />
    </svg>
  );
};

export default CircularTimer;
