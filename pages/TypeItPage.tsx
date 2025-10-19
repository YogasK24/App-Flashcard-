import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCardStore } from '../store/cardStore';
import { useThemeStore } from '../store/themeStore';
import Icon from '../components/Icon';
import { useQuizTimer } from '../hooks/useQuizTimer';
import GameHeader from '../components/GameHeader';
import CircularTimerButton from '../components/CircularTimerButton';
import SessionCompleteModal from '../components/SessionCompleteModal';

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
  const { quizCards, updateCardProgress, endQuiz, quizMode } = useCardStore(state => ({
    quizCards: state.quizCards,
    updateCardProgress: state.updateCardProgress,
    endQuiz: state.endQuiz,
    quizMode: state.quizMode,
  }));
  const { studyDirection, timerDuration } = useThemeStore(state => ({
    studyDirection: state.studyDirection,
    timerDuration: state.timerDuration,
  }));

  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [correctAnswerCount, setCorrectAnswerCount] = useState(0); // State baru untuk melacak jawaban benar
  const [inputValue, setInputValue] = useState('');
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [isAnswered, setIsAnswered] = useState(false);
  const [isSessionComplete, setIsSessionComplete] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentCard = useMemo(() => quizCards[currentCardIndex], [quizCards, currentCardIndex]);
  const questionField = studyDirection === 'kanji' ? 'front' : 'back';
  const answerField = studyDirection === 'kanji' ? 'back' : 'front';
  
  useEffect(() => {
    if (quizCards.length > 0 && currentCardIndex >= quizCards.length) {
      setIsSessionComplete(true);
    }
  }, [currentCardIndex, quizCards.length]);

  const advanceToNext = (isCorrect: boolean) => {
    if (isCorrect) {
      setCorrectAnswerCount(prev => prev + 1); // Tambahkan hitungan jika benar
    }
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
  
  const { timerProgress, stopTimer } = useQuizTimer({
    key: currentCard?.id,
    initialTime: quizMode === 'blitz' ? timerDuration : 0,
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

    if (quizMode === 'blitz') {
      stopTimer();
    }

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
  
  if (isSessionComplete) {
    return <SessionCompleteModal isOpen={true} onExit={endQuiz} />;
  }
  
  if (!currentCard) {
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
  
  // Perbarui kalkulasi progres untuk menggunakan jawaban benar
  const progressPercentage = quizCards.length > 0 ? (correctAnswerCount / quizCards.length) * 100 : 0;

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

      <GameHeader
        modeTitle="Ketik Jawaban"
        currentIndex={Math.min(currentCardIndex + 1, quizCards.length)}
        totalCards={quizCards.length}
        progress={progressPercentage}
        boxInfo={quizMode === 'sr' && currentCard ? `Box ${currentCard.repetitions + 1}` : undefined}
      />
      
      <main className="flex-grow flex flex-col justify-start items-center w-full pt-8">
        <AnimatePresence mode="wait">
          {currentCard && (
            <motion.div
              key={currentCard.id}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              className="w-full flex flex-col items-center"
            >
              <div className="bg-gray-200 dark:bg-[#4A4458] rounded-xl flex items-center justify-center p-6 w-full h-48 max-w-lg mx-auto mb-8">
                  <p className="text-4xl md:text-5xl font-bold text-center text-gray-900 dark:text-[#E6E1E5]">
                      {currentCard[questionField]}
                  </p>
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
          )}
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

      <div className="flex-shrink-0 mt-auto pt-6 flex justify-center items-center h-28">
        <CircularTimerButton
          onClick={() => handleSubmit()}
          timerProgress={quizMode === 'blitz' ? timerProgress : 1}
          disabled={isAnswered || !inputValue.trim()}
        >
          Periksa
        </CircularTimerButton>
      </div>

      <SessionCompleteModal
        isOpen={isSessionComplete}
        onExit={endQuiz}
      />
    </div>
  );
};

export default TypeItPage;