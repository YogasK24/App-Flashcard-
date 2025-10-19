import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCardStore } from '../store/cardStore';
import { shuffleArray } from '../utils/gameUtils';
import Icon from '../components/Icon';
import PairBox from '../components/PairBox';
import GameHeader from '../components/GameHeader';

interface PairItem {
  id: string; // ID unik untuk kotak, mis. 'A-123'
  cardId: number;
  type: 'A' | 'B';
  text: string;
  transcription?: string;
  selected: boolean;
  matched: boolean;
  mismatched: boolean;
}

const PairItPage: React.FC = () => {
  const { quizCards, endQuiz, updateCardProgress } = useCardStore(state => ({
    quizCards: state.quizCards,
    endQuiz: state.endQuiz,
    updateCardProgress: state.updateCardProgress,
  }));

  const [gameCardsCount, setGameCardsCount] = useState(0);
  const [pairsA, setPairsA] = useState<PairItem[]>([]);
  const [pairsB, setPairsB] = useState<PairItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<PairItem | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [notEnoughCards, setNotEnoughCards] = useState(false);
  
  // Hitung jumlah pasangan yang cocok dari state `pairsA`.
  // Ini lebih canggih karena progresnya sekarang diturunkan langsung dari
  // sumber kebenaran (state kartu), menghilangkan kebutuhan untuk state `matchedCount` terpisah
  // dan mencegah potensi bug sinkronisasi.
  const matchedCount = pairsA.filter(p => p.matched).length;

  // Atur permainan saat komponen dimuat
  useEffect(() => {
    const shuffled = shuffleArray([...quizCards]);
    let cardsForGame = shuffled.slice(0, 8);
    
    if (cardsForGame.length % 2 !== 0) {
      cardsForGame.pop();
    }
    
    if (cardsForGame.length < 2) {
      setNotEnoughCards(true);
      return;
    }

    setGameCardsCount(cardsForGame.length);

    const initialPairsA: PairItem[] = [];
    const initialPairsB: PairItem[] = [];

    cardsForGame.forEach(card => {
        initialPairsA.push({
            id: `A-${card.id}`,
            cardId: card.id!,
            type: 'A',
            text: card.front,
            selected: false,
            matched: false,
            mismatched: false,
        });
        initialPairsB.push({
            id: `B-${card.id}`,
            cardId: card.id!,
            type: 'B',
            text: card.back,
            transcription: card.transcription,
            selected: false,
            matched: false,
            mismatched: false,
        });
    });

    setPairsA(shuffleArray(initialPairsA));
    setPairsB(shuffleArray(initialPairsB));
  }, [quizCards]);

  // Periksa penyelesaian permainan
  useEffect(() => {
    // Bergantung pada `pairsA` untuk memicu pengecekan saat status `matched` berubah.
    if (gameCardsCount > 0 && matchedCount === gameCardsCount) {
      setIsComplete(true);
      setTimeout(() => {
        endQuiz();
      }, 2000);
    }
  }, [pairsA, gameCardsCount, matchedCount, endQuiz]);

  const handleBoxClick = (clickedItem: PairItem) => {
    if (isChecking || clickedItem.matched || clickedItem.id === selectedItem?.id) return;

    // Klik Pertama
    if (!selectedItem) {
      setSelectedItem(clickedItem);
      const listSetter = clickedItem.type === 'A' ? setPairsA : setPairsB;
      listSetter(prev => prev.map(p => p.id === clickedItem.id ? { ...p, selected: true } : p));
      return;
    }

    // Klik Kedua (harus dari tipe yang berbeda)
    if (selectedItem.type === clickedItem.type) return;

    setIsChecking(true);
    const clickedItemSetter = clickedItem.type === 'A' ? setPairsA : setPairsB;
    const selectedItemSetter = selectedItem.type === 'A' ? setPairsA : setPairsB;

    // Periksa Kecocokan
    if (selectedItem.cardId === clickedItem.cardId) {
      // COCOK
      const cardToUpdate = quizCards.find(card => card.id === clickedItem.cardId);
      if (cardToUpdate) {
        updateCardProgress(cardToUpdate, 'ingat');
      }
      
      setTimeout(() => {
        setPairsA(prev => prev.map(p => p.cardId === clickedItem.cardId ? { ...p, matched: true, selected: false } : p));
        setPairsB(prev => prev.map(p => p.cardId === clickedItem.cardId ? { ...p, matched: true, selected: false } : p));
        setSelectedItem(null);
        setIsChecking(false);
      }, 400);

    } else {
      // TIDAK COCOK
      clickedItemSetter(prev => prev.map(p => p.id === clickedItem.id ? { ...p, selected: true, mismatched: true } : p));
      selectedItemSetter(prev => prev.map(p => p.id === selectedItem.id ? { ...p, mismatched: true } : p));

      setTimeout(() => {
        setPairsA(prev => prev.map(p => p.selected || p.mismatched ? { ...p, selected: false, mismatched: false } : p));
        setPairsB(prev => prev.map(p => p.selected || p.mismatched ? { ...p, selected: false, mismatched: false } : p));
        setSelectedItem(null);
        setIsChecking(false);
      }, 1000);
    }
  };

  // Kalkulasi progres sekarang menggunakan `matchedCount` yang diturunkan.
  const progressPercentage = gameCardsCount > 0 ? (matchedCount / gameCardsCount) * 100 : 0;
  
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

  if (isComplete) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-4 animate-fade-in-slow">
        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1, transition: { type: 'spring' } }}>
          <Icon name="sparkle" className="w-24 h-24 mb-6 text-yellow-400" />
        </motion.div>
        <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Luar Biasa!</h2>
        <p className="text-gray-500 dark:text-[#C8C5CA]">Anda telah mencocokkan semua {gameCardsCount} pasang.</p>
      </div>
    );
  }

  const renderColumn = (items: PairItem[]) => (
    <motion.div layout className="space-y-3">
      <AnimatePresence>
        {items.map(item => (
          !item.matched && (
            <motion.div
              layout
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.3 } }}
            >
              <PairBox
                text={item.text}
                transcription={item.transcription}
                type={item.type}
                selected={item.selected}
                matched={item.matched}
                mismatched={item.mismatched}
                onClick={() => handleBoxClick(item)}
              />
            </motion.div>
          )
        ))}
      </AnimatePresence>
    </motion.div>
  );

  return (
    <div className="flex flex-col h-full p-4 overflow-hidden">
      <GameHeader 
        modeTitle="Cocokkan Pasangan"
        currentIndex={matchedCount}
        totalCards={gameCardsCount}
        progress={progressPercentage}
      />
      
      <main className="flex-grow grid grid-cols-2 gap-3 overflow-y-auto pt-2">
        {renderColumn(pairsA)}
        {renderColumn(pairsB)}
      </main>

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
    </div>
  );
};

export default PairItPage;