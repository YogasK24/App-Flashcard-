import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCardStore } from '../store/cardStore';
import Flashcard from '../components/Flashcard';
import QuizControls from '../components/QuizControls';
import { useQuizTimer } from '../hooks/useQuizTimer';
import GameHeader from '../components/GameHeader';
import SessionCompleteModal from '../components/SessionCompleteModal';

const RECALL_TIMER_DURATION = 600; // 10 menit, waktu yang cukup.

const RecallItPage: React.FC = () => {
  const { quizCards, updateCardProgress, endQuiz, quizMode } = useCardStore(state => ({
    quizCards: state.quizCards,
    updateCardProgress: state.updateCardProgress,
    endQuiz: state.endQuiz,
    quizMode: state.quizMode,
  }));

  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [correctAnswerCount, setCorrectAnswerCount] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [direction, setDirection] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [timeSpent, setTimeSpent] = useState<number | null>(null);
  const [isSessionComplete, setIsSessionComplete] = useState(false);

  const totalCards = quizCards.length;
  const currentCard = quizCards[currentCardIndex];
  
  useEffect(() => {
    if (totalCards > 0 && currentCardIndex >= totalCards) {
      setIsSessionComplete(true);
    }
  }, [currentCardIndex, totalCards]);

  const { timeLeft, stopTimer } = useQuizTimer({
    key: currentCard?.id,
    initialTime: RECALL_TIMER_DURATION,
    onTimeUp: () => {}, // Tidak digunakan, timer dihentikan secara manual
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
    if (isProcessing || !currentCard) return;
    setIsProcessing(true);
    setDirection(1);

    if (feedback === 'ingat') {
      setCorrectAnswerCount(prev => prev + 1);
    }

    await updateCardProgress(currentCard, feedback);

    setIsFlipped(false);

    setTimeout(() => {
      const shouldAdvance = !(quizMode === 'sr' && feedback === 'lupa' && quizCards.length > 1);
      if (shouldAdvance) {
          setCurrentCardIndex(prevIndex => prevIndex + 1);
      }
      setIsProcessing(false);
    }, 150);
  };
  
  if (isSessionComplete) {
    return <SessionCompleteModal isOpen={true} onExit={endQuiz} />;
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
  
  const progressPercentage = totalCards > 0 ? (correctAnswerCount / totalCards) * 100 : 0;

  return (
    <div className="flex flex-col h-full p-4 overflow-hidden">
      <GameHeader
        modeTitle="Ingat Kembali"
        currentIndex={Math.min(currentCardIndex + 1, totalCards)}
        totalCards={totalCards}
        progress={progressPercentage}
        boxInfo={quizMode === 'sr' && currentCard ? `Box ${currentCard.repetitions + 1}` : undefined}
      />
      
      <main className="flex-grow flex items-center justify-center relative">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          {currentCard && (
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
          )}
        </AnimatePresence>
      </main>
      
      <div className="flex-shrink-0 mt-6">
         <QuizControls
            isFlipped={isFlipped}
            onShowAnswer={handleShowAnswer}
            onRate={handleFeedback}
            disabled={isProcessing}
            timerProgress={1} // Timer tidak ditampilkan di mode ini, jadi progres 100%
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
      <SessionCompleteModal
        isOpen={isSessionComplete}
        onExit={endQuiz}
      />
    </div>
  );
};

export default RecallItPage;