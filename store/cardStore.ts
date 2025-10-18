import { create } from 'zustand';
import { db } from '../services/databaseService';
import { Deck, Card } from '../types';
import { calculateSrsData, getNextDueDate } from '../services/cardService';

interface CardStoreState {
  quizDeck: Deck | null;
  quizCards: Card[];
  startQuiz: (deckId: number) => Promise<void>;
  endQuiz: () => void;
  updateCardSrs: (card: Card, quality: number) => Promise<void>;
  addDeck: (title: string, iconType: 'document' | 'folder', parentId: number | null) => Promise<void>;
  addCardToDeck: (deckId: number, front: string, back: string) => Promise<void>;
  getDecksByParentId: (parentId: number | null) => Promise<Deck[]>;
  getDeckPath: (deckId: number | null) => Promise<Deck[]>;
}

export const useCardStore = create<CardStoreState>((set, get) => ({
  quizDeck: null,
  quizCards: [],

  addDeck: async (title: string, iconType: 'document' | 'folder', parentId: number | null) => {
    try {
      const newDeckData: Omit<Deck, 'id'> = {
        title,
        parentId: parentId,
        iconType,
        cardCount: 0,
        progress: 0,
        dueCount: 0,
      };
      await db.decks.add(newDeckData as Deck);
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

      set({ quizDeck: deck, quizCards: cardsToReview });
    } catch (error) {
      console.error("Gagal memulai kuis:", error);
    }
  },

  endQuiz: () => {
    set({ quizDeck: null, quizCards: [] });
  },

  updateCardSrs: async (card: Card, quality: number) => {
    const { interval, easeFactor } = calculateSrsData(quality, { interval: card.interval, easeFactor: card.easeFactor });
    const dueDate = getNextDueDate(interval);
    
    await db.cards.update(card.id!, {
      interval,
      easeFactor,
      dueDate,
    });

    set(state => ({
      quizCards: state.quizCards.filter(c => c.id !== card.id)
    }));
  },

  getDecksByParentId: async (parentId: number | null): Promise<Deck[]> => {
    try {
      const decksFromDb = parentId === null
        ? await db.decks.filter(deck => deck.parentId === null).toArray()
        : await db.decks.where({ parentId: parentId }).toArray();
      
      const decksWithCounts = await Promise.all(
        decksFromDb.map(async (deck) => {
          if (deck.iconType === 'folder') {
            return { ...deck, cardCount: 0, dueCount: 0, progress: 0 };
          }
          const cardCount = await db.cards.where('deckId').equals(deck.id!).count();
          const dueCount = await db.cards
            .where('deckId')
            .equals(deck.id!)
            .and((card) => card.dueDate <= new Date())
            .count();
          const studiedCount = await db.cards.where({ deckId: deck.id! }).filter(c => c.interval > 0).count();
          const progress = cardCount > 0 ? (studiedCount / cardCount) * 100 : 0;

          return { ...deck, cardCount, dueCount, progress };
        })
      );
      return decksWithCounts;
    } catch (error) {
      console.error(`Gagal mengambil dek berdasarkan parentId ${parentId}:`, error);
      return [];
    }
  },
  
  getDeckPath: async (deckId: number | null): Promise<Deck[]> => {
    if (deckId === null) {
      return [];
    }
    
    try {
      const path: Deck[] = [];
      let currentId: number | null = deckId;

      while (currentId !== null) {
        const currentDeck = await db.decks.get(currentId);
        if (!currentDeck) {
          console.error(`Deck dengan id ${currentId} tidak ditemukan di dalam path.`);
          break;
        }
        path.push(currentDeck);
        currentId = currentDeck.parentId;
      }

      return path.reverse();
    } catch (error) {
      console.error(`Gagal mengambil jalur dek untuk id ${deckId}:`, error);
      return [];
    }
  },

}));