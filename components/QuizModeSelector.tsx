import React, { useState, useEffect } from 'react';
import { motion, Variants } from 'framer-motion';
import { useCardStore } from '../store/cardStore';
import { useThemeStore } from '../store/themeStore';
import ModeItem from './ModeItem';
import Icon from './Icon';

interface QuizModeSelectorProps {
  deckId: number;
  onClose: () => void;
}

type GameType = 'pair-it' | 'guess-it' | 'recall-it' | 'type-it';
type StudyMode = 'sr' | 'simple' | 'blitz';

const backdropVariants: Variants = {
  visible: { opacity: 1 },
  hidden: { opacity: 0 },
  exit: { opacity: 0 },
};

const modalVariants: Variants = {
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
  const [menuLevel, setMenuLevel] = useState<'main' | 'sub'>('main');
  const [viewMode, setViewMode] = useState<'modes' | 'games'>('games');
  const [stats, setStats] = useState({ newCount: 0, repeatCount: 0, learnedCount: 0, totalCount: 0 });
  const [loading, setLoading] = useState(true);

  const { currentStudyMode, setCurrentStudyMode } = useThemeStore();

  const { getDeckStats, startQuiz, startGame } = useCardStore(state => ({
    getDeckStats: state.getDeckStats,
    startQuiz: state.startQuiz,
    startGame: state.startGame,
  }));

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            onClose();
        }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
        document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

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

  const toggleViewMode = () => {
    setViewMode(prev => (prev === 'games' ? 'modes' : 'games'));
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleStartQuiz = (cardSet: 'new' | 'review_all' | 'due') => {
    startQuiz(deckId, cardSet, currentStudyMode);
    onClose();
  };

  const handleSelectStudyMode = (mode: StudyMode) => {
    setCurrentStudyMode(mode);
    setViewMode('games'); // Kembali ke tampilan pemilihan permainan
  };

  const handleStartGame = (gameType: GameType) => {
    startGame(deckId, gameType, currentStudyMode);
    onClose();
  };

  const handleNavigateToSubMenu = (initialView: 'modes' | 'games') => {
    setViewMode(initialView);
    setMenuLevel('sub');
  };

  const renderMainMenu = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
            <p className="text-gray-500 dark:text-gray-400">Memuat statistik...</p>
        </div>
      );
    }
    
    const isSimpleMode = currentStudyMode === 'simple';

    return (
      <div>
        <h2 id="quiz-mode-title" className="text-xl font-bold text-center mb-2 text-gray-900 dark:text-white">Pilih Mode Belajar</h2>
        <div className="p-2">
            <ModeItem 
                icon="edit"
                iconColor="text-green-500"
                title="Learn"
                subtitle={isSimpleMode ? `Mulai dengan semua ${stats.totalCount} kata` : `${stats.newCount} kata baru`}
                onClick={() => handleStartQuiz('new')}
                disabled={isSimpleMode ? stats.totalCount === 0 : stats.newCount === 0}
            />
            <ModeItem 
                icon="refresh"
                iconColor="text-blue-500"
                title="Repeat"
                subtitle={`Ulangi ${stats.repeatCount} kata`}
                onClick={() => handleStartQuiz('due')}
                disabled={stats.repeatCount === 0}
            />
            <ModeItem 
                icon="search"
                iconColor="text-purple-500"
                title="Check learned words"
                subtitle={`${stats.learnedCount} kata`}
                onClick={() => handleNavigateToSubMenu('modes')}
                disabled={stats.learnedCount === 0}
            />
            <ModeItem 
                icon="document"
                iconColor="text-orange-500"
                title="Review words"
                subtitle={isSimpleMode ? `Ulangi semua ${stats.totalCount} kata` : `${stats.learnedCount} kata untuk diulang`}
                onClick={() => handleStartQuiz('review_all')}
                disabled={isSimpleMode ? stats.totalCount === 0 : stats.learnedCount === 0}
            />
            <ModeItem 
                icon="play"
                iconColor="text-red-500"
                title="One game"
                subtitle={`Bermain dengan ${stats.totalCount} kata`}
                onClick={() => handleNavigateToSubMenu('games')}
                disabled={stats.totalCount === 0}
            />
        </div>
      </div>
    );
  };
  
  const renderSubMenu = () => {
    const isGameView = viewMode === 'games';
    const title = isGameView ? 'Pilih Permainan' : 'Opsi Mode Belajar';
    const toggleIcon = isGameView ? 'tune' : 'gamepad';
    const toggleAriaLabel = isGameView ? 'Beralih ke Mode' : 'Beralih ke Permainan';

    return (
      <div>
        <div className="flex items-center justify-between mb-2 px-2 relative">
          <button onClick={() => setMenuLevel('main')} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors duration-200" aria-label="Kembali">
            <Icon name="chevronLeft" className="w-6 h-6" />
          </button>
          <h2 id="quiz-mode-title" className="absolute left-1/2 -translate-x-1/2 text-xl font-bold text-gray-900 dark:text-white whitespace-nowrap">
            {title}
          </h2>
          <button onClick={toggleViewMode} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors duration-200" aria-label={toggleAriaLabel}>
            <Icon name={toggleIcon} className="w-6 h-6" />
          </button>
        </div>
        {isGameView ? (
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
        ) : (
          <div className="p-2">
            <ModeItem 
                title="Spaced repetition mode"
                subtitle="Pelajari kata dengan sistem pengulangan berjarak."
                onClick={() => handleSelectStudyMode('sr')}
                highlighted={currentStudyMode === 'sr'}
            />
            <ModeItem 
                title="Simple mode"
                subtitle="Semua kata akan tersedia. Anda yang mengontrol."
                onClick={() => handleSelectStudyMode('simple')}
                highlighted={currentStudyMode === 'simple'}
            />
            <ModeItem 
                title="Blitz mode"
                subtitle="Pelajari kata-kata dalam satu kategori sampai tuntas."
                onClick={() => handleSelectStudyMode('blitz')}
                highlighted={currentStudyMode === 'blitz'}
            />
          </div>
        )}
      </div>
    );
  };

  const renderContent = () => {
    switch (menuLevel) {
      case 'main':
        return renderMainMenu();
      case 'sub':
        return renderSubMenu();
      default:
        return null;
    }
  };

  return (
    <motion.div
      onClick={handleBackdropClick}
      className="fixed inset-0 bg-black/60 flex items-end justify-center z-50"
      variants={backdropVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <motion.div 
        onClick={(e) => e.stopPropagation()}
        variants={modalVariants}
        className="bg-white dark:bg-[#2B2930] pt-3 pb-4 rounded-t-2xl shadow-2xl w-full max-w-md"
        role="dialog"
        aria-modal="true"
        aria-labelledby="quiz-mode-title"
      >
        <div className="w-10 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-3" />
        {renderContent()}
      </motion.div>
    </motion.div>
  );
};

export default QuizModeSelector;