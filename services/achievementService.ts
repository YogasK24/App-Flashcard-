
import { db } from './databaseService';

interface Achievement {
  id: string;
  name: string;
  description: string;
  condition: () => Promise<boolean>;
}

const ALL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'FIRST_DECK',
    name: 'Pemula',
    description: 'Buat dek pertamamu.',
    condition: async () => (await db.decks.count()) > 0,
  },
  {
    id: 'FIRST_STUDY',
    name: 'Langkah Pertama',
    description: 'Selesaikan sesi belajar pertamamu.',
    condition: async () => (await db.studyHistory.count()) > 0,
  },
  // ... lebih banyak pencapaian
];

export const checkAndUnlockAchievements = async (): Promise<string[]> => {
  const unlockedAchievements = await db.achievements.toArray();
  const unlockedIds = new Set(unlockedAchievements.map(a => a.id));
  const newlyUnlocked: string[] = [];

  for (const achievement of ALL_ACHIEVEMENTS) {
    if (!unlockedIds.has(achievement.id)) {
      if (await achievement.condition()) {
        await db.achievements.add({ id: achievement.id, unlockedAt: Date.now() });
        newlyUnlocked.push(achievement.name);
      }
    }
  }
  
  return newlyUnlocked; // Mengembalikan nama pencapaian yang baru dibuka
};
