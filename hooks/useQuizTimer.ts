import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hook kustom untuk mengelola timer hitung mundur untuk kuis dengan kontrol imperatif.
 * @param duration Durasi awal hitung mundur dalam detik.
 * @param onTimeUp Callback yang akan dipanggil saat waktu habis.
 * @returns { timeLeft, timerProgress, start, stop, reset, isRunning } - State dan kontrol untuk timer.
 */
export const useQuizTimer = (duration: number, onTimeUp: () => void) => {
  const durationMs = duration * 1000;
  const [timeLeftMs, setTimeLeftMs] = useState(durationMs);
  const [isRunning, setIsRunning] = useState(false);

  // Gunakan refs untuk nilai yang berubah tetapi tidak boleh memicu render ulang di dalam loop
  const timerRef = useRef<number | null>(null);
  const onTimeUpRef = useRef(onTimeUp);
  onTimeUpRef.current = onTimeUp;
  
  const endTimeRef = useRef<number>(0);
  const isRunningRef = useRef(false); // Ref untuk melacak status berjalan tanpa menyebabkan pembuatan ulang callback

  const stop = useCallback(() => {
    if (timerRef.current) {
      cancelAnimationFrame(timerRef.current);
      timerRef.current = null;
    }
    // Hanya perbarui state jika benar-benar berubah untuk menghindari render yang tidak perlu
    if (isRunningRef.current) {
      isRunningRef.current = false;
      setIsRunning(false);
    }
  }, []);

  // Loop animasi
  const animate = useCallback(() => {
    const newTimeLeft = Math.max(0, endTimeRef.current - Date.now());
    setTimeLeftMs(newTimeLeft);

    if (newTimeLeft > 0) {
      timerRef.current = requestAnimationFrame(animate);
    } else {
      stop(); // Gunakan fungsi stop terpusat
      onTimeUpRef.current();
    }
  }, [stop]);

  const start = useCallback(() => {
    // Mencegah beberapa loop berjalan menggunakan ref
    if (isRunningRef.current) return;
    
    isRunningRef.current = true;
    setTimeLeftMs(durationMs); // Atur ulang status visual segera
    endTimeRef.current = Date.now() + durationMs;
    setIsRunning(true);
    // Jalankan loop animasi
    timerRef.current = requestAnimationFrame(animate);
  }, [durationMs, animate]);

  const reset = useCallback(() => {
    stop();
    setTimeLeftMs(durationMs);
  }, [durationMs, stop]);
  
  // Efek pembersihan
  useEffect(() => {
    return () => stop();
  }, [stop]);

  const timerProgress = durationMs > 0 ? Math.max(0, timeLeftMs / durationMs) : 0;

  return { 
    timeLeft: Math.ceil(timeLeftMs / 1000),
    timerProgress,
    start, 
    stop, 
    reset, 
    isRunning 
  };
};
