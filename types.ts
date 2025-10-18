
export interface Deck {
  id: number;
  title: string;
  cardCount: number;
  progress: number;
  dueCount: number;
  iconType: 'document' | 'folder';
  parentId: number | null;
}

export interface Card {
  id?: number;
  deckId: number;
  front: string;
  back: string;
  dueDate: Date;
  interval: number;
  easeFactor: number;
}

export interface AppSettings {
  id?: 1;
  theme: 'light' | 'dark';
  language: 'en' | 'id';
  // ... more settings
}