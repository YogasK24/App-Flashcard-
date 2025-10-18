
import { GoogleGenAI, Type } from "@google/genai";

// Peringatan: Jangan pernah mengekspos API key di sisi klien dalam aplikasi produksi.
// Ini diasumsikan akan diatur dalam lingkungan yang aman.
const apiKey = process.env.API_KEY;

if (!apiKey) {
    console.error("API Key for Gemini is not set. AI features will be disabled.");
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
// Fungsi AI lainnya seperti generateFurigana, generateExampleSentences, dll. akan ditambahkan di sini.
