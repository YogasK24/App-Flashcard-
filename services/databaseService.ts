import Dexie, { type Table } from 'dexie';
import type { Deck, Card, AppSettings } from '../types';

// Perbaikan: Pola subclassing sebelumnya menyebabkan error tipe.
// Pola alternatif ini mendefinisikan tabel langsung pada instance Dexie
// dan menggunakan type assertion untuk memastikan keamanan tipe, yang menyelesaikan
// error "property does not exist".
export const db = new Dexie('FlashcardDatabase') as Dexie & {
  decks: Table<Deck, number>;
  cards: Table<Card, number>;
  settings: Table<AppSettings, number>;
  studyHistory: Table<{ id?: number; timestamp: number }, number>;
  achievements: Table<{ id: string; unlockedAt: number }, string>;
  initialDecks: Table<{ id?: number; deckId: number; creationMethod: 'manual' | 'ai' }, number>;
};

db.version(6).stores({
  decks: '++id, parentId, title, type',
  cards: '++id, deckId, dueDate, isMastered',
  settings: 'id',
  studyHistory: '++id, timestamp',
  achievements: 'id',
  initialDecks: '++id, deckId',
});
