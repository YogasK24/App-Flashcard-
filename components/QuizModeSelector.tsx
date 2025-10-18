import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useCardStore } from '../store/cardStore';
import ModeItem from './ModeItem';
import Icon from './Icon';

interface QuizModeSelectorProps {
  deckId: number;
  onClose: () => void;
}

type GameType = 'pair-it' | 'guess-it' | 'recall-it' | 'type-it';

const backdropVariants = {
  visible: { opacity: 1 },
  hidden: { opacity: 0 },
  exit: { opacity: 0 },
};

const modalVariants = {
  hidden: { y: "100%", opacity: 0 },
  visible: { 
    y: 0,
    opacity: 1,
    transition: { type: "spring", damping: 30, stiffness: 250 }
  },
  exit: {
    y: "100%",
    opacity: 0,
    transition: { type: "spring", damping: 30, stiffness: 250 }
  }
};


const QuizModeSelector: React.FC<QuizModeSelectorProps> = ({ deckId, onClose }) => {
  const [currentMenu, setCurrentMenu] = useState<'main' | 'sub-mode' | 'sub-game'>('main');
  const [stats, setStats] = useState({ newCount: 0, repeatCount: 0, learnedCount: 0, totalCount: 0 });
  const [loading, setLoading] = useState(true);

  const { getDeckStats, startQuiz, startGame } = useCardStore(state => ({
    getDeckStats: state.getDeckStats,
    startQuiz: state.startQuiz,
    startGame: state.startGame,
  }));

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      const fetchedStats = await getDeckStats(deckId);
      setStats(fetchedStats);
      setLoading(false);
    };
    if (deckId) {
      fetchStats();
    }
  }, [deckId, getDeckStats]);


  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleStartQuiz = (cardSet: 'new' | 'review_all' | 'due', quizMode?: 'sr' | 'simple' | 'blitz') => {
    startQuiz(deckId, cardSet, quizMode);
    onClose();
  };

  const handleStartGame = (gameType: GameType) => {
    startGame(deckId, gameType);
    onClose();
  };

  const renderMainMenu = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
            <p className="text-gray-500 dark:text-gray-400">Memuat statistik...</p>
        </div>
      );
    }
    
    const wordsLeftToGame = stats.totalCount;

    return (
      <div>
        <h2 id="quiz-mode-title" className="text-xl font-bold text-center mb-2 text-gray-900 dark:text-white">Pilih Mode Belajar</h2>
        <div className="p-2">
            <ModeItem 
                icon="edit"
                iconColor="text-green-500"
                title="Learn"
                subtitle={`${stats.newCount} new words`}
                onClick={() => handleStartQuiz('new')}
                disabled={stats.newCount === 0}
            />
            <ModeItem 
                icon="refresh"
                iconColor="text-blue-500"
                title="Repeat"
                subtitle={`Repeat ${stats.repeatCount} words`}
                onClick={() => setCurrentMenu('sub-mode')}
                disabled={stats.repeatCount === 0}
            />
            <ModeItem 
                icon="search"
                iconColor="text-purple-500"
                title="Check learned words"
                subtitle={`${stats.learnedCount} words`}
                onClick={() => setCurrentMenu('sub-mode')}
                disabled={stats.learnedCount === 0}
            />
            <ModeItem 
                icon="document"
                iconColor="text-orange-500"
                title="Review words"
                subtitle={`${stats.learnedCount} words to review`}
                onClick={() => handleStartQuiz('review_all')}
                disabled={stats.learnedCount === 0}
            />
            <ModeItem 
                icon="play"
                iconColor="text-red-500"
                title="One game"
                subtitle={`Play with ${wordsLeftToGame} words`}
                onClick={() => setCurrentMenu('sub-game')}
                disabled={wordsLeftToGame === 0}
            />
        </div>
      </div>
    );
  };
  
  const renderSubModeMenu = () => {
    return (
      <div>
        <div className="flex items-center mb-2">
            <button onClick={() => setCurrentMenu('main')} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10" aria-label="Kembali">
                <Icon name="chevronLeft" className="w-6 h-6" />
            </button>
            <h2 id="quiz-mode-title" className="text-xl font-bold text-center flex-grow text-gray-900 dark:text-white pr-8">
                Pilih Mode
            </h2>
        </div>
        <div className="p-2">
            <ModeItem 
                title="Spaced repetition mode"
                subtitle="Gunakan algoritma SM-2 untuk hasil optimal."
                onClick={() => handleStartQuiz('due', 'sr')}
            />
            <ModeItem 
                title="Simple mode"
                subtitle="Ulangi kartu secara berurutan."
                onClick={() => handleStartQuiz('due', 'simple')}
            />
            <ModeItem 
                title="Blitz mode"
                subtitle="Uji kecepatanmu dengan waktu terbatas."
                onClick={() => handleStartQuiz('due', 'blitz')}
                highlighted={true}
            />
        </div>
      </div>
    );
  };

  const renderSubGameMenu = () => {
    return (
      <div>
        <div className="flex items-center mb-2">
            <button onClick={() => setCurrentMenu('main')} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10" aria-label="Kembali">
                <Icon name="chevronLeft" className="w-6 h-6" />
            </button>
            <h2 id="quiz-mode-title" className="text-xl font-bold text-center flex-grow text-gray-900 dark:text-white pr-8">
                Pilih Permainan
            </h2>
        </div>
        <div className="p-2">
            <ModeItem 
                icon="swap"
                iconColor="text-teal-500"
                title="Pair It"
                subtitle="Cocokkan kata dengan definisinya."
                onClick={() => handleStartGame('pair-it')}
            />
            <ModeItem 
                icon="search"
                iconColor="text-yellow-500"
                title="Guess It"
                subtitle="Tebak kata dari pilihan yang ada."
                onClick={() => handleStartGame('guess-it')}
            />
             <ModeItem 
                icon="document"
                iconColor="text-indigo-500"
                title="Recall It"
                subtitle="Ingat dan tuliskan jawabannya."
                onClick={() => handleStartGame('recall-it')}
            />
            <ModeItem 
                icon="edit"
                iconColor="text-rose-500"
                title="Type It"
                subtitle="Ketik jawaban secepat mungkin."
                onClick={() => handleStartGame('type-it')}
            />
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (currentMenu) {
      case 'main':
        return renderMainMenu();
      case 'sub-mode':
        return renderSubModeMenu();
      case 'sub-game':
         return renderSubGameMenu();
      default:
        return null;
    }
  };

  return (
    <motion.div
      onClick={handleBackdropClick}
      className="fixed inset-0 bg-black/60 flex items-end justify-center z-50"
      aria-modal="true"
      role="dialog"
      aria-labelledby="quiz-mode-title"
      variants={backdropVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <motion.div 
        onClick={(e) => e.stopPropagation()}
        variants={modalVariants}
        className="bg-white dark:bg-[#2B2930] pt-3 pb-4 rounded-t-2xl shadow-2xl w-full max-w-md"
      >
        <div className="w-10 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-3" />
        {renderContent()}
      </motion.div>
    </motion.div>
  );
};

export default QuizModeSelector;