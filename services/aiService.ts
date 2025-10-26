import { GoogleGenAI, Type } from "@google/genai";

// =================================================================================
// CATATAN KEAMANAN & KONFIGURASI (SECURITY & CONFIGURATION NOTE)
// =================================================================================
// Kunci API yang diekspos di sisi klien hanya aman untuk tujuan prototipe.
// Untuk aplikasi produksi, sangat disarankan untuk:
// 1. Memindahkan logika panggilan API ke server backend yang aman.
// 2. Jika harus tetap di sisi klien, batasi (restrict) kunci API Anda hanya untuk
//    domain web aplikasi Anda di Google AI Studio untuk mencegah penyalahgunaan.
//
// Platform ini mengharapkan kunci API tersedia melalui `process.env.API_KEY`.
// Jika Anda menggunakan build tool seperti Create React App atau Vite, pastikan
// variabel lingkungan Anda (misalnya, `REACT_APP_GEMINI_API_KEY` atau
// `VITE_GEMINI_API_KEY`) diatur dengan benar dalam konfigurasi build Anda
// agar dapat diakses sebagai `process.env.API_KEY` di sini.
// =================================================================================

const apiKey = process.env.API_KEY;

if (!apiKey) {
    console.error("API Key for Gemini is not set. AI features will be disabled. Ensure process.env.API_KEY is available.");
}

const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const generateCardFromText = async (text: string): Promise<{ front: string; back: string } | null> => {
    if (!ai) return null;
    
    try {
        // Perbaikan: Menambahkan responseSchema untuk mendapatkan output JSON yang andal dari AI.
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Buat sebuah flashcard dari teks ini: "${text}". Sisi depan harus berupa kata atau frasa kunci, dan sisi belakang adalah definisi atau penjelasannya.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        front: {
                            type: Type.STRING,
                            description: "Sisi depan flashcard (kata atau frasa kunci).",
                        },
                        back: {
                            type: Type.STRING,
                            description: "Sisi belakang flashcard (definisi atau penjelasan).",
                        },
                    },
                    required: ["front", "back"],
                },
            },
        });
        const generatedText = response.text.trim();
        // Perbaikan: Mem-parsing output JSON dari AI dan mengembalikannya.
        const cardData = JSON.parse(generatedText);

        if (cardData && typeof cardData.front === 'string' && typeof cardData.back === 'string') {
            return { front: cardData.front, back: cardData.back };
        } else {
            console.error("AI response is not in the expected format:", cardData);
            return null;
        }
    } catch (error) {
        console.error("Error generating card with AI:", error);
        return null;
    }
};

export const generateFullCardFromText = async (
  sourceText: string
): Promise<{ kanji: string; katakana: string; transcription: string } | null> => {
  if (!ai) return null;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Dari teks berikut, ekstrak atau buat satu kata kunci dan definisinya, serta terjemahan dan pelafalan Katakana/Furigana. Teks: "${sourceText}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            kanji: {
              type: Type.STRING,
              description: "Sisi Depan Flashcard (Kata kunci atau Kanji).",
            },
            katakana: {
              type: Type.STRING,
              description: "Pengucapan dalam Furigana(Hiragana/Katakana).",
            },
            transcription: {
              type: Type.STRING,
              description: "Terjemahan atau definisi singkat dalam Bahasa Indonesia.",
            },
          },
          required: ["kanji", "katakana", "transcription"],
        },
      },
    });

    const generatedText = response.text.trim();
    const cardData = JSON.parse(generatedText);

    if (
      cardData &&
      typeof cardData.kanji === 'string' &&
      typeof cardData.katakana === 'string' &&
      typeof cardData.transcription === 'string'
    ) {
      return {
        kanji: cardData.kanji,
        katakana: cardData.katakana,
        transcription: cardData.transcription,
      };
    } else {
      console.error("AI response for full card is not in the expected format:", cardData);
      return null;
    }
  } catch (error) {
    console.error("Error generating full card with AI:", error);
    return null;
  }
};

export const generateVocabFromSource = async (
  sourceText: string
): Promise<Array<{ kanji: string; katakana: string; transcription: string }> | null> => {
  if (!ai) return null;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Analisis teks panjang berikut secara menyeluruh. Ekstrak semua kata benda, kata kerja, atau kata sifat yang penting atau tidak umum, yang cocok untuk dipelajari oleh pembelajar bahasa. Jumlahnya bisa bervariasi tergantung pada kepadatan teks. Pastikan setiap kata memiliki Terjemahan/Arti (Transkrip) dan Pelafalan (Katakana/Furigana). Abaikan partikel (は, が, を, で), grammar points dasar, dan verb conjugations yang sudah dikenal. Teks: "${sourceText}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              kanji: {
                type: Type.STRING,
                description: "Kata kunci (Kanji).",
              },
              katakana: {
                type: Type.STRING,
                description: "Pelafalan Hiragana/Katakana.",
              },
              transcription: {
                type: Type.STRING,
                description: "Terjemahan/Arti.",
              },
            },
            required: ["kanji", "katakana", "transcription"],
          },
        },
      },
    });

    const generatedText = response.text.trim();
    const vocabList = JSON.parse(generatedText);

    if (
      Array.isArray(vocabList) &&
      vocabList.every(
        (item) =>
          item &&
          typeof item.kanji === 'string' &&
          typeof item.katakana === 'string' &&
          typeof item.transcription === 'string'
      )
    ) {
      return vocabList;
    } else {
      console.error("AI response for vocab list is not in the expected format:", vocabList);
      return null;
    }
  } catch (error) {
    console.error("Error generating vocab list with AI:", error);
    return null;
  }
};


