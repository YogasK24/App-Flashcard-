import { create } from 'zustand';
import { db } from '../services/databaseService';
import { Deck, Card } from '../types';
import { calculateSrsData, getNextDueDate } from '../services/cardService';
import { getDescendantDeckIds, setupGameData } from '../utils/gameUtils';

type GameType = 'pair-it' | 'guess-it' | 'recall-it' | 'type-it';

interface AddDeckResult {
  success: boolean;
  message?: string;
  deckId?: number;
}

interface UpdateDeckResult {
  success: boolean;
  message?: string;
}


interface ParsedImportData {
    headers: string[];
    allData: string[][];
}

interface ImportResult {
    success: boolean;
    count: number;
    message?: string;
}

interface NotificationState {
    isVisible: boolean;
    message: string;
    type: 'success' | 'error';
}

const recalculateStatsOnState = (cards: Card[], decks: Deck[]): Deck[] => {
    const now = new Date();

    const cardsByDeckId = cards.reduce((acc, card) => {
        if (!acc[card.deckId]) acc[card.deckId] = [];
        acc[card.deckId].push(card);
        return acc;
    }, {} as Record<number, Card[]>);
    
    const deckMap = new Map<number, Deck>(decks.map(d => [d.id, { ...d }]));
    
    for (const deck of deckMap.values()) {
        if (deck.type === 'deck') {
            const deckCards = cardsByDeckId[deck.id] || [];
            deck.cardCount = deckCards.length;
            deck.dueCount = deckCards.filter(c => c.dueDate <= now).length;
            const masteredCount = deckCards.filter(c => c.repetitions >= 5).length;
            deck.progress = deck.cardCount > 0 ? (masteredCount / deck.cardCount) * 100 : 0;
        } else {
            deck.cardCount = 0;
            deck.dueCount = 0;
            deck.progress = 0;
        }
    }

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
        let totalMasteredCount = 0;

        for (const child of children) {
            const childWithStats = calculateStatsForNode(child.id);
            totalCardCount += childWithStats.cardCount;
            totalDueCount += childWithStats.dueCount;
            totalMasteredCount += (childWithStats.progress / 100) * childWithStats.cardCount;
        }
        
        deck.cardCount = totalCardCount;
        deck.dueCount = totalDueCount;
        deck.progress = totalCardCount > 0 ? (totalMasteredCount / totalCardCount) * 100 : 0;
        
        calculatedFolderIds.add(deckId);
        return deck;
    };
    
    // Iterasi dari root (null) atau folder tingkat atas untuk memastikan semua dihitung
    const rootItems = childrenMap.get(null) || [];
    for (const item of rootItems) {
        if (item.type === 'folder') {
            calculateStatsForNode(item.id);
        }
    }
     // Pastikan semua folder dihitung, bahkan yang kosong atau yatim piatu
    for (const deck of decks) {
        if (deck.type === 'folder' && !calculatedFolderIds.has(deck.id)) {
            calculateStatsForNode(deck.id);
        }
    }

    return Array.from(deckMap.values());
};


