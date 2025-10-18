import { create } from 'zustand';
import { db } from '../services/databaseService';
import { Deck, Card } from '../types';
import { calculateSrsData, getNextDueDate } from '../services/cardService';
import { shuffleArray, getDescendantDeckIds, getCardsInHierarchy, setupGameData } from '../utils/gameUtils';

type GameType = 'pair-it' | 'guess-it' | 'recall-it' | 'type-it';

interface AddDeckResult {
  success: boolean;
  message?: string;
}

interface CardStoreState {
  quizDeck: Deck | null;
  quizCards: Card[];
  quizMode: 'sr' | 'simple' | 'blitz' | null;
  gameType: GameType | null;
  startQuiz: (deckId: number, cardSet?: 'due' | 'new' | 'review_all', quizMode?: 'sr' | 'simple' | 'blitz') => Promise<void>;
  startGame: (deckId: number, gameType: GameType, quizMode: 'sr' | 'simple' | 'blitz') => Promise<void>;
  endQuiz: () => void;
  updateCardProgress: (card: Card, feedback: 'lupa' | 'ingat') => Promise<void>;
  addDeck: (title: string, type: 'deck' | 'folder', parentId: number | null) => Promise<AddDeckResult>;
  deleteDeck: (deckId: number) => Promise<void>;
  updateDeckTitle: (deckId: number, newTitle: string) => Promise<void>;
  duplicateDeck: (deckId: number) => Promise<void>;
  updateDeckParent: (deckId: number, newParentId: number | null) => Promise<void>;
  addCardToDeck: (deckId: number, front: string, back: string, transcription?: string, example?: string, imageUrl?: string) => Promise<void>;
  updateCard: (cardId: number, data: Partial<Omit<Card, 'id'>>) => Promise<void>;
  deleteCard: (cardId: number) => Promise<void>;
  getDecksByParentId: (parentId: number | null) => Promise<Deck[]>;
  getDeckById: (deckId: number) => Promise<Deck | undefined>;
  getCardsByDeckId: (deckId: number) => Promise<Card[]>;
  getDeckPath: (deckId: number | null) => Promise<Deck[]>;
  getPossibleParentDecks: (deckId: number) => Promise<Deck[]>;
  getDeckStats: (deckId: number) => Promise<{ newCount: number; repeatCount: number; learnedCount: number; totalCount: number; }>;
  recalculateAllDeckStats: () => Promise<void>;
  getCardCountInHierarchy: (folderId: number) => Promise<number>;
}