export const generateDeckFromTopic = async (
  topic: string
): Promise<Array<{ kanji: string; katakana: string; transcription: string; exampleSentence: string }> | null> => {
  if (!ai) return null;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Buat daftar minimal 20 kosakata Bahasa Jepang (Kanji), beserta Katakana/Hiragana, terjemahan Bahasa Indonesia, dan satu contoh kalimat untuk masing-masing, yang paling relevan dengan topik: "${topic}".`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              kanji: {
                type: Type.STRING,
                description: "Kata kunci (Kanji).",
              },
              katakana: {
                type: Type.STRING,
                description: "Pelafalan Hiragana/Katakana.",
              },
              transcription: {
                type: Type.STRING,
                description: "Terjemahan/Arti dalam Bahasa Indonesia.",
              },
              exampleSentence: {
                type: Type.STRING,
                description: "Contoh kalimat yang menggunakan kata tersebut.",
              },
            },
            required: ["kanji", "katakana", "transcription", "exampleSentence"],
          },
        },
      },
    });

    const generatedText = response.text.trim();
    const vocabList = JSON.parse(generatedText);

    if (
      Array.isArray(vocabList) &&
      vocabList.every(
        (item) =>
          item &&
          typeof item.kanji === 'string' &&
          typeof item.katakana === 'string' &&
          typeof item.transcription === 'string' &&
          typeof item.exampleSentence === 'string'
      )
    ) {
      return vocabList;
    } else {
      console.error("AI response for deck generation is not in the expected format:", vocabList);
      return null;
    }
  } catch (error) {
    console.error("Error generating deck from topic with AI:", error);
    return null;
  }
};


export const generateFurigana = async (kanjiText: string): Promise<string | null> => {
    if (!ai) return null;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Berikan Furigana (cara baca Hiragana/Katakana) untuk teks Kanji ini: "${kanjiText}"`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        katakana: {
                            type: Type.STRING,
                            description: "Teks furigana (hiragana/katakana) untuk kanji yang diberikan.",
                        },
                    },
                    required: ["katakana"],
                },
            },
        });
        const generatedText = response.text.trim();
        const result = JSON.parse(generatedText);

        if (result && typeof result.katakana === 'string') {
            return result.katakana;
        } else {
            console.error("AI response for furigana is not in the expected format:", result);
            return null;
        }
    } catch (error) {
        console.error("Error generating furigana with AI:", error);
        return null;
    }
};

export const generateTranslation = async (kanjiText: string, nativeLang: string): Promise<string | null> => {
    if (!ai) return null;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Terjemahkan kata Kanji ini "${kanjiText}" ke dalam Bahasa ${nativeLang}.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        translation: {
                            type: Type.STRING,
                            description: `Terjemahan dari kata ke dalam Bahasa ${nativeLang}.`,
                        },
                    },
                    required: ["translation"],
                },
            },
        });
        const generatedText = response.text.trim();
        const result = JSON.parse(generatedText);
        
        if (result && typeof result.translation === 'string') {
            return result.translation;
        } else {
            console.error("AI response for translation is not in the expected format:", result);
            return null;
        }
    } catch (error) {
        console.error("Error generating translation with AI:", error);
        return null;
    }
};

export const generateExample = async (kanjiText: string): Promise<string | null> => {
    if (!ai) return null;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Buat SATU contoh kalimat yang mudah bagi pemula dan beragam pola tata bahasa dalam Bahasa Jepang menggunakan kata Kanji: "${kanjiText}". Jangan sertakan terjemahan. Fokus pada keragaman struktur kalimat.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        japaneseExample: {
                            type: Type.STRING,
                            description: "Contoh kalimat dalam Bahasa Jepang dengan tata bahasa yang beragam.",
                        },
                    },
                    required: ["japaneseExample"],
                },
            },
        });
        const generatedText = response.text.trim();
        const result = JSON.parse(generatedText);

        if (result && typeof result.japaneseExample === 'string') {
            return result.japaneseExample;
        } else {
            console.error("AI response for example sentence is not in the expected format:", result);
            return null;
        }
    } catch (error) {
        console.error("Error generating example sentence with AI:", error);
        return null;
    }
};