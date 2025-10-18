
export interface Deck {
  id: number;
  title: string;
  cardCount: number;
  progress: number;
  dueCount: number;
  type: 'deck' | 'folder';
  parentId: number | null;
}

export interface Card {
  id?: number;
  deckId: number;
  front: string;
  back: string;
  transcription?: string;
  example?: string;
  imageUrl?: string;
  dueDate: Date;
  interval: number;
  easeFactor: number;
  repetitions: number;
  isMastered?: boolean;
}

export interface AppSettings {
  id?: 1;
  theme: 'light' | 'dark';
  language: 'en' | 'id';
  // ... more settings
}