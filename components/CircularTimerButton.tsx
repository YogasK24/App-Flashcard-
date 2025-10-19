import React from 'react';

interface CircularTimerButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  timerProgress: number; // from 0 (empty) to 1 (full)
  className?: string;
  disabled?: boolean;
}

const CircularTimerButton: React.FC<CircularTimerButtonProps> = ({
  children,
  onClick,
  timerProgress,
  className = '',
  disabled = false,
}) => {
  const radius = 45;
  const strokeWidth = 6;
  const circumference = 2 * Math.PI * radius;
  // Pastikan progres berada di antara 0 dan 1
  const clampedProgress = Math.max(0, Math.min(1, timerProgress));
  const offset = circumference * (1 - clampedProgress);

  // Tentukan warna goresan berdasarkan progres sisa waktu
  let strokeColor = '#ef4444'; // Tailwind's red-500
  if (clampedProgress > 0.7) {
    strokeColor = '#22c55e'; // Tailwind's green-500
  } else if (clampedProgress > 0.3) {
    strokeColor = '#f59e0b'; // Tailwind's amber-500
  }

  const baseButtonClasses = "relative z-10 w-full h-full font-bold rounded-full text-lg flex items-center justify-center transition-all duration-200 ease-in-out hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none";
  
  // Gaya default untuk tombol jika tidak ada className yang diberikan
  const defaultStyling = "bg-[#C8B4F3] text-[#1C1B1F]";

  return (
    // Wrapper div mendefinisikan ukuran komponen
    <div className="relative w-24 h-24"> 
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
        {/* Latar belakang jalur */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          strokeWidth={strokeWidth}
          className="stroke-gray-300/50 dark:stroke-gray-700/50"
          fill="transparent"
        />
        {/* Lingkaran progres */}
        <circle
          cx="50"
          cy="50"
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
      <button
        onClick={onClick}
        disabled={disabled}
        className={`${baseButtonClasses} ${className || defaultStyling}`}
      >
        {children}
      </button>
    </div>
  );
};

export default CircularTimerButton;
