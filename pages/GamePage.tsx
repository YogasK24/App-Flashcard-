import React from 'react';
import { useCardStore } from '../store/cardStore';
import PairItPage from './PairItPage';
import GuessItPage from './GuessItPage';
import RecallItPage from './RecallItPage';
import TypeItPage from './TypeItPage';

// Peta untuk merutekan gameType ke komponen yang sesuai
const gameComponents: { [key: string]: React.FC } = {
  'pair-it': PairItPage,
  'guess-it': GuessItPage, 
  'recall-it': RecallItPage,
  'type-it': TypeItPage,
};

const GamePage: React.FC = () => {
  const gameType = useCardStore(state => state.gameType);

  // Pilih komponen permainan yang benar berdasarkan gameType
  const GameComponent = gameType ? gameComponents[gameType] : null;

  if (GameComponent) {
    return <GameComponent />;
  }

  // Fallback jika gameType tidak valid atau belum diimplementasikan
  return null;
};

export default GamePage;
