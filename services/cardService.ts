
// Implementasi sederhana dari algoritma SM-2 untuk Spaced Repetition
// Konstanta bisa disesuaikan

const MIN_EASE_FACTOR = 1.3;

export interface SrsData {
  interval: number;
  easeFactor: number;
  repetitions: number;
}

/**
 * Menghitung interval, ease factor, dan repetisi berikutnya berdasarkan kualitas jawaban.
 * @param quality Kualitas jawaban (0-5), di mana 5 adalah jawaban terbaik.
 * @param srsData Data SRS kartu saat ini.
 * @returns Data SRS yang telah diperbarui.
 */
export const calculateSrsData = (quality: number, srsData: SrsData): SrsData => {
  if (quality < 3) {
    // Jika jawaban salah, reset repetisi dan atur ulang interval.
    return { ...srsData, repetitions: 0, interval: 1 };
  }

  const newRepetitions = srsData.repetitions + 1;
  let newInterval;

  if (newRepetitions === 1) {
    newInterval = 1;
  } else if (newRepetitions === 2) {
    newInterval = 6;
  } else {
    // Untuk repetisi berikutnya, kalikan interval sebelumnya dengan ease factor.
    newInterval = Math.round(srsData.interval * srsData.easeFactor);
  }

  const newEaseFactor = Math.max(
    MIN_EASE_FACTOR,
    srsData.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  );

  return { interval: newInterval, easeFactor: newEaseFactor, repetitions: newRepetitions };
};

/**
 * Menghitung tanggal jatuh tempo berikutnya.
 * @param interval Interval dalam hari.
 * @returns Objek Date untuk tanggal jatuh tempo berikutnya.
 */
export const getNextDueDate = (interval: number): Date => {
  const now = new Date();
  now.setDate(now.getDate() + interval);
  return now;
};