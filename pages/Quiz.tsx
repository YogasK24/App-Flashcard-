import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCardStore } from '../store/cardStore';
import { useThemeStore } from '../store/themeStore';
import { useQuizTimer } from '../hooks/useQuizTimer';
import Flashcard from '../components/Flashcard';
import QuizHeader from '../components/QuizHeader';
import QuizControls from '../components/QuizControls';
import Icon from '../components/Icon';
import TimerSettingsModal from '../components/TimerSettingsModal';

const Quiz: React.FC = () => {
  const { quizCards, updateCardSrs, endQuiz, quizMode } = useCardStore(state => ({
    quizCards: state.quizCards,
    updateCardSrs: state.updateCardSrs,
    endQuiz: state.endQuiz,
    quizMode: state.quizMode,
  }));
  const { timerDuration } = useThemeStore(state => ({ timerDuration: state.timerDuration }));

  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [direction, setDirection] = useState(1); // 1 for next, -1 for prev
  const [isProcessing, setIsProcessing] = useState(false); // Mencegah klik/aksi ganda
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const totalCards = quizCards.length;
  const currentCard = quizCards[currentCardIndex];
  
  const cardVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0,
      scale: 0.9,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 50 : -50,
      opacity: 0,
      scale: 0.9,
    }),
  };

  if (currentCardIndex >= totalCards && totalCards > 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-[#C8C5CA] p-4">
        <Icon name="folder" className="w-24 h-24 mb-6 opacity-50" />
        <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Kuis Selesai!</h2>
        <p className="mb-6">Kerja bagus! Semua {totalCards} kartu yang perlu diulang telah diselesaikan.</p>
        <button
          onClick={endQuiz}
          className="bg-[#C8B4F3] text-[#1C1B1F] font-bold py-3 px-8 rounded-full text-lg"
        >
          Kembali ke Dek
        </button>
      </div>
    );
  }

  if (!currentCard) {
    // Ini terjadi jika kuis dimulai tanpa kartu, yang seharusnya dicegah oleh store.
    // Tampilkan pesan fallback untuk keamanan.
    return (
        <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-[#C8C5CA] p-4">
             <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Tidak Ada Kartu</h2>
             <p className="mb-6">Tidak ada kartu yang perlu diulang dalam dek ini saat ini.</p>
             <button
                onClick={endQuiz}
                className="bg-[#C8B4F3] text-[#1C1B1F] font-bold py-3 px-8 rounded-full text-lg"
             >
                Kembali ke Dek
            </button>
        </div>
    );
  }

  const handleTimeUp = () => {
    if (isProcessing) return;

    if (!isFlipped) {
      setIsFlipped(true);
      // Tunggu animasi balik kartu (500ms) + sedikit waktu lihat (500ms)
      // TTS akan dipicu oleh useEffect di Flashcard saat isFlipped berubah.
      setTimeout(() => {
        handleRate(1); // Anggap sebagai jawaban 'Lagi'
      }, 1000);
    } else {
      // Jika sudah dibalik, langsung nilai
      handleRate(1);
    }
  };

  const { timeLeft } = useQuizTimer({
    key: currentCard.id,
    initialTime: timerDuration,
    onTimeUp: handleTimeUp,
  });

  const handleShowAnswer = () => {
    setIsFlipped(true);
  };

  const handleRate = async (quality: number) => {
    if (isProcessing) return;
    setIsProcessing(true);

    setDirection(1); // Atur arah animasi ke 'next'
    // Hanya perbarui SRS jika dalam mode Spaced Repetition
    if (quizMode === 'sr') {
      await updateCardSrs(currentCard, quality);
    }
    
    // Balik kartu kembali sebelum transisi ke kartu berikutnya
    setIsFlipped(false);
    
    // Beri sedikit jeda agar animasi flip bisa mulai sebelum kartu bergeser
    setTimeout(() => {
        setCurrentCardIndex(prevIndex => prevIndex + 1);
        setIsProcessing(false);
    }, 150);
  };

  return (
    <div className="flex flex-col h-full p-4 overflow-hidden">
      <QuizHeader 
        currentCardIndex={currentCardIndex + 1} 
        totalCards={totalCards}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
      />
      <div className="flex-grow flex items-center justify-center relative">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentCardIndex}
            custom={direction}
            variants={cardVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            className="absolute w-full h-80"
          >
            <Flashcard
              card={currentCard}
              isFlipped={isFlipped}
              quizMode={quizMode}
              timeLeft={timeLeft}
              duration={timerDuration}
            />
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="flex-shrink-0">
         <QuizControls
            isFlipped={isFlipped}
            onShowAnswer={handleShowAnswer}
            onRate={handleRate}
            isBlitzMode={quizMode === 'blitz'}
            disabled={isProcessing}
          />
      </div>

      <TimerSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />
    </div>
  );
};

export default Quiz;