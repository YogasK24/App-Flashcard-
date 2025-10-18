import React, { useState, useEffect } from 'react';
import { useCardStore } from '../store/cardStore';
import Flashcard from '../components/Flashcard';
import QuizHeader from '../components/QuizHeader';
import QuizControls from '../components/QuizControls';
import Icon from '../components/Icon';

const Quiz: React.FC = () => {
  const { quizCards, updateCardSrs, endQuiz } = useCardStore(state => ({
    quizCards: state.quizCards,
    updateCardSrs: state.updateCardSrs,
    endQuiz: state.endQuiz,
  }));

  const [isFlipped, setIsFlipped] = useState(false);
  const [totalCards, setTotalCards] = useState(0);

  // Atur total awal dan reset pada kuis baru
  useEffect(() => {
    if (quizCards.length > 0 && totalCards === 0) {
      setTotalCards(quizCards.length);
    }
  }, [quizCards.length, totalCards]);

  const currentCard = quizCards[0]; // Selalu bekerja dengan kartu pertama dalam antrian

  const reviewedCount = totalCards - quizCards.length;

  if (!currentCard && totalCards > 0) {
    // Ini ditampilkan ketika quizCards kosong tetapi kuis telah dimulai
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-[#C8C5CA] p-4">
        <Icon name="folder" className="w-24 h-24 mb-6 opacity-50" />
        <h2 className="text-2xl font-bold mb-2">Kuis Selesai!</h2>
        <p className="mb-6">Kerja bagus! Semua {totalCards} kartu yang perlu diulang telah diselesaikan.</p>
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
    return null; // Atau tampilkan state loading/kosong jika kuis belum dimulai dengan benar
  }

  const handleShowAnswer = () => {
    setIsFlipped(true);
  };

  const handleRate = async (quality: number) => {
    await updateCardSrs(currentCard, quality);
    // Setelah updateCardSrs, store diperbarui, quizCards menyusut,
    // dan komponen ini dirender ulang dengan kartu berikutnya di indeks 0.
    // Kita hanya perlu mereset state flip untuk kartu baru.
    setIsFlipped(false);
  };

  return (
    <div className="flex flex-col h-full p-4">
      {/* Tampilkan jumlah kartu yang diulas dari total */}
      <QuizHeader currentCardIndex={reviewedCount} totalCards={totalCards} />
      <div className="flex-grow flex flex-col items-center justify-center">
        <Flashcard
          front={currentCard.front}
          back={currentCard.back}
          isFlipped={isFlipped}
        />
        <QuizControls
          isFlipped={isFlipped}
          onShowAnswer={handleShowAnswer}
          onRate={handleRate}
        />
      </div>
    </div>
  );
};

export default Quiz;
