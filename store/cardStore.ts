import { create } from 'zustand';
import { db } from '../services/databaseService';
import { Deck, Card } from '../types';
import { calculateSrsData, getNextDueDate } from '../services/cardService';

type GameType = 'pair-it' | 'guess-it' | 'recall-it' | 'type-it';

interface CardStoreState {
  quizDeck: Deck | null;
  quizCards: Card[];
  quizMode: 'sr' | 'simple' | 'blitz' | null;
  gameType: GameType | null;
  startQuiz: (deckId: number, cardSet?: 'due' | 'new' | 'review_all', quizMode?: 'sr' | 'simple' | 'blitz') => Promise<void>;
  startGame: (deckId: number, gameType: GameType) => Promise<void>;
  endQuiz: () => void;
  updateCardSrs: (card: Card, quality: number) => Promise<void>;
  addDeck: (title: string, type: 'deck' | 'folder', parentId: number | null) => Promise<void>;
  deleteDeck: (deckId: number) => Promise<void>;
  updateDeckTitle: (deckId: number, newTitle: string) => Promise<void>;
  duplicateDeck: (deckId: number) => Promise<void>;
  updateDeckParent: (deckId: number, newParentId: number | null) => Promise<void>;
  addCardToDeck: (deckId: number, front: string, back: string) => Promise<void>;
  updateCard: (cardId: number, front: string, back: string) => Promise<void>;
  deleteCard: (cardId: number) => Promise<void>;
  getDecksByParentId: (parentId: number | null) => Promise<Deck[]>;
  getDeckById: (deckId: number) => Promise<Deck | undefined>;
  getCardsByDeckId: (deckId: number) => Promise<Card[]>;
  getDeckPath: (deckId: number | null) => Promise<Deck[]>;
  getPossibleParentDecks: (deckId: number) => Promise<Deck[]>;
  getDeckStats: (deckId: number) => Promise<{ newCount: number; repeatCount: number; learnedCount: number; totalCount: number; }>;
}