export const useCardStore = create<CardStoreState>((set, get) => ({
  quizDeck: null,
  quizCards: [],
  quizMode: null,
  gameType: null,

  recalculateAllDeckStats: async () => {
    try {
        await db.transaction('rw', db.decks, db.cards, async () => {
            const allDecks = await db.decks.toArray();
            const allCards = await db.cards.toArray();
            const now = new Date();

            const cardsByDeckId = allCards.reduce((acc, card) => {
                if (!acc[card.deckId]) acc[card.deckId] = [];
                acc[card.deckId].push(card);
                return acc;
            }, {} as Record<number, Card[]>);
            
            const deckMap = new Map<number, Deck>(allDecks.map(d => [d.id, { ...d }]));
            
            // Langkah 1: Hitung statistik untuk setiap dek individual
            for (const deck of deckMap.values()) {
                if (deck.type === 'deck') {
                    const deckCards = cardsByDeckId[deck.id] || [];
                    deck.cardCount = deckCards.length;
                    deck.dueCount = deckCards.filter(c => c.dueDate <= now).length;
                    const studiedCount = deckCards.filter(c => c.interval > 0).length;
                    deck.progress = deck.cardCount > 0 ? (studiedCount / deck.cardCount) * 100 : 0;
                } else {
                    // Reset statistik folder sebelum agregasi
                    deck.cardCount = 0;
                    deck.dueCount = 0;
                    deck.progress = 0;
                }
            }

            // Langkah 2: Hitung statistik agregat secara rekursif untuk folder
            // FIX: Bangun childrenMap dari deckMap untuk memastikan konsistensi objek.
            // Ini mencegah bug di mana kalkulasi menggunakan data lama dari `allDecks` asli.
            const childrenMap = new Map<number | null, Deck[]>();
            for (const deck of deckMap.values()) {
                const parentId = deck.parentId ?? null;
                if (!childrenMap.has(parentId)) {
                    childrenMap.set(parentId, []);
                }
                childrenMap.get(parentId)!.push(deck);
            }

            const calculatedFolderIds = new Set<number>();

            const calculateStatsForNode = (deckId: number): Deck => {
                const deck = deckMap.get(deckId)!;
                if (deck.type === 'deck') return deck;
                if (calculatedFolderIds.has(deckId)) return deck;

                const children = childrenMap.get(deckId) || [];
                let totalCardCount = 0;
                let totalDueCount = 0;
                let totalStudiedCount = 0;

                for (const child of children) {
                    const childWithStats = calculateStatsForNode(child.id);
                    totalCardCount += childWithStats.cardCount;
                    totalDueCount += childWithStats.dueCount;
                    totalStudiedCount += (childWithStats.progress / 100) * childWithStats.cardCount;
                }
                
                deck.cardCount = totalCardCount;
                deck.dueCount = totalDueCount;
                deck.progress = totalCardCount > 0 ? (totalStudiedCount / totalCardCount) * 100 : 0;
                
                calculatedFolderIds.add(deckId);
                return deck;
            };

            for (const deck of allDecks) {
                if (deck.type === 'folder') {
                    calculateStatsForNode(deck.id);
                }
            }

            const updatedDecks = Array.from(deckMap.values());
            if (updatedDecks.length > 0) {
                 await db.decks.bulkPut(updatedDecks);
                 console.log(`Statistik diperbarui untuk ${updatedDecks.length} item.`);
            }
        });
    } catch (error) {
        console.error("Gagal melakukan rekalkulasi statistik dek:", error);
    }
  },
  
  getCardCountInHierarchy: async (folderId: number): Promise<number> => {
    try {
        const descendantDeckIds = await getDescendantDeckIds(folderId);

        if (descendantDeckIds.length === 0) {
            return 0;
        }

        const totalCardCount = await db.cards.where('deckId').anyOf(descendantDeckIds).count();
        return totalCardCount;
    } catch (error) {
        console.error(`Gagal menghitung kartu dalam hierarki untuk folder ${folderId}:`, error);
        return 0;
    }
  },

  addDeck: async (title: string, type: 'deck' | 'folder', parentId: number | null): Promise<AddDeckResult> => {
    try {
      let existing: Deck | undefined;

      if (parentId === null) {
        existing = await db.decks
          .filter(deck => deck.parentId === null && deck.title === title)
          .first();
      } else {
        existing = await db.decks
          .where('parentId').equals(parentId)
          .and(deck => deck.title === title)
          .first();
      }

      if (existing) {
        return { success: false, message: `Item dengan nama "${title}" sudah ada di folder ini.` };
      }

      const newDeckData: Omit<Deck, 'id'> = {
        title,
        parentId,
        type,
        cardCount: 0,
        progress: 0,
        dueCount: 0,
      };
      await db.decks.add(newDeckData as Deck);
      // FIX: Selalu panggil recalculateAllDeckStats setelah menambahkan item baru
      // untuk memastikan semua statistik (terutama folder induk) diperbarui
      // dan mencegah inkonsistensi data.
      await get().recalculateAllDeckStats();
      return { success: true };
    } catch (error) {
      console.error("Gagal menambahkan dek:", error);
      const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan yang tidak diketahui.";
      return { success: false, message: errorMessage };
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
      
      await get().recalculateAllDeckStats();
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
        await get().recalculateAllDeckStats();
    } catch (error) {
        console.error(`Gagal menduplikasi dek ${deckId}:`, error);
    }
  },

  updateDeckParent: async (deckId: number, newParentId: number | null) => {
    try {
      await db.decks.update(deckId, { parentId: newParentId });
      await get().recalculateAllDeckStats();
    } catch (error) {
      console.error(`Gagal memperbarui parent dek ${deckId}:`, error);
    }
  },

  addCardToDeck: async (deckId: number, front: string, back: string, transcription?: string, example?: string, imageUrl?: string) => {
    try {
      const newCard: Omit<Card, 'id'> = {
          deckId,
          front,
          back,
          transcription,
          example,
          imageUrl,
          dueDate: new Date(), // Kartu baru langsung jatuh tempo
          interval: 0,
          easeFactor: 2.5,
          repetitions: 0,
          isMastered: false,
      };
      await db.cards.add(newCard as Card);
      await get().recalculateAllDeckStats();
    } catch (error) {
        console.error("Gagal menambahkan kartu:", error);
    }
  },

  updateCard: async (cardId: number, data: Partial<Omit<Card, 'id'>>) => {
    try {
        await db.cards.update(cardId, data);
    } catch (error) {
        console.error(`Gagal memperbarui kartu ${cardId}:`, error);
    }
  },

  deleteCard: async (cardId: number) => {
    try {
      await db.cards.delete(cardId);
      await get().recalculateAllDeckStats();
    } catch (error) {
        console.error(`Gagal menghapus kartu ${cardId}:`, error);
    }
  },

  startQuiz: async (deckId: number, cardSet: 'due' | 'new' | 'review_all' = 'due', quizMode: 'sr' | 'simple' | 'blitz' = 'sr') => {
    try {
      const item = await db.decks.get(deckId);
      if (!item) throw new Error("Item tidak ditemukan");

      // Mengambil semua kartu yang relevan dari hierarki dek/folder
      const allCardsInScope = await getCardsInHierarchy(deckId);

      if (allCardsInScope.length === 0) {
        console.log(`Tidak ada kartu yang ditemukan dalam ${item.type} '${item.title}' untuk memulai kuis.`);
        return;
      }
      
      let cardsToReview: Card[] = [];
      const now = new Date();

      if (quizMode === 'simple') {
        allCardsInScope.sort((a, b) => {
            if (a.interval === 0 && b.interval !== 0) return -1;
            if (a.interval !== 0 && b.interval === 0) return 1;
            return 0;
        });
        cardsToReview = allCardsInScope;
      } else {
        switch (cardSet) {
          case 'new':
            cardsToReview = allCardsInScope.filter(c => c.interval === 0);
            break;
          case 'review_all':
            cardsToReview = allCardsInScope.filter(c => c.interval > 0);
            break;
          case 'due':
          default:
            cardsToReview = allCardsInScope.filter(c => c.dueDate <= now);
            break;
        }
      }

      if (cardsToReview.length > 0) {
        const shuffledCards = shuffleArray(cardsToReview);
        set({ quizDeck: item, quizCards: shuffledCards, quizMode, gameType: null });
      } else {
        console.log(`Tidak ada kartu untuk diulang untuk set: ${cardSet} dengan mode: ${quizMode}`);
      }
    } catch (error) {
      console.error("Gagal memulai kuis:", error);
    }
  },
  
  startGame: async (deckId: number, gameType: GameType, quizMode: 'sr' | 'simple' | 'blitz') => {
    try {
      const item = await db.decks.get(deckId);
      if (!item) throw new Error("Item tidak ditemukan");

      // Gunakan fungsi utilitas baru untuk mendapatkan kartu permainan
      // 'front' digunakan sebagai placeholder karena parameter cardField saat ini tidak mengubah output
      const cardsForGame = await setupGameData(deckId, quizMode, 'front');
      
      if (cardsForGame.length > 0) {
        set({ quizDeck: item, quizCards: cardsForGame, gameType, quizMode });
      } else {
        console.log(`Tidak ada kartu untuk memulai permainan dengan mode: ${quizMode}`);
      }
    } catch (error) {
        console.error("Gagal memulai permainan:", error);
    }
  },

  endQuiz: () => {
    set({ quizDeck: null, quizCards: [], quizMode: null, gameType: null });
  },

  updateCardProgress: async (card: Card, feedback: 'lupa' | 'ingat') => {
    // Memetakan feedback sederhana ke skor kualitas untuk algoritma SM-2
    // 'lupa' -> kualitas rendah (reset), 'ingat' -> kualitas baik (maju)
    const quality = feedback === 'ingat' ? 4 : 2;
    
    const { interval, easeFactor, repetitions } = calculateSrsData(quality, {
      interval: card.interval,
      easeFactor: card.easeFactor,
      repetitions: card.repetitions,
    });
    const dueDate = getNextDueDate(interval);
    const isMastered = repetitions >= 5; // Tandai sebagai dikuasai setelah 5 repetisi berhasil.
    
    await db.cards.update(card.id!, {
      interval,
      easeFactor,
      dueDate,
      repetitions,
      isMastered,
    });

    // Jika pengguna lupa, pindahkan kartu ke akhir antrian untuk diulang dalam sesi ini
    if (feedback === 'lupa') {
      set(state => {
        const cardIndex = state.quizCards.findIndex(c => c.id === card.id);
        
        // Hanya antrikan ulang jika ditemukan dan ada lebih dari satu kartu tersisa
        if (cardIndex > -1 && state.quizCards.length > 1) {
          const newQuizCards = [...state.quizCards];
          const [failedCard] = newQuizCards.splice(cardIndex, 1);
          newQuizCards.push(failedCard);
          return { quizCards: newQuizCards };
        }
        return {}; // Tidak ada perubahan jika tidak ditemukan atau hanya satu kartu
      });
    }
  },

  getDecksByParentId: async (parentId: number | null): Promise<Deck[]> => {
    try {
      if (parentId === null) {
        return await db.decks.filter(deck => deck.parentId === null).toArray();
      }
      const decksFromDb = await db.decks.where('parentId').equals(parentId).toArray();
      return decksFromDb;
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
        const item = await db.decks.get(deckId);
        if (!item) throw new Error("Item tidak ditemukan");

        let targetDeckIds: number[] = [];
        if (item.type === 'folder') {
            targetDeckIds = await getDescendantDeckIds(item.id);
        } else {
            targetDeckIds = [item.id];
        }
        
        if (targetDeckIds.length === 0) {
            return { newCount: 0, repeatCount: 0, learnedCount: 0, totalCount: 0 };
        }

        const cards = await db.cards.where('deckId').anyOf(targetDeckIds).toArray();
        const now = new Date();

        const newCount = cards.filter(c => c.interval === 0).length;
        const repeatCount = cards.filter(c => c.dueDate <= now && c.interval > 0).length;
        const learnedCount = cards.filter(c => c.interval > 0).length;
        const totalCount = cards.length;

        return { newCount, repeatCount, learnedCount, totalCount };
    } catch (error) {
        console.error(`Gagal mendapatkan statistik untuk item ${deckId}:`, error);
        return { newCount: 0, repeatCount: 0, learnedCount: 0, totalCount: 0 };
    }
  },

}));