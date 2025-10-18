/**
 * Mengucapkan teks yang diberikan menggunakan API Text-to-Speech (TTS) bawaan browser.
 * @param text Teks yang akan diucapkan.
 * @param lang Kode bahasa (BCP 47) untuk ucapan, default ke 'ja-JP' untuk Bahasa Jepang.
 */
export const speakText = (text: string, lang: string = 'ja-JP') => {
  // Periksa apakah API didukung oleh browser
  if ('speechSynthesis' in window) {
    // Batalkan ucapan yang sedang berlangsung untuk mencegah tumpang tindih
    window.speechSynthesis.cancel();

    // Buat instance utterance baru
    const utterance = new SpeechSynthesisUtterance(text);

    // Atur bahasa
    utterance.lang = lang;

    // Atur properti lain (opsional, bisa disesuaikan)
    utterance.rate = 0.9; // Sedikit lebih lambat untuk kejelasan
    utterance.pitch = 1;

    // Ucapkan teks
    window.speechSynthesis.speak(utterance);
  } else {
    // Beri tahu pengguna jika browser mereka tidak mendukung fitur ini
    console.warn("Text-to-Speech not supported by this browser.");
    alert("Maaf, browser Anda tidak mendukung fitur Text-to-Speech (TTS).");
  }
};