export const useCardStore = create<CardStoreState>((set, get) => ({
  quizDeck: null,
  quizCards: [],
  quizMode: null,
  gameType: null,

  addDeck: async (title: string, type: 'deck' | 'folder', parentId: number | null) => {
    try {
      const newDeckData: Omit<Deck, 'id'> = {
        title,
        parentId: parentId,
        type,
        cardCount: 0,
        progress: 0,
        dueCount: 0,
      };
      await db.decks.add(newDeckData as Deck);
    } catch (error) {
      console.error("Gagal menambahkan dek:", error);
    }
  },

  deleteDeck: async (deckId: number) => {
    try {
      // Kumpulkan semua ID dek yang akan dihapus (termasuk turunan)
      const deckIdsToDelete: number[] = [];
      const queue: number[] = [deckId];
      
      while (queue.length > 0) {
        const currentId = queue.shift()!;
        deckIdsToDelete.push(currentId);
        
        const children = await db.decks.where({ parentId: currentId }).toArray();
        for (const child of children) {
          queue.push(child.id);
        }
      }
      
      // Hapus semua dalam satu transaksi
      await db.transaction('rw', db.decks, db.cards, async () => {
        // Hapus semua kartu yang terkait dengan dek-dek ini
        await db.cards.where('deckId').anyOf(deckIdsToDelete).delete();
        // Hapus semua dek itu sendiri
        await db.decks.bulkDelete(deckIdsToDelete);
      });
      
    } catch (error) {
      console.error(`Gagal menghapus dek ${deckId} dan turunannya:`, error);
    }
  },
  
  updateDeckTitle: async (deckId: number, newTitle: string) => {
    try {
        await db.decks.update(deckId, { title: newTitle });
    } catch (error) {
        console.error(`Gagal memperbarui judul dek ${deckId}:`, error);
    }
  },

  duplicateDeck: async (deckId: number) => {
    try {
        await db.transaction('rw', db.decks, db.cards, async () => {
            const originalDeck = await db.decks.get(deckId);
            if (!originalDeck) {
                throw new Error(`Dek dengan ID ${deckId} tidak ditemukan.`);
            }
            
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { id, ...rest } = originalDeck;
            const newDeckData: Omit<Deck, 'id'> = {
                ...rest,
                title: `${originalDeck.title} - Salinan`,
            };

            const newDeckId = await db.decks.add(newDeckData as Deck);

            if (originalDeck.type === 'deck') {
                const originalCards = await db.cards.where({ deckId }).toArray();
                
                if (originalCards.length > 0) {
                    const newCards = originalCards.map(card => {
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        const { id: cardId, ...cardRest } = card;
                        const newCard: Omit<Card, 'id'> = {
                            ...cardRest,
                            deckId: newDeckId,
                        };
                        return newCard as Card;
                    });
                    await db.cards.bulkAdd(newCards);
                }
            }
        });
    } catch (error) {
        console.error(`Gagal menduplikasi dek ${deckId}:`, error);
    }
  },

  updateDeckParent: async (deckId: number, newParentId: number | null) => {
    try {
      await db.decks.update(deckId, { parentId: newParentId });
    } catch (error) {
      console.error(`Gagal memperbarui parent dek ${deckId}:`, error);
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

  updateCard: async (cardId: number, front: string, back: string) => {
    try {
        await db.cards.update(cardId, { front, back });
    } catch (error) {
        console.error(`Gagal memperbarui kartu ${cardId}:`, error);
    }
  },

  deleteCard: async (cardId: number) => {
    try {
        const cardToDelete = await db.cards.get(cardId);
        if (!cardToDelete) {
            console.error(`Kartu dengan ID ${cardId} tidak ditemukan.`);
            return;
        }

        await db.transaction('rw', db.cards, db.decks, async () => {
            // Hapus kartu
            await db.cards.delete(cardId);
        });

    } catch (error) {
        console.error(`Gagal menghapus kartu ${cardId}:`, error);
    }
  },

  startQuiz: async (deckId: number, cardSet: 'due' | 'new' | 'review_all' = 'due', quizMode: 'sr' | 'simple' | 'blitz' = 'sr') => {
    try {
      const deck = await db.decks.get(deckId);
      if (!deck) throw new Error("Dek tidak ditemukan");

      let cardsToReview: Card[] = [];
      const now = new Date();

      switch (cardSet) {
        case 'new':
          cardsToReview = await db.cards
            .where({ deckId: deckId, interval: 0 })
            .toArray();
          break;
        case 'review_all':
          cardsToReview = await db.cards
            .where('deckId')
            .equals(deckId)
            .and(card => card.interval > 0)
            .toArray();
          break;
        case 'due':
        default:
          cardsToReview = await db.cards
            .where('deckId')
            .equals(deckId)
            .and(card => card.dueDate <= now)
            .toArray();
          break;
      }

      if (cardsToReview.length > 0) {
        set({ quizDeck: deck, quizCards: cardsToReview, quizMode, gameType: null });
      } else {
        console.log(`No cards to review for card set: ${cardSet}`);
        // Di masa depan, kita bisa menampilkan notifikasi kepada pengguna.
      }
    } catch (error) {
      console.error("Gagal memulai kuis:", error);
    }
  },
  
  startGame: async (deckId: number, gameType: GameType) => {
    try {
      const deck = await db.decks.get(deckId);
      if (!deck) throw new Error("Dek tidak ditemukan");

      // Untuk permainan, biasanya kita memuat semua kartu
      const allCards = await db.cards.where({ deckId }).toArray();
      
      if (allCards.length > 0) {
        set({ quizDeck: deck, quizCards: allCards, gameType, quizMode: null });
      } else {
        console.log("Tidak ada kartu di dek ini untuk memulai permainan.");
      }
    } catch (error) {
        console.error("Gagal memulai permainan:", error);
    }
  },

  endQuiz: () => {
    set({ quizDeck: null, quizCards: [], quizMode: null, gameType: null });
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
          if (deck.type === 'folder') {
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
  
  getDeckById: async (deckId: number): Promise<Deck | undefined> => {
    try {
        return await db.decks.get(deckId);
    } catch (error) {
        console.error(`Gagal mengambil dek dengan ID ${deckId}:`, error);
        return undefined;
    }
  },

  getCardsByDeckId: async (deckId: number): Promise<Card[]> => {
    try {
        return await db.cards.where({ deckId }).toArray();
    } catch (error) {
        console.error(`Gagal mengambil kartu untuk dek ${deckId}:`, error);
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

  getPossibleParentDecks: async (deckId: number): Promise<Deck[]> => {
    try {
      // Kumpulkan semua ID dek turunan untuk dikecualikan
      const descendantIds = new Set<number>();
      const queue: number[] = [deckId];
      
      while (queue.length > 0) {
        const currentId = queue.shift()!;
        descendantIds.add(currentId);
        
        const children = await db.decks.where({ parentId: currentId }).toArray();
        for (const child of children) {
          queue.push(child.id);
        }
      }

      // Ambil semua dek dan filter
      const allDecks = await db.decks.toArray();
      return allDecks.filter(deck => 
        !descendantIds.has(deck.id) && deck.type === 'folder'
      );
    } catch (error) {
      console.error(`Gagal mengambil dek tujuan yang memungkinkan untuk dek ${deckId}:`, error);
      return [];
    }
  },
  
  getDeckStats: async (deckId: number) => {
    try {
        const cards = await db.cards.where({ deckId }).toArray();
        const now = new Date();

        const newCount = cards.filter(c => c.interval === 0).length;
        const repeatCount = cards.filter(c => c.dueDate <= now && c.interval > 0).length;
        const learnedCount = cards.filter(c => c.interval > 0).length;
        const totalCount = cards.length;

        return { newCount, repeatCount, learnedCount, totalCount };
    } catch (error) {
        console.error(`Gagal mendapatkan statistik untuk dek ${deckId}:`, error);
        return { newCount: 0, repeatCount: 0, learnedCount: 0, totalCount: 0 };
    }
  },

}));