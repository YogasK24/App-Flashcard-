
import { db } from './databaseService';

/**
 * Mengekspor semua data dari database ke format JSON.
 */
export const exportDataAsJson = async (): Promise<string> => {
  const dataToExport = {
    decks: await db.decks.toArray(),
    cards: await db.cards.toArray(),
    settings: await db.settings.get(1),
    studyHistory: await db.studyHistory.toArray(),
    achievements: await db.achievements.toArray(),
  };

  return JSON.stringify(dataToExport, null, 2);
};

/**
 * Mengimpor data dari string JSON dan menimpanya di database.
 * Hati-hati: Ini akan menghapus data yang ada.
 */
export const importDataFromJson = async (jsonString: string): Promise<void> => {
  const data = JSON.parse(jsonString);
  
  await db.transaction('rw', db.tables, async () => {
    // Hapus data lama
    await Promise.all(db.tables.map(table => table.clear()));

    // Tambahkan data baru
    if (data.decks) await db.decks.bulkAdd(data.decks);
    if (data.cards) await db.cards.bulkAdd(data.cards);
    if (data.settings) await db.settings.put(data.settings);
    if (data.studyHistory) await db.studyHistory.bulkAdd(data.studyHistory);
    if (data.achievements) await db.achievements.bulkAdd(data.achievements);
  });
};
