import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCardStore } from '../store/cardStore';
import { useThemeStore } from '../store/themeStore';
import { useQuizTimer } from '../hooks/useQuizTimer';
import Flashcard from '../components/Flashcard';
import GameHeader from '../components/GameHeader';
import QuizControls from '../components/QuizControls';
import TimerSettingsModal from '../components/TimerSettingsModal';
import FontSizeModal from '../components/FontSizeModal';
import SessionCompleteModal from '../components/SessionCompleteModal';

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
  const [isSessionComplete, setIsSessionComplete] = useState(false);

  const totalCards = quizCards.length;
  const currentCard = quizCards[currentCardIndex];
  
  useEffect(() => {
    // Memeriksa apakah kuis selesai.
    if (totalCards > 0 && currentCardIndex >= totalCards) {
      setIsSessionComplete(true);
    }
  }, [currentCardIndex, totalCards]);

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
  
  const handleTimeUp = () => {
    if (isProcessing) return;

    if (!isFlipped) {
      setIsFlipped(true);
      setTimeout(() => {
        handleRate('lupa');
      }, 1000);
    } else {
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
    if (isProcessing || !currentCard) return;
    setIsProcessing(true);
    setDirection(1);

    await updateCardProgress(currentCard, feedback);
    
    setIsFlipped(false); // Sembunyikan bagian belakang kartu segera

    setTimeout(() => {
        // Dalam mode SR dengan feedback 'lupa', kartu diantrekan ulang oleh store.
        // Kita tidak menaikkan indeks untuk memungkinkan dek yang diacak ulang menampilkan kartu berikutnya pada indeks yang sama.
        // Pengecualian: jika ini satu-satunya kartu yang tersisa, kita harus maju untuk mengakhiri sesi.
        const shouldAdvance = !(quizMode === 'sr' && feedback === 'lupa' && quizCards.length > 1);
        
        if (shouldAdvance) {
            setCurrentCardIndex(prevIndex => prevIndex + 1);
        }
        
        setIsProcessing(false);
    }, 150); // Penundaan memungkinkan kartu untuk membalik sebelum berubah
  };

  if (isSessionComplete) {
    return <SessionCompleteModal isOpen={true} onExit={endQuiz} />;
  }

  if (!currentCard) {
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

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <GameHeader
        modeTitle={getModeTitle()}
        currentIndex={Math.min(currentCardIndex + 1, totalCards)}
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
      <SessionCompleteModal
        isOpen={isSessionComplete}
        onExit={endQuiz}
      />
    </div>
  );
};

export default Quiz;