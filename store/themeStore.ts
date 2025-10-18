import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type StudyMode = 'sr' | 'simple' | 'blitz';

interface SettingsState {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  studyDirection: 'kanji' | 'katakana';
  setStudyDirection: (direction: 'kanji' | 'katakana') => void;
  timerDuration: number;
  setTimerDuration: (duration: number) => void;
  currentStudyMode: StudyMode;
  setCurrentStudyMode: (mode: StudyMode) => void;
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
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === 'dark' ? 'light' : 'dark',
        })),
      setStudyDirection: (direction) => set({ studyDirection: direction }),
      setTimerDuration: (duration) => set({ timerDuration: duration }),
      setCurrentStudyMode: (mode) => set({ currentStudyMode: mode }),
    }),
    {
      name: 'flashcard-settings-storage', // nama unik untuk localStorage
    }
  )
);