import create from 'zustand';
import { db } from '../services/databaseService';
import { Deck, Card } from '../types';
import { calculateSrsData, getNextDueDate } from '../services/cardService';

interface CardStoreState {
  decks: Deck[];
  loading: boolean;
  quizDeck: Deck | null;
  quizCards: Card[];
  fetchDecks: () => Promise<void>;
  addDeck: (title: string) => Promise<void>;
  startQuiz: (deckId: number) => Promise<void>;
  endQuiz: () => void;
  updateCardSrs: (card: Card, quality: number) => Promise<void>;
  addCardToDeck: (deckId: number, front: string, back: string) => Promise<void>;
}

export const useCardStore = create<CardStoreState>((set, get) => ({
  decks: [],
  loading: true,
  quizDeck: null,
  quizCards: [],

  fetchDecks: async () => {
    set({ loading: true });
    try {
      const decksFromDb = await db.decks.toArray();
      const decksWithCounts = await Promise.all(
        decksFromDb.map(async (deck) => {
          const cardCount = await db.cards.where('deckId').equals(deck.id!).count();
          const dueCount = await db.cards
            .where('deckId')
            .equals(deck.id!)
            .and((card) => card.dueDate <= new Date())
            .count();
          // Perhitungan progres bisa lebih canggih
          const studiedCount = await db.cards.where({ deckId: deck.id! }).filter(c => c.interval > 0).count();
          const progress = cardCount > 0 ? (studiedCount / cardCount) * 100 : 0;

          return { ...deck, cardCount, dueCount, progress, iconType: 'document' as const };
        })
      );
      set({ decks: decksWithCounts, loading: false });
    } catch (error) {
      console.error("Gagal mengambil dek:", error);
      set({ loading: false });
    }
  },

  addDeck: async (title: string) => {
    try {
      const newDeck: Omit<Deck, 'id' | 'cardCount' | 'progress' | 'dueCount' | 'iconType'> = {
        title,
      };
      await db.decks.add(newDeck as Deck);
      await get().fetchDecks(); // Muat ulang daftar
    } catch (error) {
      console.error("Gagal menambahkan dek:", error);
    }
  },

  addCardToDeck: async (deckId: number, front: string, back: string) => {
    try {
      const newCard: Card = {
          deckId,
          front,
          back,
          dueDate: new Date(),
          interval: 0,
          easeFactor: 2.5,
      };
      await db.cards.add(newCard);
      await get().fetchDecks(); // Muat ulang hitungan
    } catch (error) {
        console.error("Gagal menambahkan kartu:", error);
    }
  },

  startQuiz: async (deckId: number) => {
    try {
      const deck = await db.decks.get(deckId);
      if (!deck) throw new Error("Dek tidak ditemukan");
      
      const cardsToReview = await db.cards
        .where('deckId')
        .equals(deckId)
        .and((card) => card.dueDate <= new Date())
        .toArray();

      // Jika tidak ada kartu yang jatuh tempo, mungkin ambil beberapa yang baru? Untuk saat ini, hanya ulas kartu yang jatuh tempo.
      set({ quizDeck: { ...deck, cardCount: 0, progress: 0, dueCount: 0, iconType: 'document' }, quizCards: cardsToReview });
    } catch (error) {
      console.error("Gagal memulai kuis:", error);
    }
  },

  endQuiz: () => {
    set({ quizDeck: null, quizCards: [] });
    get().fetchDecks(); // Muat ulang statistik dek setelah kuis
  },

  updateCardSrs: async (card: Card, quality: number) => {
    const { interval, easeFactor } = calculateSrsData(quality, { interval: card.interval, easeFactor: card.easeFactor });
    const dueDate = getNextDueDate(interval);
    
    await db.cards.update(card.id!, {
      interval,
      easeFactor,
      dueDate,
    });

    // Hapus kartu dari sesi kuis saat ini
    set(state => ({
      quizCards: state.quizCards.filter(c => c.id !== card.id)
    }));
  },

}));