interface CardStoreState {
  cards: Card[];
  decks: Deck[];
  quizDeck: Deck | null;
  quizCards: Card[];
  quizMode: 'sr' | 'simple' | 'blitz' | null;
  gameType: GameType | null;
  loadAllCards: () => Promise<void>;
  loadAllDecks: () => Promise<void>;
  startQuiz: (deckId: number, cardSet?: 'due' | 'new' | 'review_all', quizMode?: 'sr' | 'simple' | 'blitz') => Promise<void>;
  startGame: (deckId: number, gameType: GameType, quizMode: 'sr' | 'simple' | 'blitz') => Promise<void>;
  endQuiz: () => void;
  updateCardProgress: (card: Card, feedback: 'lupa' | 'ingat') => Promise<void>;
  addDeck: (title: string, type: 'deck' | 'folder', parentId: number | null) => Promise<AddDeckResult>;
  addDeckWithCards: (title: string, cardsData: Array<Partial<Omit<Card, 'id' | 'deckId'>>>, parentId: number | null) => Promise<AddDeckResult>;
  deleteDeck: (deckId: number) => Promise<void>;
  updateDeckTitle: (deckId: number, newTitle: string) => Promise<UpdateDeckResult>;
  duplicateDeck: (deckId: number) => Promise<void>;
  updateDeckParent: (deckId: number, newParentId: number | null) => Promise<void>;
  addCardToDeck: (deckId: number, front: string, back: string, transcription?: string, example?: string, imageUrl?: string) => Promise<void>;
  bulkAddCardsToDeck: (deckId: number, cardsData: Array<{front: string; back: string; transcription?: string; example?: string}>) => Promise<void>;
  updateCard: (cardId: number, data: Partial<Omit<Card, 'id'>>) => Promise<void>;
  deleteCard: (cardId: number) => Promise<void>;
  deleteCards: (cardIds: number[]) => Promise<void>;
  moveCards: (cardIds: number[], targetDeckId: number) => Promise<void>;
  getDecksByParentId: (parentId: number | null) => Promise<Deck[]>;
  getDeckById: (deckId: number) => Promise<Deck | undefined>;
  getCardsByDeckId: (deckId: number) => Promise<Card[]>;
  getDeckPath: (deckId: number | null) => Promise<Deck[]>;
  getPossibleParentDecks: (deckId: number) => Promise<Deck[]>;
  getDeckStats: (deckId: number) => Promise<{ newCount: number; repeatCount: number; learnedCount: number; totalCount: number; }>;
  recalculateAllDeckStats: () => Promise<void>;
  getCardCountInHierarchy: (folderId: number) => Promise<number>;
  importDeckFromFile: (deckTitle: string, parentId: number | null, parsedData: ParsedImportData, mapping: Record<string, string>) => Promise<ImportResult>;
  notification: NotificationState | null;
  showNotification: (payload: Omit<NotificationState, 'isVisible'>) => void;
  hideNotification: () => void;
}

