import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCardStore } from '../store/cardStore';
import { useThemeStore } from '../store/themeStore';
import { generateGuessOptions } from '../utils/gameUtils';
import Icon from '../components/Icon';

const GuessItPage: React.FC = () => {
  const { quizCards, updateCardProgress, endQuiz } = useCardStore(state => ({
    quizCards: state.quizCards,
    updateCardProgress: state.updateCardProgress,
    endQuiz: state.endQuiz,
  }));
  const { studyDirection } = useThemeStore();

  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [options, setOptions] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [direction, setDirection] = useState(1);
  const [notEnoughCards, setNotEnoughCards] = useState(false);
  
  const questionField = studyDirection === 'kanji' ? 'front' : 'back';
  const answerField = studyDirection === 'kanji' ? 'back' : 'front';

  const currentCard = useMemo(() => quizCards[currentCardIndex], [quizCards, currentCardIndex]);

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
    // 1. Kunci Jawaban: Mencegah klik lebih lanjut saat umpan balik ditampilkan.
    if (isAnswered) return;
    setIsAnswered(true);
    setSelectedAnswer(selectedAnswerByUser);

    // 2. Perbandingan: Periksa apakah jawaban yang dipilih benar.
    const correctAnswer = currentCard[answerField];
    const isCorrect = selectedAnswerByUser === correctAnswer;
    
    // 3. Umpan Balik & Pembaruan Progres: Perbarui kemajuan belajar dan picu umpan balik visual.
    await updateCardProgress(currentCard, isCorrect ? 'ingat' : 'lupa');

    // 4. Navigasi: Setelah jeda, lanjutkan ke kartu berikutnya.
    setTimeout(() => {
      setDirection(1);
      setCurrentCardIndex(prev => prev + 1);
      // Reset state untuk pertanyaan berikutnya
      setIsAnswered(false);
      setSelectedAnswer(null);
    }, 1800); // Jeda 1.8 detik untuk memberikan waktu meninjau umpan balik
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

  return (
    <div className="flex flex-col h-full p-4 overflow-hidden">
      <header className="flex justify-between items-center w-full mb-4 flex-shrink-0">
        <div className="flex items-center space-x-2 min-w-0">
          <button onClick={endQuiz} aria-label="Keluar dari permainan" className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10">
            <Icon name="chevronLeft" className="w-6 h-6 text-gray-800 dark:text-[#E6E1E5]" />
          </button>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-[#E6E1E5] truncate">Tebak Jawaban</h2>
        </div>
        <div className="text-gray-500 dark:text-[#C8C5CA] font-mono text-sm whitespace-nowrap pt-0.5">
          {`${currentCardIndex + 1} / ${quizCards.length}`}
        </div>
      </header>
      
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
              <div className="bg-gray-200 dark:bg-[#4A4458] rounded-xl flex items-center justify-center p-6 w-full h-48">
                <p className="text-4xl md:text-5xl font-bold text-center text-gray-900 dark:text-[#E6E1E5]">
                  {currentCard[questionField]}
                </p>
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