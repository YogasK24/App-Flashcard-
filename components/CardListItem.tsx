import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../types';
import Icon from './Icon';
import { speakText } from '../services/ttsService';
import { useThemeStore } from '../store/themeStore';

interface CardListItemProps {
  card: Card;
  onEdit: () => void;
  onDelete: () => void;
  highlightedCardId: number | null;
  isSelectionMode: boolean;
  isSelected: boolean;
  onToggleSelection: (cardId: number) => void;
  onStartSelectionMode: (cardId: number) => void;
}

// Memetakan pengaturan ke kelas Tailwind
const sizeClassMap = {
  front: {
    small: 'text-xl',
    medium: 'text-2xl',
    large: 'text-3xl',
  },
  back: {
    small: 'text-base',
    medium: 'text-lg',
    large: 'text-xl',
  },
  transcription: {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base',
  },
};

const CardListItem: React.FC<CardListItemProps> = ({ card, onEdit, onDelete, highlightedCardId, isSelectionMode, isSelected, onToggleSelection, onStartSelectionMode }) => {
  const [isFlashing, setIsFlashing] = useState(false);
  const { quizFontSize } = useThemeStore(state => ({
    quizFontSize: state.quizFontSize,
  }));
  
  const longPressTimer = useRef<number | null>(null);
  const wasLongPress = useRef(false);

  const isCurrentlyHighlighted = highlightedCardId === card.id;
  const isDue = new Date(card.dueDate) <= new Date();

  useEffect(() => {
    if (isCurrentlyHighlighted) {
      setIsFlashing(true);
      const timer = setTimeout(() => setIsFlashing(false), 1500); // Durasi flash
      return () => clearTimeout(timer);
    }
  }, [isCurrentlyHighlighted]);

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  const handlePlaySound = (e: React.MouseEvent) => {
    e.stopPropagation(); // Mencegah klik memicu navigasi edit
    // Ucapkan teks Kanji (sisi depan)
    speakText(card.front, 'ja-JP');
  };

  const clearLongPressTimer = () => {
    if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
    }
  };

  const handlePressStart = (event: React.MouseEvent | React.TouchEvent) => {
    // Mencegah menu konteks muncul pada sentuhan panjang
    if ('touches' in event) {
        event.currentTarget.addEventListener('contextmenu', (e) => e.preventDefault(), { once: true });
    }
    wasLongPress.current = false;
    longPressTimer.current = window.setTimeout(() => {
        if (!isSelectionMode) { // Hanya picu jika belum dalam mode seleksi
            onStartSelectionMode(card.id!);
            wasLongPress.current = true;
        }
    }, 500); // 500ms untuk tekan & tahan
  };
  
  const handlePressEnd = () => {
      clearLongPressTimer();
  };

  const handleMove = () => {
      clearLongPressTimer();
  };

  const handleContainerClick = () => {
    if (wasLongPress.current) {
      return; // Mencegah klik dari membatalkan pilihan item yang baru saja dipilih
    }
    if (isSelectionMode) {
        onToggleSelection(card.id!);
    } else {
        onEdit();
    }
  };

  const highlightClasses = isCurrentlyHighlighted
    ? 'ring-2 ring-violet-500 ring-offset-2 ring-offset-gray-50 dark:ring-offset-[#1C1B1F] rounded-lg'
    : '';
  const flashClasses = isFlashing
    ? 'bg-yellow-400/50 dark:bg-yellow-800/50 rounded-lg'
    : '';
  
  const selectionClasses = isSelectionMode
    ? (isSelected ? 'bg-violet-100 dark:bg-violet-900/40' : '')
    : '';

  const frontSizeClass = sizeClassMap.front[quizFontSize] || sizeClassMap.front.medium;
  const backSizeClass = sizeClassMap.back[quizFontSize] || sizeClassMap.back.medium;
  const transcriptionSizeClass = sizeClassMap.transcription[quizFontSize] || sizeClassMap.transcription.medium;

  return (
    <motion.div
      id={`card-list-item-${card.id!}`}
      className={`relative border-b border-gray-200 dark:border-gray-700 transition-colors duration-300 overflow-hidden ${flashClasses} ${highlightClasses} ${selectionClasses}`}
      onClick={handleContainerClick}
      onMouseDown={handlePressStart}
      onMouseUp={handlePressEnd}
      onMouseLeave={handlePressEnd}
      onMouseMove={handleMove}
      onTouchStart={handlePressStart}
      onTouchEnd={handlePressEnd}
      onTouchMove={handleMove}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => (e.key === 'Enter' || e.key === ' ') && handleContainerClick()}
      aria-label={isSelectionMode ? `Pilih kartu: ${card.front}` : `Ubah kartu: ${card.front}`}
      aria-checked={isSelectionMode ? isSelected : undefined}
    >
      <div className="flex items-center py-4 cursor-pointer">
        {isSelectionMode && (
          <div className="pl-4 pr-2 flex-shrink-0" aria-hidden="true">
            <Icon name={isSelected ? 'checkBoxOutline' : 'checkBoxBlankOutline'} className={`w-6 h-6 transition-colors ${isSelected ? 'text-violet-600' : 'text-gray-400'}`} />
          </div>
        )}
        
        {/* Indikator Jatuh Tempo */}
        {isDue && !isSelectionMode && (
          <div className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-amber-400 rounded-full" title="Perlu diulang"></div>
        )}

        {/* Kolom Kiri (Kanji) */}
        <div className={`pr-4 ${isSelectionMode ? '' : 'pl-6'}`}>
          <p className={`font-semibold text-gray-800 dark:text-[#E6E1E5] ${frontSizeClass}`}>{card.front}</p>
        </div>

        {/* Kolom Kanan (Detail) */}
        <div className="flex flex-col flex-1 pl-4 min-w-0">
          <p className={`text-gray-800 dark:text-[#E6E1E5] truncate ${backSizeClass}`}>{card.back}</p>
          {card.transcription && (
            <p className={`text-gray-500 dark:text-gray-400 italic truncate ${transcriptionSizeClass}`}>[{card.transcription}]</p>
          )}
        </div>

        {/* Ikon Aksi */}
        {!isSelectionMode && (
          <div className="flex items-center space-x-1 flex-shrink-0 pr-2">
            <button 
                className="p-2 rounded-full text-gray-600 dark:text-[#C8C5CA] hover:bg-black/5 dark:hover:bg-white/10 hover:text-violet-400 dark:hover:text-violet-300 transition-colors" 
                aria-label="Dengarkan pengucapan"
                onClick={handlePlaySound}
            >
              <Icon name="volumeUp" className="w-5 h-5" />
            </button>
            <button onClick={(e) => handleActionClick(e, onDelete)} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10" aria-label="Hapus kartu">
              <Icon name="trash" className="w-5 h-5 text-red-500/80 dark:text-red-400/80" />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default React.memo(CardListItem);