export const useCardStore = create<CardStoreState>((set, get) => ({
  cards: [],
  decks: [],
  quizDeck: null,
  quizCards: [],
  quizMode: null,
  gameType: null,
  notification: null,

  loadAllCards: async () => {
    try {
      const allCards = await db.cards.toArray();
      set({ cards: allCards });
    } catch (error) {
      console.error("Gagal memuat semua kartu:", error);
    }
  },

  loadAllDecks: async () => {
    try {
        const allDecks = await db.decks.toArray();
        set({ decks: allDecks });
    } catch (error) {
        console.error("Gagal memuat semua dek:", error);
    }
  },

  showNotification: (payload) => set({ notification: { ...payload, isVisible: true } }),
  hideNotification: () => set(state => ({ notification: state.notification ? { ...state.notification, isVisible: false } : null })),

  recalculateAllDeckStats: async () => {
    try {
        const allDecksFromDB = await db.decks.toArray();
        const allCardsFromDB = await db.cards.toArray();
        const updatedDecks = recalculateStatsOnState(allCardsFromDB, allDecksFromDB);

        await db.decks.bulkPut(updatedDecks);
        set({ decks: updatedDecks, cards: allCardsFromDB });
        console.log(`Statistik diperbarui untuk ${updatedDecks.length} item.`);
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
    const trimmedTitle = title.trim();
    const safeParentId = parentId ?? null;
    let newDeckId: number | undefined;

    try {
      await db.transaction('rw', db.decks, async () => {
        // PERBAIKAN: Menggunakan sintaks Dexie yang benar untuk kueri indeks tunggal
        // untuk menghindari error "Invalid key provided".
        const existing = await db.decks
          .where('parentId').equals(safeParentId)
          .filter(deck => deck.title.toLowerCase() === trimmedTitle.toLowerCase())
          .first();

        if (existing) {
          // Melempar error akan secara otomatis membatalkan transaksi
          throw new Error(`Item dengan nama "${trimmedTitle}" sudah ada di folder ini.`);
        }

        const newDeckData: Omit<Deck, 'id'> = {
          title: trimmedTitle,
          parentId: safeParentId,
          type,
          cardCount: 0,
          progress: 0,
          dueCount: 0,
        };
        
        newDeckId = await db.decks.add(newDeckData as Deck);
      });

      // Jika transaksi berhasil, perbarui state
      if (newDeckId !== undefined) {
        await get().recalculateAllDeckStats();
        return { success: true, deckId: newDeckId };
      }
      
      // Fallback jika newDeckId tidak terdefinisi (seharusnya tidak terjadi)
      return { success: false, message: "Gagal membuat dek karena alasan yang tidak diketahui." };

    } catch (error) {
      console.error("Gagal menambahkan dek:", error);
      const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan yang tidak diketahui.";
      return { success: false, message: errorMessage };
    }
  },

  addDeckWithCards: async (title, cardsData, parentId) => {
    const trimmedTitle = title.trim();
    const safeParentId = parentId ?? null;
    let newDeckId: number | undefined;

    try {
        await db.transaction('rw', db.decks, db.cards, async () => {
            // PERBAIKAN: Pindahkan validasi duplikat ke dalam transaksi database
            // untuk konsistensi dan gunakan sintaks kueri yang benar.
            const existing = await db.decks
                .where('parentId').equals(safeParentId)
                .filter(deck => deck.title.toLowerCase() === trimmedTitle.toLowerCase())
                .first();

            if (existing) {
                throw new Error(`Item dengan nama "${trimmedTitle}" sudah ada di folder ini.`);
            }

            const newDeckData: Omit<Deck, 'id'> = {
                title: trimmedTitle, parentId: safeParentId, type: 'deck',
                cardCount: 0, progress: 0, dueCount: 0,
            };
            newDeckId = await db.decks.add(newDeckData as Deck);
            
            if (newDeckId === undefined) {
                throw new Error("Gagal membuat dek di database.");
            }

            const newCardsForDB = cardsData.map(data => ({
                ...data,
                deckId: newDeckId!,
                dueDate: new Date(),
                interval: 0,
                easeFactor: 2.5,
                repetitions: 0,
                isMastered: false,
            }));

            if (newCardsForDB.length > 0) {
                await db.cards.bulkAdd(newCardsForDB as Card[], { allKeys: true });
            }
        });
        
        if (newDeckId !== undefined) {
            await get().recalculateAllDeckStats();
            return { success: true, deckId: newDeckId };
        } else {
            // Kasus ini tidak akan tercapai jika transaksi gagal karena akan melempar error
            return { success: false, message: "Gagal membuat dek karena alasan yang tidak diketahui." };
        }
    } catch (error) {
        console.error("Gagal menambahkan dek dengan kartu:", error);
        const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan yang tidak diketahui.";
        return { success: false, message: errorMessage };
    }
  },

  deleteDeck: async (deckId: number) => {
    try {
        const { decks } = get();
        const deckIdsToDelete = new Set<number>();
        const queue: number[] = [deckId];
        deckIdsToDelete.add(deckId);

        while(queue.length > 0) {
            const currentId = queue.shift()!;
            const children = decks.filter(d => d.parentId === currentId);
            for (const child of children) {
                deckIdsToDelete.add(child.id);
                queue.push(child.id);
            }
        }
        
        const deckIdsToDeleteArray = Array.from(deckIdsToDelete);

        await db.transaction('rw', db.decks, db.cards, async () => {
            await db.cards.where('deckId').anyOf(deckIdsToDeleteArray).delete();
            await db.decks.bulkDelete(deckIdsToDeleteArray);
        });
      
        set(state => {
            const remainingCards = state.cards.filter(card => !deckIdsToDelete.has(card.deckId));
            const remainingDecks = state.decks.filter(deck => !deckIdsToDelete.has(deck.id));
            const updatedDecks = recalculateStatsOnState(remainingCards, remainingDecks);
            db.decks.bulkPut(updatedDecks).catch(err => console.error("Gagal menyimpan dek yang diperbarui setelah penghapusan:", err));
            return { cards: remainingCards, decks: updatedDecks };
        });
    } catch (error) {
      console.error(`Gagal menghapus dek ${deckId} dan turunannya:`, error);
    }
  },
  
  updateDeckTitle: async (deckId: number, newTitle: string): Promise<UpdateDeckResult> => {
    try {
        const trimmedTitle = newTitle.trim();
        const deckToUpdate = get().decks.find(d => d.id === deckId);
        if (!deckToUpdate) {
            return { success: false, message: "Item tidak ditemukan." };
        }

        const parentId = deckToUpdate.parentId ?? null;
        const siblingExists = get().decks.find(d => 
            d.id !== deckId && 
            d.parentId === parentId && 
            d.title.toLowerCase() === trimmedTitle.toLowerCase()
        );

        if (siblingExists) {
            return { success: false, message: `Item dengan nama "${trimmedTitle}" sudah ada di folder ini.` };
        }

        await db.decks.update(deckId, { title: trimmedTitle });
        set(state => ({
            decks: state.decks.map(d => d.id === deckId ? { ...d, title: trimmedTitle } : d)
        }));
        return { success: true };
    } catch (error) {
        console.error(`Gagal memperbarui judul dek ${deckId}:`, error);
        const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan yang tidak diketahui.";
        return { success: false, message: errorMessage };
    }
  },

  duplicateDeck: async (deckId: number) => {
    try {
      const duplicatedItems: Deck[] = [];
      await db.transaction('rw', db.decks, db.cards, async () => {
        const originalDeck = await db.decks.get(deckId);
        if (!originalDeck) throw new Error(`Dek dengan ID ${deckId} tidak ditemukan.`);
  
        const duplicateRecursively = async (originalId: number, newParentId: number | null) => {
          const nodeToCopy = await db.decks.get(originalId);
          if (!nodeToCopy) return;
  
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { id, ...rest } = nodeToCopy;
          const newTitle = (originalId === deckId) ? `${nodeToCopy.title} - Salinan` : nodeToCopy.title;
  
          const newNodeData: Omit<Deck, 'id'> = { ...rest, title: newTitle, parentId: newParentId };
          const newId = await db.decks.add(newNodeData as Deck);
          const newFullDeck = await db.decks.get(newId);
          if(newFullDeck) duplicatedItems.push(newFullDeck);

          if (nodeToCopy.type === 'deck') {
            const originalCards = await db.cards.where('deckId').equals(originalId).toArray();
            if (originalCards.length > 0) {
              const newCards = originalCards.map(card => {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { id: cardId, ...cardRest } = card;
                return { ...cardRest, deckId: newId } as Card;
              });
              await db.cards.bulkAdd(newCards);
            }
          } else if (nodeToCopy.type === 'folder') {
            // PERBAIKAN: Menggunakan sintaks Dexie yang benar untuk kueri indeks tunggal
            // untuk menghindari error "Invalid key provided" saat menduplikasi folder secara rekursif.
            const children = await db.decks.where('parentId').equals(originalId).toArray();
            for (const child of children) {
              await duplicateRecursively(child.id, newId);
            }
          }
        };
        await duplicateRecursively(deckId, originalDeck.parentId);
      });
  
      await get().loadAllCards(); // Muat ulang semua kartu untuk menyertakan yang baru
      set(state => {
        const newDecksList = [...state.decks, ...duplicatedItems];
        const updatedDecks = recalculateStatsOnState(get().cards, newDecksList);
        db.decks.bulkPut(updatedDecks).catch(e => console.error(e));
        return { decks: updatedDecks };
      });

    } catch (error) {
      console.error(`Gagal menduplikasi dek ${deckId}:`, error);
      get().showNotification({
          message: `Gagal menduplikasi: ${error instanceof Error ? error.message : 'Kesalahan tidak diketahui.'}`,
          type: 'error'
      });
    }
  },

  updateDeckParent: async (deckId: number, newParentId: number | null) => {
    try {
      await db.decks.update(deckId, { parentId: newParentId });
      set(state => {
          const decksWithMovedParent = state.decks.map(d => d.id === deckId ? { ...d, parentId: newParentId } : d);
          const updatedDecks = recalculateStatsOnState(state.cards, decksWithMovedParent);
          db.decks.bulkPut(updatedDecks).catch(e => console.error(e));
          return { decks: updatedDecks };
      });
    } catch (error) {
      console.error(`Gagal memperbarui parent dek ${deckId}:`, error);
    }
  },

  addCardToDeck: async (deckId: number, front: string, back: string, transcription?: string, example?: string, imageUrl?: string) => {
    try {
      const newCardData: Omit<Card, 'id'> = {
          deckId, front, back, transcription, example, imageUrl,
          dueDate: new Date(), interval: 0, easeFactor: 2.5, repetitions: 0, isMastered: false,
      };
      const newCardId = await db.cards.add(newCardData as Card);
      const newCard = await db.cards.get(newCardId);

      if (newCard) {
          set(state => {
              const updatedCards = [...state.cards, newCard];
              const updatedDecks = recalculateStatsOnState(updatedCards, state.decks);
              db.decks.bulkPut(updatedDecks).catch(e => console.error(e));
              return { cards: updatedCards, decks: updatedDecks };
          });
      }
    } catch (error) {
        console.error("Gagal menambahkan kartu:", error);
    }
  },

  bulkAddCardsToDeck: async (deckId, cardsData) => {
    try {
        if (cardsData.length === 0) return;
        
        const newCardsForDB = cardsData.map(data => ({
            deckId,
            front: data.front,
            back: data.back,
            transcription: data.transcription,
            example: data.example,
            dueDate: new Date(),
            interval: 0,
            easeFactor: 2.5,
            repetitions: 0,
            isMastered: false,
        }));
        
        const newCardIds = await db.cards.bulkAdd(newCardsForDB as Card[], { allKeys: true });
        const newCards = await db.cards.bulkGet(newCardIds as number[]);

        set(state => {
            const updatedCards = [...state.cards, ...newCards];
            const updatedDecks = recalculateStatsOnState(updatedCards, state.decks);
            db.decks.bulkPut(updatedDecks).catch(e => console.error("Gagal menyimpan dek yang diperbarui setelah penambahan massal:", e));
            return { cards: updatedCards, decks: updatedDecks };
        });

    } catch (error) {
        console.error("Gagal menambahkan kartu secara massal di store:", error);
        get().showNotification({ message: 'Terjadi kesalahan saat menyimpan kartu.', type: 'error' });
    }
  },

  updateCard: async (cardId: number, data: Partial<Omit<Card, 'id'>>) => {
    try {
        const updatedCount = await db.cards.update(cardId, data);
        if (updatedCount > 0) {
            set(state => ({
                cards: state.cards.map(card => 
                    card.id === cardId ? { ...card, ...data, id: cardId } as Card : card
                )
            }));
            // Rekalkulasi tidak diperlukan untuk perubahan konten kartu, hanya untuk struktur
        }
    } catch (error) {
        console.error(`Gagal memperbarui kartu ${cardId}:`, error);
    }
  },

  deleteCard: async (cardId: number) => {
    try {
      await db.cards.delete(cardId);
      set(state => {
        const updatedCards = state.cards.filter(card => card.id !== cardId);
        const updatedDecks = recalculateStatsOnState(updatedCards, state.decks);
        db.decks.bulkPut(updatedDecks).catch(e => console.error(e));
        return { cards: updatedCards, decks: updatedDecks };
      });
    } catch (error) {
        console.error(`Gagal menghapus kartu ${cardId}:`, error);
    }
  },
  
  deleteCards: async (cardIds: number[]) => {
    try {
      if (cardIds.length === 0) return;
      await db.cards.bulkDelete(cardIds);
      
      set(state => {
        const cardIdsSet = new Set(cardIds);
        const updatedCards = state.cards.filter(card => card.id !== undefined && !cardIdsSet.has(card.id));
        const updatedDecks = recalculateStatsOnState(updatedCards, state.decks);
        db.decks.bulkPut(updatedDecks).catch(e => console.error(e));
        return { cards: updatedCards, decks: updatedDecks };
      });
      get().showNotification({ message: `${cardIds.length} kartu berhasil dihapus.`, type: 'success' });
    } catch (error) {
      console.error(`Gagal menghapus kartu secara massal:`, error);
      get().showNotification({ message: 'Gagal menghapus kartu.', type: 'error' });
    }
  },

  moveCards: async (cardIds: number[], targetDeckId: number) => {
    try {
      if (cardIds.length === 0) return;
      await db.cards.where('id').anyOf(cardIds).modify({ deckId: targetDeckId });
      
      set(state => {
        const cardIdsSet = new Set(cardIds);
        const updatedCards = state.cards.map(card => 
            (card.id !== undefined && cardIdsSet.has(card.id)) ? { ...card, deckId: targetDeckId } : card
        );
        const updatedDecks = recalculateStatsOnState(updatedCards, state.decks);
        db.decks.bulkPut(updatedDecks).catch(e => console.error(e));
        return { cards: updatedCards, decks: updatedDecks };
      });
      get().showNotification({ message: `${cardIds.length} kartu berhasil dipindahkan.`, type: 'success' });
    } catch (error) {
      console.error(`Gagal memindahkan kartu secara massal:`, error);
      get().showNotification({ message: 'Gagal memindahkan kartu.', type: 'error' });
    }
  },

  startQuiz: async (deckId: number, cardSet: 'due' | 'new' | 'review_all' = 'due', quizMode: 'sr' | 'simple' | 'blitz' = 'sr') => {
    try {
      const item = get().decks.find(d => d.id === deckId);
      if (!item) throw new Error("Item tidak ditemukan");

      const cardsToReview = await setupGameData(deckId, quizMode, 'front', cardSet);
      
      if (cardsToReview.length > 0) {
        set({ quizDeck: item, quizCards: cardsToReview, quizMode, gameType: null });
      } else {
        if (cardSet === 'due') {
          get().showNotification({ message: "Kerja bagus! Tidak ada kartu yang perlu diulang.", type: 'success' });
        }
      }
    } catch (error) {
      console.error("Gagal memulai kuis:", error);
    }
  },
  
  startGame: async (deckId: number, gameType: GameType, quizMode: 'sr' | 'simple' | 'blitz') => {
    try {
      const item = get().decks.find(d => d.id === deckId);
      if (!item) throw new Error("Item tidak ditemukan");

      const cardsForGame = await setupGameData(deckId, quizMode, 'front');
      
      if (cardsForGame.length > 0) {
        set({ quizDeck: item, quizCards: cardsForGame, gameType, quizMode });
      }
    } catch (error) {
        console.error("Gagal memulai permainan:", error);
    }
  },

  endQuiz: () => {
    set({ quizDeck: null, quizCards: [], quizMode: null, gameType: null });
    get().recalculateAllDeckStats();
  },

  updateCardProgress: async (card: Card, feedback: 'lupa' | 'ingat') => {
    const quality = feedback === 'ingat' ? 4 : 2;
    const { interval, easeFactor, repetitions } = calculateSrsData(quality, {
      interval: card.interval, easeFactor: card.easeFactor, repetitions: card.repetitions,
    });
    const dueDate = getNextDueDate(interval);
    const isMastered = repetitions >= 5;
    
    const updatedData = { interval, easeFactor, dueDate, repetitions, isMastered };

    await db.cards.update(card.id!, updatedData);
    set(state => ({
      cards: state.cards.map(c => c.id === card.id ? { ...c, ...updatedData } : c)
    }));

    if (feedback === 'lupa') {
      set(state => {
        const cardIndex = state.quizCards.findIndex(c => c.id === card.id);
        if (cardIndex > -1 && state.quizCards.length > 1) {
          const newQuizCards = [...state.quizCards];
          const [failedCard] = newQuizCards.splice(cardIndex, 1);
          newQuizCards.push(failedCard);
          return { quizCards: newQuizCards };
        }
        return {};
      });
    }
  },

  getDecksByParentId: async (parentId: number | null): Promise<Deck[]> => {
    return get().decks.filter(deck => deck.parentId === parentId);
  },
  
  getDeckById: async (deckId: number): Promise<Deck | undefined> => {
    return get().decks.find(d => d.id === deckId);
  },

  getCardsByDeckId: async (deckId: number): Promise<Card[]> => {
    return get().cards.filter(c => c.deckId === deckId);
  },

  getDeckPath: async (deckId: number | null): Promise<Deck[]> => {
    if (deckId === null) return [];
    
    const { decks } = get();
    const path: Deck[] = [];
    let currentId: number | null = deckId;

    while (currentId !== null) {
      const currentDeck = decks.find(d => d.id === currentId);
      if (!currentDeck) break;
      path.push(currentDeck);
      currentId = currentDeck.parentId;
    }
    return path.reverse();
  },

  getPossibleParentDecks: async (deckId: number): Promise<Deck[]> => {
      const { decks } = get();
      const descendantIds = new Set<number>();
      const queue: number[] = [deckId];
      
      while (queue.length > 0) {
        const currentId = queue.shift()!;
        descendantIds.add(currentId);
        const children = decks.filter(d => d.parentId === currentId);
        for (const child of children) {
          queue.push(child.id);
        }
      }

      return decks.filter(deck => !descendantIds.has(deck.id) && deck.type === 'folder');
  },
  
  getDeckStats: async (deckId: number) => {
        const item = get().decks.find(d => d.id === deckId);
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

        const cards = get().cards.filter(c => targetDeckIds.includes(c.deckId));
        const now = new Date();

        const newCount = cards.filter(c => c.interval === 0).length;
        const repeatCount = cards.filter(c => c.dueDate <= now && c.interval > 0).length;
        const learnedCount = cards.filter(c => c.interval > 0).length;
        const totalCount = cards.length;

        return { newCount, repeatCount, learnedCount, totalCount };
  },
  
  importDeckFromFile: async (deckTitle, parentId, parsedData, mapping) => {
    try {
      const { headers, allData } = parsedData;
      const trimmedDeckTitle = deckTitle.trim();

      if (get().decks.some(d => d.parentId === parentId && d.title.toLowerCase() === trimmedDeckTitle.toLowerCase())) {
        throw new Error(`Dek dengan nama "${trimmedDeckTitle}" sudah ada di folder ini.`);
      }

      const getIndex = (fieldKey: string) => mapping[fieldKey] ? headers.indexOf(mapping[fieldKey]) : -1;
      const frontIndex = getIndex('kanji');
      const backIndex = getIndex('katakana');
      if (frontIndex === -1 || backIndex === -1) {
        return { success: false, count: 0, message: "Pemetaan kolom tidak valid. Sisi Depan dan Sisi Belakang wajib diisi." };
      }

      let newDeckId: number | undefined;
      let addedCards: Card[] = [];

      await db.transaction('rw', db.decks, db.cards, async () => {
          newDeckId = await db.decks.add({
            title: trimmedDeckTitle, parentId, type: 'deck', cardCount: 0, progress: 0, dueCount: 0,
          } as Deck);

          const newCardsData = allData.map(row => {
            const front = String(row[frontIndex] || '').trim();
            const back = String(row[backIndex] || '').trim();
            if (!front || !back) return null;
            return {
              deckId: newDeckId!, front, back,
              transcription: getIndex('transcription') > -1 ? String(row[getIndex('transcription')] || '').trim() : undefined,
              example: getIndex('exampleSentence') > -1 ? String(row[getIndex('exampleSentence')] || '').trim() : undefined,
              dueDate: new Date(), interval: 0, easeFactor: 2.5, repetitions: 0,
            } as Card;
          }).filter((card): card is Card => card !== null);
          
          if (newCardsData.length > 0) {
            const ids = await db.cards.bulkAdd(newCardsData, { allKeys: true });
            addedCards = await db.cards.bulkGet(ids);
          }
      });

      if (newDeckId !== undefined) {
         const newDeck = await db.decks.get(newDeckId);
         set(state => {
            const updatedCards = [...state.cards, ...addedCards];
            const updatedDecks = recalculateStatsOnState(updatedCards, [...state.decks, newDeck!]);
            db.decks.bulkPut(updatedDecks).catch(e => console.error(e));
            return { cards: updatedCards, decks: updatedDecks };
         });
      }

      return { success: true, count: addedCards.length };

    } catch (error) {
      console.error("Gagal mengimpor dek dari file di store:", error);
      const errorMessage = error instanceof Error ? error.message : "Terjadi kesalahan yang tidak diketahui saat mengimpor.";
      return { success: false, count: 0, message: errorMessage };
    }
  },

}));
