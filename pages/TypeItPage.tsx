import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCardStore } from '../store/cardStore';
import { useThemeStore } from '../store/themeStore';
import Icon from '../components/Icon';
import { useQuizTimer } from '../hooks/useQuizTimer';
import CircularTimer from '../components/CircularTimer';

// Algoritma Levenshtein distance untuk perbandingan string fuzzy
const levenshteinDistance = (s1: string, s2: string): number => {
  s1 = s1.toLowerCase();
  s2 = s2.toLowerCase();

  const costs: number[] = [];
  for (let j = 0; j <= s2.length; j++) costs[j] = j;

  for (let i = 1; i <= s1.length; i++) {
    costs[0] = i;
    let nw = i - 1;
    for (let j = 1; j <= s2.length; j++) {
      const cj = Math.min(
        1 + Math.min(costs[j], costs[j - 1]),
        s1[i - 1] === s2[j - 1] ? nw : nw + 1
      );
      nw = costs[j];
      costs[j] = cj;
    }
  }
  return costs[s2.length];
};

const TypeItPage: React.FC = () => {
  const { quizCards, updateCardProgress, endQuiz } = useCardStore(state => ({
    quizCards: state.quizCards,
    updateCardProgress: state.updateCardProgress,
    endQuiz: state.endQuiz,
  }));
  const { studyDirection, timerDuration } = useThemeStore(state => ({
    studyDirection: state.studyDirection,
    timerDuration: state.timerDuration,
  }));

  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [isAnswered, setIsAnswered] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentCard = useMemo(() => quizCards[currentCardIndex], [quizCards, currentCardIndex]);
  const questionField = studyDirection === 'kanji' ? 'front' : 'back';
  const answerField = studyDirection === 'kanji' ? 'back' : 'front';

  const advanceToNext = (isCorrect: boolean) => {
    setFeedback(isCorrect ? 'correct' : 'incorrect');
    updateCardProgress(currentCard, isCorrect ? 'ingat' : 'lupa').then(() => {
      setTimeout(() => {
        setCurrentCardIndex(prev => prev + 1);
        setInputValue('');
        setFeedback('idle');
        setIsAnswered(false);
      }, isCorrect ? 1000 : 2500);
    });
  };

  const handleTimeUp = () => {
    if (isAnswered) return;
    setIsAnswered(true);
    advanceToNext(false); // Waktu habis selalu salah
  };
  
  const { timeLeft } = useQuizTimer({
    key: currentCard?.id,
    initialTime: timerDuration,
    onTimeUp: handleTimeUp,
  });
  
  useEffect(() => {
    if (!isAnswered) {
        inputRef.current?.focus();
    }
  }, [currentCardIndex, isAnswered]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (isAnswered || !inputValue.trim()) return;

    setIsAnswered(true);
    const userAnswer = inputValue.trim();
    const correctAnswer = currentCard[answerField];
    
    const distance = levenshteinDistance(userAnswer, correctAnswer);
    // Toleransi: 1 kesalahan jika kata lebih dari 5 karakter, 0 jika lebih pendek.
    const tolerance = correctAnswer.length > 5 ? 1 : 0;
    const isCorrect = distance <= tolerance;

    advanceToNext(isCorrect);
  };

  const getBorderColor = () => {
    switch (feedback) {
      case 'correct': return 'border-green-500';
      case 'incorrect': return 'border-red-500 animate-shake';
      default: return 'border-gray-300 dark:border-gray-600 focus-within:border-[#C8B4F3]';
    }
  };

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
    // Fallback jika tidak ada kartu (misalnya, dek kosong)
    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-4 animate-fade-in-slow">
            <Icon name="document" className="w-24 h-24 mb-6 opacity-50 text-yellow-500" />
            <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Tidak Ada Kartu</h2>
            <p className="mb-6 text-gray-500 dark:text-[#C8C5CA]">Tidak ada kartu yang tersedia untuk permainan ini.</p>
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
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>

      <header className="flex justify-between items-center w-full mb-4 flex-shrink-0">
        <div className="flex items-center space-x-2 min-w-0">
          <button onClick={endQuiz} aria-label="Keluar dari permainan" className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10">
            <Icon name="chevronLeft" className="w-6 h-6 text-gray-800 dark:text-[#E6E1E5]" />
          </button>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-[#E6E1E5] truncate">Ketik Jawaban</h2>
        </div>
        <div className="text-gray-500 dark:text-[#C8C5CA] font-mono text-sm whitespace-nowrap pt-0.5">
          {`${currentCardIndex + 1} / ${quizCards.length}`}
        </div>
      </header>
      
      <main className="flex-grow flex flex-col justify-center items-center w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCard.id}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="w-full flex flex-col items-center"
          >
            <div className="relative w-full max-w-lg mx-auto mb-8">
                <CircularTimer
                    duration={timerDuration}
                    timeLeft={timeLeft}
                    size={240}
                    strokeWidth={6}
                    className="absolute inset-0 m-auto pointer-events-none z-0"
                />
                <div className="relative z-10 bg-gray-200 dark:bg-[#4A4458] rounded-xl flex items-center justify-center p-6 w-full h-48">
                    <p className="text-4xl md:text-5xl font-bold text-center text-gray-900 dark:text-[#E6E1E5]">
                        {currentCard[questionField]}
                    </p>
                </div>
            </div>
          
            <form onSubmit={handleSubmit} className="w-full max-w-lg mx-auto">
              <div className={`p-1 rounded-xl border-2 transition-colors ${getBorderColor()}`}>
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ketik jawaban Anda..."
                  disabled={isAnswered}
                  className="w-full bg-white dark:bg-[#2B2930] text-gray-900 dark:text-[#E6E1E5] text-3xl text-center font-semibold p-4 rounded-lg focus:outline-none"
                />
              </div>
            </form>
          </motion.div>
        </AnimatePresence>
        
        <AnimatePresence>
        {feedback === 'incorrect' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mt-4 text-center p-3 bg-green-100 dark:bg-green-900/50 rounded-lg"
          >
            <p className="text-sm text-gray-500 dark:text-gray-400">Jawaban yang benar:</p>
            <p className="font-semibold text-lg text-green-700 dark:text-green-300">{currentCard[answerField]}</p>
          </motion.div>
        )}
        </AnimatePresence>
      </main>

      <div className="flex-shrink-0 mt-6 h-14">
        <button
          onClick={() => handleSubmit()}
          disabled={isAnswered || !inputValue.trim()}
          className="w-full bg-[#C8B4F3] text-[#1C1B1F] font-bold py-3 rounded-full text-lg transition-all duration-200 ease-in-out hover:scale-105 active:scale-95 disabled:opacity-50 disabled:transform-none"
        >
          Periksa
        </button>
      </div>
    </div>
  );
};

export default TypeItPage;
