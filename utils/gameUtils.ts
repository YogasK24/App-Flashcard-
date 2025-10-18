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
 * Mengambil, memfilter, mengacak, dan memformat data kartu untuk digunakan dalam permainan.
 * @param deckId ID dari dek atau folder untuk mendapatkan kartu.
 * @param modeType Mode belajar ('sr', 'simple', 'blitz') yang menentukan pemfilteran kartu.
 * @param cardField Parameter ini disertakan для penggunaan di masa mendatang oleh komponen permainan untuk menentukan bidang kartu mana yang utama. Ini tidak mengubah struktur data yang dikembalikan dalam versi ini.
 * @returns Promise yang resolve ke array objek Card yang diacak dan siap untuk permainan.
 */
export const setupGameData = async (
    deckId: number, 
    modeType: 'sr' | 'simple' | 'blitz',
    cardField: 'front' | 'back' // disertakan untuk perluasan di masa mendatang
): Promise<Card[]> => {
    try {
        const allCardsInScope = await getCardsInHierarchy(deckId);

        if (allCardsInScope.length === 0) {
            console.log(`Tidak ada kartu yang ditemukan untuk item ID ${deckId}.`);
            return [];
        }
        
        let cardsForGame: Card[] = [];
        const now = new Date();

        switch(modeType) {
            case 'simple':
                cardsForGame = allCardsInScope;
                break;
            case 'sr':
            case 'blitz':
            default:
                cardsForGame = allCardsInScope.filter(card => card.dueDate <= now);
                break;
        }

        if (cardsForGame.length === 0) {
            console.log(`Tidak ada kartu untuk diulang untuk mode: ${modeType}`);
            return [];
        }

        return shuffleArray(cardsForGame);

    } catch (error) {
        console.error(`Gagal menyiapkan data permainan untuk dek ${deckId}:`, error);
        return [];
    }
};

/**
 * Menghasilkan satu set opsi pilihan ganda untuk kartu yang diberikan.
 * @param correctCard Kartu yang jawabannya benar.
 * @param allCards Daftar semua kartu yang mungkin untuk dipilih sebagai pengalih perhatian.
 * @param answerField Bidang kartu ('front' atau 'back') yang akan digunakan untuk jawaban.
 * @returns Array yang berisi 4 string opsi, dengan jawaban yang benar disertakan dan diacak.
 */
export const generateGuessOptions = (correctCard: Card, allCards: Card[], answerField: 'front' | 'back'): string[] => {
  const correctAnswer = correctCard[answerField];

  // Buat daftar pengalih perhatian dari kartu lain, pastikan ada isinya
  const distractors = allCards
    .filter(card => card.id !== correctCard.id && card[answerField].trim() !== '')
    .map(card => card[answerField]);
  
  const shuffledDistractors = shuffleArray(distractors).slice(0, 3);

  const options = shuffleArray([correctAnswer, ...shuffledDistractors]);
  
  // Pastikan kita selalu punya 4 opsi, bahkan jika tidak cukup pengalih perhatian
  // (duplikat jawaban yang benar jika perlu)
  while (options.length < 4 && options.length > 0) {
    options.push(correctAnswer);
  }
  
  // Jika hanya ada 1 kartu dalam kuis, ini akan menjadi satu-satunya opsi
  if (options.length === 1) {
      // Tambahkan beberapa placeholder untuk mengisi
      options.push("Opsi A", "Opsi B", "Opsi C");
      return shuffleArray(options.slice(0,4));
  }


  return options;
};
