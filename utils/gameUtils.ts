import { db } from '../services/databaseService';
import { Card, Deck } from '../types';

/**
 * Mengacak array menggunakan algoritma Fisher-Yates.
 * @param array Array yang akan diacak.
 * @returns Array baru yang telah diacak.
 */
export const shuffleArray = <T>(array: T[]): T[] => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

/**
 * Mengambil semua ID dek turunan dari sebuah folder.
 * @param folderId ID dari folder.
 * @returns Promise yang resolve ke array ID dek.
 */
export const getDescendantDeckIds = async (folderId: number): Promise<number[]> => {
    const deckIds: number[] = [];
    const queue: number[] = [folderId];
    
    const allDecks = await db.decks.toArray();
    const childrenMap = allDecks.reduce((acc, deck) => {
        const parentId = deck.parentId;
        if (parentId === null) return acc;
        if (!acc[parentId]) acc[parentId] = [];
        acc[parentId].push(deck);
        return acc;
    }, {} as Record<number, Deck[]>);

    while (queue.length > 0) {
        const currentId = queue.shift()!;
        const children = childrenMap[currentId] || [];

        for (const child of children) {
            if (child.type === 'deck') {
                deckIds.push(child.id);
            } else { // ini adalah folder
                queue.push(child.id);
            }
        }
    }
    return deckIds;
};

/**
 * Mengambil semua kartu dalam hierarki dek atau folder tertentu.
 * @param itemId ID dari dek atau folder.
 * @returns Promise yang resolve ke array Card.
 */
export const getCardsInHierarchy = async (itemId: number): Promise<Card[]> => {
    const item = await db.decks.get(itemId);
    if (!item) {
        console.error(`Item dengan ID ${itemId} tidak ditemukan.`);
        return [];
    }

    let targetDeckIds: number[] = [];
    if (item.type === 'folder') {
        targetDeckIds = await getDescendantDeckIds(item.id);
    } else {
        targetDeckIds = [item.id];
    }

    if (targetDeckIds.length === 0) {
        return [];
    }
    
    return await db.cards.where('deckId').anyOf(targetDeckIds).toArray();
};


/**
 * Mengambil, memfilter, mengacak, dan memformat data kartu untuk digunakan dalam permainan atau kuis.
 * @param deckId ID dari dek atau folder untuk mendapatkan kartu.
 * @param modeType Mode belajar ('sr', 'simple', 'blitz') yang menentukan pemfilteran kartu.
 * @param cardField Parameter ini disertakan untuk penggunaan di masa mendatang.
 * @param cardSet Tipe set kartu yang akan diambil ('due', 'new', 'review_all').
 * @returns Promise yang resolve ke array objek Card yang diacak dan siap untuk permainan.
 */
export const setupGameData = async (
    deckId: number, 
    modeType: 'sr' | 'simple' | 'blitz',
    cardField: 'front' | 'back',
    cardSet: 'due' | 'new' | 'review_all' = 'due'
): Promise<Card[]> => {
    try {
        const allCardsInScope = await getCardsInHierarchy(deckId);

        if (allCardsInScope.length === 0) {
            console.log(`Tidak ada kartu yang ditemukan untuk item ID ${deckId}.`);
            return [];
        }
        
        let filteredCards: Card[] = [];
        const now = new Date();

        if (modeType === 'simple') {
            allCardsInScope.sort((a, b) => {
                if (a.interval === 0 && b.interval !== 0) return -1;
                if (a.interval !== 0 && b.interval === 0) return 1;
                return 0;
            });
            filteredCards = allCardsInScope;
        } else {
            switch (cardSet) {
                case 'new':
                    filteredCards = allCardsInScope.filter(c => c.interval === 0);
                    break;
                case 'review_all':
                    filteredCards = allCardsInScope.filter(c => c.interval > 0);
                    break;
                case 'due':
                default:
                    filteredCards = allCardsInScope.filter(c => c.dueDate <= now);
                    break;
            }
        }

        if (filteredCards.length === 0) {
            console.log(`Tidak ada kartu untuk diulang untuk mode: ${modeType} dan set: ${cardSet}`);
            return [];
        }

        return shuffleArray(filteredCards);

    } catch (error) {
        console.error(`Gagal menyiapkan data permainan untuk dek ${deckId}:`, error);
        return [];
    }
};

/**
 * Interface untuk objek opsi tebakan.
 */
export interface GuessOption {
  id: string; // ID unik, bisa dari kartu atau placeholder
  text: string;
  isCorrect: boolean;
}


/**
 * Menghasilkan satu set opsi pilihan ganda untuk kartu yang diberikan.
 * Memastikan semua opsi unik dan berbeda dari jawaban yang benar.
 * @param correctCard Kartu yang jawabannya benar.
 * @param allCards Daftar semua kartu yang mungkin untuk dipilih sebagai pengalih perhatian.
 * @param answerField Bidang kartu ('front' atau 'back') yang akan digunakan untuk jawaban.
 * @returns Array yang berisi 4 objek GuessOption, dengan jawaban yang benar disertakan dan diacak.
 */
export const generateGuessOptions = (correctCard: Card, allCards: Card[], answerField: 'front' | 'back'): GuessOption[] => {
  const correctAnswerText = correctCard[answerField];
  const correctOption: GuessOption = {
    id: `card-${correctCard.id}`,
    text: correctAnswerText,
    isCorrect: true,
  };

  // 1. Filter kandidat distraktor
  const distractorCandidates = allCards.filter(card => 
    card.id !== correctCard.id &&
    card[answerField].trim() !== '' &&
    card[answerField] !== correctAnswerText
  );

  // Gunakan Map untuk memastikan teks distraktor unik
  const uniqueDistractorsMap = new Map<string, Card>();
  distractorCandidates.forEach(card => {
    if (!uniqueDistractorsMap.has(card[answerField])) {
      uniqueDistractorsMap.set(card[answerField], card);
    }
  });
  const uniqueDistractors = Array.from(uniqueDistractorsMap.values());

  // 2. Pilih 3 distraktor secara acak
  const selectedDistractors = shuffleArray(uniqueDistractors).slice(0, 3);
  
  const distractorOptions: GuessOption[] = selectedDistractors.map(card => ({
    id: `card-${card.id}`,
    text: card[answerField],
    isCorrect: false,
  }));

  let finalOptions: GuessOption[] = [correctOption, ...distractorOptions];

  // 3. Finalisasi: Tambahkan placeholder jika kurang dari 4 opsi
  const placeholderOptions = ["Opsi A", "Opsi B", "Opsi C", "Pilihan Lain"];
  let placeholderIndex = 0;
  const existingTexts = new Set(finalOptions.map(opt => opt.text));

  while (finalOptions.length < 4) {
    const placeholder = placeholderOptions[placeholderIndex++];
    if (!existingTexts.has(placeholder)) {
      finalOptions.push({
        id: `placeholder-${placeholderIndex}`,
        text: placeholder,
        isCorrect: false,
      });
      existingTexts.add(placeholder);
    } else if (placeholderIndex >= placeholderOptions.length) {
      // Fallback jika semua placeholder default sudah ada
      const newPlaceholder = `Pilihan ${finalOptions.length + 1}`;
      finalOptions.push({
        id: `placeholder-${newPlaceholder}`,
        text: newPlaceholder,
        isCorrect: false,
      });
    }
  }

  // Acak urutan akhir
  return shuffleArray(finalOptions);
};