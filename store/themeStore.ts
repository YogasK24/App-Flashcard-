import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type StudyMode = 'sr' | 'simple' | 'blitz';
export type SortOption = 'date-desc' | 'date-asc' | 'title-asc' | 'title-desc';
export type FilterOption = 'all' | 'folders' | 'decks';
export type QuizFontSize = 'small' | 'medium' | 'large';
export type CardSortOption = 
  | 'date-desc' 
  | 'date-asc' 
  | 'due-date-asc' 
  | 'front-asc' 
  | 'front-desc'
  | 'back-asc'
  | 'back-desc';

interface SettingsState {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  studyDirection: 'kanji' | 'katakana';
  setStudyDirection: (direction: 'kanji' | 'katakana') => void;
  timerDuration: number;
  setTimerDuration: (duration: number) => void;
  currentStudyMode: StudyMode;
  setCurrentStudyMode: (mode: StudyMode) => void;
  sortOption: SortOption;
  setSortOption: (option: SortOption) => void;
  filterOption: FilterOption;
  setFilterOption: (option: FilterOption) => void;
  isTTSMuted: boolean;
  toggleTTSMute: () => void;
  quizFontSize: QuizFontSize;
  setQuizFontSize: (size: QuizFontSize) => void;
  cardSortOption: CardSortOption;
  setCardSortOption: (option: CardSortOption) => void;
}

// Deteksi preferensi tema sistem sebagai default awal
// Ditambahkan pengecekan `typeof window` untuk keamanan di lingkungan non-browser
const prefersDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
const defaultTheme = prefersDark ? 'dark' : 'light';

export const useThemeStore = create(
  persist<SettingsState>(
    (set) => ({
      theme: defaultTheme, // Gunakan default yang terdeteksi jika tidak ada di storage
      studyDirection: 'kanji', // Preferensi belajar default
      timerDuration: 10, // Durasi default untuk Blitz Mode dalam detik
      currentStudyMode: 'sr', // Mode belajar default
      sortOption: 'date-desc', // Default: Terbaru dulu
      filterOption: 'all',     // Default: Tampilkan semua
      isTTSMuted: false, // Default: suara aktif
      quizFontSize: 'medium', // Default font size
      cardSortOption: 'date-desc', // Default sort option for cards
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === 'dark' ? 'light' : 'dark',
        })),
      setStudyDirection: (direction) => set({ studyDirection: direction }),
      setTimerDuration: (duration) => set({ timerDuration: duration }),
      setCurrentStudyMode: (mode) => set({ currentStudyMode: mode }),
      setSortOption: (option) => set({ sortOption: option }),
      setFilterOption: (option) => set({ filterOption: option }),
      toggleTTSMute: () => set((state) => ({ isTTSMuted: !state.isTTSMuted })),
      setQuizFontSize: (size) => set({ quizFontSize: size }),
      setCardSortOption: (option) => set({ cardSortOption: option }),
    }),
    {
      name: 'flashcard-settings-storage', // nama unik untuk localStorage
    }
  )
);