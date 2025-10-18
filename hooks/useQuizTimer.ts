import { useState, useEffect, useRef, useCallback } from 'react';

interface UseQuizTimerProps {
  key: any;
  initialTime: number;
  onTimeUp: () => void;
}

/**
 * Hook kustom untuk mengelola timer hitung mundur untuk kuis.
 * @param key - Kunci unik (misalnya, ID kartu) untuk me-reset timer saat berubah.
 * @param initialTime - Waktu awal hitung mundur dalam detik.
 * @param onTimeUp - Callback yang akan dipanggil saat waktu habis.
 * @returns {timeLeft, duration, stopTimer} - Waktu yang tersisa, durasi awal, dan fungsi untuk menghentikan timer.
 */
export const useQuizTimer = ({ key, initialTime, onTimeUp }: UseQuizTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const onTimeUpRef = useRef(onTimeUp);
  const intervalIdRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
  }, [onTimeUp]);

  const stopTimer = useCallback(() => {
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }
  }, []);

  useEffect(() => {
    stopTimer(); // Hentikan timer sebelumnya jika ada
    setTimeLeft(initialTime);

    if (initialTime <= 0) return;

    intervalIdRef.current = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          if (intervalIdRef.current) clearInterval(intervalIdRef.current);
          onTimeUpRef.current();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return stopTimer;
  }, [key, initialTime, stopTimer]);

  return { timeLeft, duration: initialTime, stopTimer };
};
