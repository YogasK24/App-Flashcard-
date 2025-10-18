import { useState, useEffect, useRef } from 'react';

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
 * @returns {timeLeft, duration} - Waktu yang tersisa dan durasi awal.
 */
export const useQuizTimer = ({ key, initialTime, onTimeUp }: UseQuizTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const onTimeUpRef = useRef(onTimeUp);

  // Memperbarui referensi callback tanpa me-reset efek utama.
  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
  }, [onTimeUp]);

  useEffect(() => {
    // Reset timer setiap kali kunci (misalnya, ID kartu) berubah.
    setTimeLeft(initialTime);

    if (initialTime <= 0) return;

    const intervalId = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(intervalId);
          onTimeUpRef.current(); // Panggil callback saat waktu habis.
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    // Bersihkan interval saat komponen di-unmount atau dependensi berubah.
    return () => clearInterval(intervalId);
  }, [key, initialTime]);

  return { timeLeft, duration: initialTime };
};
