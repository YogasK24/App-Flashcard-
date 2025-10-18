import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

// Deteksi preferensi tema sistem sebagai default awal
// Ditambahkan pengecekan `typeof window` untuk keamanan di lingkungan non-browser
const prefersDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
const defaultTheme = prefersDark ? 'dark' : 'light';

export const useThemeStore = create(
  persist<ThemeState>(
    (set) => ({
      theme: defaultTheme, // Gunakan default yang terdeteksi jika tidak ada di storage
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === 'dark' ? 'light' : 'dark',
        })),
    }),
    {
      name: 'flashcard-theme-storage', // nama unik untuk localStorage
    }
  )
);
