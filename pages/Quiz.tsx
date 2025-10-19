import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCardStore } from '../store/cardStore';
import { useThemeStore } from '../store/themeStore';
import { useQuizTimer } from '../hooks/useQuizTimer';
import Flashcard from '../components/Flashcard';
import GameHeader from '../components/GameHeader';
import QuizControls from '../components/QuizControls';
import Icon from '../components/Icon';
import TimerSettingsModal from '../components/TimerSettingsModal';
import FontSizeModal from '../components/FontSizeModal';

const Quiz: React.FC = () => {
  const { quizCards, updateCardProgress, endQuiz, quizMode, quizDeck } = useCardStore(state => ({
    quizCards: state.quizCards,
    updateCardProgress: state.updateCardProgress,
    endQuiz: state.endQuiz,
    quizMode: state.quizMode,
    quizDeck: state.quizDeck,
  }));
  const { timerDuration } = useThemeStore(state => ({ timerDuration: state.timerDuration }));

  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [direction, setDirection] = useState(1); // 1 for next, -1 for prev
  const [isProcessing, setIsProcessing] = useState(false); // Mencegah klik/aksi ganda
  const [isTimerSettingsModalOpen, setIsTimerSettingsModalOpen] = useState(false);
  const [isFontSizeModalOpen, setIsFontSizeModalOpen] = useState(false);

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
  
  const getModeTitle = () => {
    switch (quizMode) {
      case 'sr': return 'Spaced Repetition';
      case 'simple': return 'Simple Review';
      case 'blitz': return 'Blitz Mode';
      default: return 'Kuis';
    }
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
        handleRate('lupa'); // Anggap sebagai jawaban 'Lupa'
      }, 1000);
    } else {
      // Jika sudah dibalik, langsung nilai
      handleRate('lupa');
    }
  };

  const { timeLeft, stopTimer, timerProgress } = useQuizTimer({
    key: currentCard?.id,
    initialTime: quizMode === 'blitz' ? timerDuration : 0,
    onTimeUp: handleTimeUp,
  });

  const handleReveal = () => {
    if (isProcessing) return;
    if (quizMode === 'blitz') {
      stopTimer();
    }
    setIsFlipped(true);
  };

  const handleRate = async (feedback: 'lupa' | 'ingat') => {
    if (isProcessing) return;
    setIsProcessing(true);
    setDirection(1);

    if (quizMode === 'sr') {
      await updateCardProgress(currentCard, feedback);
    }

    setIsFlipped(false);

    setTimeout(() => {
      if (quizMode === 'sr' && feedback === 'lupa') {
        // Jika hanya ada satu kartu tersisa dan dijawab salah,
        // kuis harus berakhir untuk menghindari perulangan tak terbatas.
        // Kartu tersebut akan muncul di sesi berikutnya.
        if (quizCards.length <= 1) {
          setCurrentCardIndex(prevIndex => prevIndex + 1);
        }
        // Jika tidak, jangan naikkan indeks. Biarkan store menyusun ulang
        // dan re-render akan menampilkan kartu berikutnya di indeks yang sama.
      } else {
        // Untuk 'ingat' di mode apa pun, atau 'lupa' di mode non-SR, lanjutkan ke kartu berikutnya.
        setCurrentCardIndex(prevIndex => prevIndex + 1);
      }
      
      setIsProcessing(false);
    }, 150);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <GameHeader
        modeTitle={getModeTitle()}
        currentIndex={currentCardIndex + 1}
        totalCards={totalCards}
        progress={quizDeck?.progress}
        boxInfo={quizMode === 'sr' && currentCard ? `Box ${currentCard.repetitions + 1}` : undefined}
        onOpenTimerSettings={() => setIsTimerSettingsModalOpen(true)}
        onOpenFontSizeSettings={() => setIsFontSizeModalOpen(true)}
      />
      <div className="flex-grow flex items-center justify-center relative px-4">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentCard.id}
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
      <div className="flex-shrink-0 px-4 pb-4">
         <QuizControls
            isFlipped={isFlipped}
            onShowAnswer={handleReveal}
            onRate={handleRate}
            isBlitzMode={quizMode === 'blitz'}
            disabled={isProcessing}
            timerProgress={timerProgress}
          />
      </div>

      <TimerSettingsModal
        isOpen={isTimerSettingsModalOpen}
        onClose={() => setIsTimerSettingsModalOpen(false)}
      />
      <FontSizeModal
        isOpen={isFontSizeModalOpen}
        onClose={() => setIsFontSizeModalOpen(false)}
      />
    </div>
  );
};

export default Quiz;