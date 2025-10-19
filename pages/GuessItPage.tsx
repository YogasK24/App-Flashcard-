import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCardStore } from '../store/cardStore';
import { useThemeStore } from '../store/themeStore';
import { generateGuessOptions } from '../utils/gameUtils';
import Icon from '../components/Icon';
import GameHeader from '../components/GameHeader';
import { useQuizTimer } from '../hooks/useQuizTimer';
import CircularTimer from '../components/CircularTimer';

const GuessItPage: React.FC = () => {
  const { quizCards, updateCardProgress, endQuiz, quizMode } = useCardStore(state => ({
    quizCards: state.quizCards,
    updateCardProgress: state.updateCardProgress,
    endQuiz: state.endQuiz,
    quizMode: state.quizMode,
  }));
  const { studyDirection, timerDuration } = useThemeStore();

  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [correctAnswerCount, setCorrectAnswerCount] = useState(0);
  const [options, setOptions] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [direction, setDirection] = useState(1);
  const [notEnoughCards, setNotEnoughCards] = useState(false);
  
  const questionField = studyDirection === 'kanji' ? 'front' : 'back';
  const answerField = studyDirection === 'kanji' ? 'back' : 'front';

  const currentCard = useMemo(() => quizCards[currentCardIndex], [quizCards, currentCardIndex]);

  const handleTimeUp = () => {
    if (isAnswered) return;
    setIsAnswered(true);
    setSelectedAnswer(null); // Tidak ada jawaban yang dipilih

    updateCardProgress(currentCard, 'lupa').then(() => {
      setTimeout(() => {
        setDirection(1);
        setCurrentCardIndex(prev => prev + 1);
        setIsAnswered(false);
        setSelectedAnswer(null);
      }, 1800);
    });
  };

  const { timeLeft, stopTimer } = useQuizTimer({
    key: currentCard?.id,
    initialTime: quizMode === 'blitz' ? timerDuration : 0,
    onTimeUp: handleTimeUp,
  });


  useEffect(() => {
    if (quizCards.length < 2) {
      setNotEnoughCards(true);
      return;
    }
    
    if (currentCard) {
      const newOptions = generateGuessOptions(currentCard, quizCards, answerField);
      setOptions(newOptions);
    }
  }, [currentCard, quizCards, answerField]);

  const handleOptionSelect = async (selectedAnswerByUser: string) => {
    if (isAnswered) return;
    stopTimer();
    setIsAnswered(true);
    setSelectedAnswer(selectedAnswerByUser);

    const correctAnswer = currentCard[answerField];
    const isCorrect = selectedAnswerByUser === correctAnswer;
    
    if (isCorrect) {
      setCorrectAnswerCount(prev => prev + 1);
    }
    
    await updateCardProgress(currentCard, isCorrect ? 'ingat' : 'lupa');

    setTimeout(() => {
      setDirection(1);
      setCurrentCardIndex(prev => prev + 1);
      setIsAnswered(false);
      setSelectedAnswer(null);
    }, 1800);
  };

  const cardVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 50 : -50,
      opacity: 0,
    }),
  };

  if (notEnoughCards) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4 animate-fade-in-slow">
        <Icon name="document" className="w-24 h-24 mb-6 opacity-50 text-yellow-500" />
        <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Kartu Tidak Cukup</h2>
        <p className="mb-6 text-gray-500 dark:text-[#C8C5CA]">Permainan ini membutuhkan setidaknya 2 kartu.</p>
        <button
          onClick={endQuiz}
          className="bg-[#C8B4F3] text-[#1C1B1F] font-bold py-3 px-8 rounded-full text-lg"
        >
          Kembali ke Dek
        </button>
      </div>
    );
  }
  
  if (currentCardIndex >= quizCards.length && quizCards.length > 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4 animate-fade-in-slow">
        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1, transition: { type: 'spring' } }}>
          <Icon name="sparkle" className="w-24 h-24 mb-6 text-yellow-400" />
        </motion.div>
        <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Permainan Selesai!</h2>
        <p className="text-gray-500 dark:text-[#C8C5CA] mb-6">Kerja bagus! Anda telah menyelesaikan semua kartu.</p>
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
            <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Memuat Permainan...</h2>
        </div>
    );
  }
  
  const progressPercentage = quizCards.length > 0 ? (correctAnswerCount / quizCards.length) * 100 : 0;

  return (
    <div className="flex flex-col h-full p-4 overflow-hidden">
      <GameHeader 
        modeTitle="Tebak Jawaban"
        currentIndex={currentCardIndex + 1}
        totalCards={quizCards.length}
        progress={progressPercentage}
        boxInfo={quizMode === 'sr' && currentCard ? `Box ${currentCard.repetitions + 1}` : undefined}
      />
      
      <main className="flex-grow flex flex-col justify-center items-center">
        <div className="w-full h-full flex flex-col justify-between">
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
              className="w-full flex-grow flex items-center justify-center"
            >
              <div className="relative w-full max-w-sm h-48 flex items-center justify-center">
                {quizMode === 'blitz' && (
                  <CircularTimer
                    duration={timerDuration}
                    timeLeft={timeLeft}
                    size={220} // Sedikit lebih besar dari tinggi kartu (h-48 adalah 192px)
                    strokeWidth={8}
                    className="absolute inset-0 m-auto pointer-events-none z-0"
                  />
                )}
                <div className="relative z-10 bg-gray-200 dark:bg-[#4A4458] rounded-xl flex items-center justify-center p-6 w-full h-48">
                  <p className="text-4xl md:text-5xl font-bold text-center text-gray-900 dark:text-[#E6E1E5]">
                    {currentCard[questionField]}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
          
          <div className="grid grid-cols-1 md:grid-cols-2 mt-2">
            {options.map((option, index) => {
              const isCorrectAnswer = option === currentCard[answerField];
              
              const baseClasses = "w-full p-4 m-2 rounded-xl shadow-md border transition-all duration-300 text-lg font-semibold";
              
              let stateClasses = "bg-white dark:bg-[#2B2930] text-gray-900 dark:text-[#E6E1E5] border-gray-700 dark:border-gray-300 hover:bg-gray-100 dark:hover:bg-[#3A3841]";

              if (isAnswered) {
                if (isCorrectAnswer) {
                  stateClasses = "bg-green-500/80 text-white border-transparent";
                } else if (selectedAnswer === option) {
                  stateClasses = "bg-red-500/80 text-white border-transparent";
                } else {
                  stateClasses = "bg-white dark:bg-[#2B2930] text-gray-900 dark:text-[#E6E1E5] border-gray-700 dark:border-gray-300 opacity-60";
                }
              }

              return (
                <motion.button
                  key={index}
                  onClick={() => handleOptionSelect(option)}
                  disabled={isAnswered}
                  className={`${baseClasses} ${stateClasses}`}
                  whileTap={!isAnswered ? { scale: 0.95 } : {}}
                >
                  {option}
                </motion.button>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};

export default GuessItPage;