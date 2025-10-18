import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCardStore } from '../store/cardStore';
import Icon from '../components/Icon';
import Flashcard from '../components/Flashcard';
import QuizControls from '../components/QuizControls';
import { useQuizTimer } from '../hooks/useQuizTimer';

const RECALL_TIMER_DURATION = 600; // 10 menit, waktu yang cukup.

const RecallItPage: React.FC = () => {
  const { quizCards, updateCardProgress, endQuiz, quizMode } = useCardStore(state => ({
    quizCards: state.quizCards,
    updateCardProgress: state.updateCardProgress,
    endQuiz: state.endQuiz,
    quizMode: state.quizMode,
  }));

  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [direction, setDirection] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [timeSpent, setTimeSpent] = useState<number | null>(null);

  const totalCards = quizCards.length;
  const currentCard = quizCards[currentCardIndex];

  const { timeLeft, stopTimer } = useQuizTimer({
    key: currentCard?.id,
    initialTime: RECALL_TIMER_DURATION,
    onTimeUp: () => {}, // Tidak digunakan, timer akan dihentikan secara manual
  });

  // Reset timeSpent saat kartu berubah
  useEffect(() => {
    setTimeSpent(null);
  }, [currentCard?.id]);

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

  const handleShowAnswer = () => {
    stopTimer();
    const elapsedTime = RECALL_TIMER_DURATION - timeLeft;
    setTimeSpent(elapsedTime);
    setIsFlipped(true);
  };

  const handleFeedback = async (feedback: 'lupa' | 'ingat') => {
    if (isProcessing) return;
    setIsProcessing(true);
    setDirection(1);

    await updateCardProgress(currentCard, feedback);

    // Setelah pembaruan, lanjutkan ke kartu berikutnya dan reset state.
    // Timer akan di-reset secara otomatis oleh hook `useQuizTimer` karena `key` (currentCard.id) berubah.
    setTimeout(() => {
      setIsFlipped(false);
      
      if (quizMode === 'sr' && feedback === 'lupa') {
        if (quizCards.length <= 1) {
          setCurrentCardIndex(prevIndex => prevIndex + 1);
        }
        // Jika tidak, jangan naikkan indeks. Biarkan store menyusun ulang
        // dan re-render akan menampilkan kartu berikutnya di indeks yang sama.
      } else {
        setCurrentCardIndex(prevIndex => prevIndex + 1);
      }
      
      setIsProcessing(false);
    }, 150);
  };

  if (currentCardIndex >= totalCards && totalCards > 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4 animate-fade-in-slow">
        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1, transition: { type: 'spring' } }}>
          <Icon name="sparkle" className="w-24 h-24 mb-6 text-yellow-400" />
        </motion.div>
        <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Sesi Selesai!</h2>
        <p className="mb-6 text-gray-500 dark:text-[#C8C5CA]">Kerja bagus! Anda telah menyelesaikan semua kartu.</p>
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
    return (
        <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-[#C8C5CA] p-4">
             <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Tidak Ada Kartu</h2>
             <p className="mb-6">Tidak ada kartu yang perlu diulang dalam dek ini.</p>
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
    <div className="flex flex-col h-full p-4 overflow-hidden">
      <header className="flex justify-between items-center w-full mb-4 flex-shrink-0">
        <div className="flex items-center space-x-2 min-w-0">
          <button onClick={endQuiz} aria-label="Keluar dari permainan" className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10">
            <Icon name="chevronLeft" className="w-6 h-6 text-gray-800 dark:text-[#E6E1E5]" />
          </button>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-[#E6E1E5] truncate">Ingat Kembali</h2>
        </div>
        <div className="text-gray-500 dark:text-[#C8C5CA] font-mono text-sm whitespace-nowrap pt-0.5">
          {`${currentCardIndex + 1} / ${totalCards}`}
        </div>
      </header>
      
      <main className="flex-grow flex items-center justify-center relative">
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
            />
          </motion.div>
        </AnimatePresence>
      </main>
      
      <div className="flex-shrink-0 mt-6">
         <QuizControls
            isFlipped={isFlipped}
            onShowAnswer={handleShowAnswer}
            onRate={handleFeedback}
            disabled={isProcessing}
          />
          <AnimatePresence>
            {isFlipped && timeSpent !== null && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-center mt-4 text-sm text-gray-500 dark:text-[#C8C5CA]"
              >
                Waktu Mengingat: <strong>{timeSpent.toFixed(1)} detik</strong>
              </motion.div>
            )}
          </AnimatePresence>
      </div>
    </div>
  );
};

export default RecallItPage;