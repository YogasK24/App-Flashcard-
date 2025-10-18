import React, { useState, useEffect } from 'react';
import CardInputField from './CardInputField';
import Icon from './Icon';
import AIGenerateButton from './AIGenerateButton';
import { generateCardFromText } from '../services/aiService';

// Tentukan struktur data untuk setiap kartu dalam state form
export interface FormCardData {
  key: number; // Kunci unik untuk fungsi map React
  front: string; // Akan dipetakan ke 'kanji'
  back: string;  // Akan dipetakan ke 'katakana'
  transcription: string;
  example: string;
  image: File | null;
  // Flag untuk mengontrol visibilitas field opsional
  showTranscription: boolean;
  showExample: boolean;
  showImage: boolean;
}

// Fungsi bantuan untuk membuat objek kartu baru yang kosong
const createNewCard = (): FormCardData => ({
  key: Date.now() + Math.random(), // Kunci yang lebih unik untuk menghindari tabrakan
  front: '',
  back: '',
  transcription: '',
  example: '',
  image: null,
  showTranscription: false,
  showExample: false,
  showImage: false,
});


interface AddEditCardFormProps {
  onSave: (cards: Omit<FormCardData, 'key' | 'showTranscription' | 'showExample' | 'showImage'>[]) => void;
  onValidationChange: (isValid: boolean) => void;
}

const AddEditCardForm: React.FC<AddEditCardFormProps> = ({ onSave, onValidationChange }) => {
  const [cards, setCards] = useState<FormCardData[]>([createNewCard()]);
  const [aiGeneratedIndex, setAiGeneratedIndex] = useState<number | null>(null);

  const isFormValid = !cards.some(card => !card.front.trim() || !card.back.trim());

  useEffect(() => {
    onValidationChange(isFormValid);
  }, [isFormValid, onValidationChange]);

  const handleCardChange = (index: number, field: keyof Omit<FormCardData, 'key' | 'showTranscription' | 'showExample' | 'showImage'>, value: string | File | null) => {
    const newCards = [...cards];
    (newCards[index] as any)[field] = value;
    setCards(newCards);
  };

  const toggleAttribute = (index: number, attribute: 'showTranscription' | 'showExample' | 'showImage') => {
    const newCards = [...cards];
    newCards[index][attribute] = !newCards[index][attribute];
    setCards(newCards);
  };

  const addCard = () => {
    setCards([...cards, createNewCard()]);
  };
  
  const removeCard = (index: number) => {
    if (cards.length > 1) {
        const newCards = cards.filter((_, i) => i !== index);
        setCards(newCards);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;
    const cardsToSave = cards.map(({ key, showTranscription, showExample, showImage, ...rest }) => rest);
    onSave(cardsToSave);
  };

  const handleAIGenerate = async (index: number) => {
    const card = cards[index];
    if (!card.front.trim()) return;

    setAiGeneratedIndex(index);
    const result = await generateCardFromText(card.front);
    if (result) {
        // Gunakan pembaruan fungsional untuk memastikan kita memiliki state terbaru
        setCards(currentCards => {
            const newCards = [...currentCards];
            newCards[index] = {
                ...newCards[index],
                front: result.front,
                back: result.back,
            };
            return newCards;
        });
    }
    setTimeout(() => {
        setAiGeneratedIndex(null);
    }, 2000); // Sorot selama 2 detik
  };

  return (
    <form onSubmit={handleSubmit} id="add-edit-card-form" className="flex-grow flex flex-col min-h-0">
        <div className="space-y-4 max-h-[60vh] overflow-y-auto p-1 -mr-3 pr-3 flex-grow">
            {cards.map((card, index) => (
                <div key={card.key} className="bg-gray-100 dark:bg-[#4A4458]/40 p-4 rounded-lg relative border border-transparent dark:border-gray-700/50">
                    {cards.length > 1 && (
                        <button type="button" onClick={() => removeCard(index)} className="absolute top-2 right-2 p-1 rounded-full text-gray-500 dark:text-gray-400 hover:bg-black/10 dark:hover:bg-white/10" aria-label="Hapus kartu ini">
                            <Icon name="trash" className="w-4 h-4 text-red-500/80"/>
                        </button>
                    )}
                    
                    <CardInputField
                        label="日本語(漢字)"
                        value={card.front}
                        onChange={(e) => handleCardChange(index, 'front', e.target.value)}
                        placeholder="e.g., 日本"
                        iconName="sparkle"
                        isHighlighted={aiGeneratedIndex === index}
                    />

                    <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                            <label htmlFor={`card-back-${card.key}`} className="block text-sm font-medium text-gray-600 dark:text-[#C8C5CA]">
                                日本語(片仮名)
                            </label>
                            <AIGenerateButton 
                                onClick={() => handleAIGenerate(index)}
                                disabled={!card.front.trim()}
                             />
                        </div>
                        <div className="relative flex items-center">
                            <input
                                id={`card-back-${card.key}`}
                                type="text"
                                value={card.back}
                                onChange={(e) => handleCardChange(index, 'back', e.target.value)}
                                placeholder="e.g., にほん"
                                className="w-full bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#C8B4F3]"
                            />
                        </div>
                    </div>
                    
                    {card.showTranscription && (
                        <CardInputField
                            label="Transcription"
                            value={card.transcription}
                            onChange={(e) => handleCardChange(index, 'transcription', e.target.value)}
                            placeholder="e.g., Nihon"
                        />
                    )}
                    
                    {card.showExample && (
                        <div className="relative flex flex-col mb-4">
                            <label htmlFor={`card-example-${card.key}`} className="block text-sm font-medium text-gray-600 dark:text-[#C8C5CA] mb-2">Contoh</label>
                            <textarea
                                id={`card-example-${card.key}`}
                                value={card.example}
                                onChange={(e) => handleCardChange(index, 'example', e.target.value)}
                                placeholder="e.g., 日本は美しい国です。"
                                className="w-full bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#C8B4F3] h-20 resize-none"
                            />
                        </div>
                    )}
                    
                    {card.showImage && (
                        <div className="relative flex flex-col mb-4">
                            <label htmlFor={`card-image-${card.key}`} className="block text-sm font-medium text-gray-600 dark:text-[#C8C5CA] mb-2">Gambar</label>
                            <input id={`card-image-${card.key}`} type="file" accept="image/*" onChange={(e) => handleCardChange(index, 'image', e.target.files ? e.target.files[0] : null)} className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"/>
                        </div>
                    )}

                    <div className="flex items-center space-x-2 mt-2">
                        {!card.showTranscription && <button type="button" onClick={() => toggleAttribute(index, 'showTranscription')} className="text-xs bg-gray-200 dark:bg-gray-600/80 text-gray-700 dark:text-gray-200 px-2 py-1 rounded-full hover:opacity-80 transition-opacity">+ Transcription</button>}
                        {!card.showExample && <button type="button" onClick={() => toggleAttribute(index, 'showExample')} className="text-xs bg-gray-200 dark:bg-gray-600/80 text-gray-700 dark:text-gray-200 px-2 py-1 rounded-full hover:opacity-80 transition-opacity">+ Contoh</button>}
                        {!card.showImage && <button type="button" onClick={() => toggleAttribute(index, 'showImage')} className="text-xs bg-gray-200 dark:bg-gray-600/80 text-gray-700 dark:text-gray-200 px-2 py-1 rounded-full hover:opacity-80 transition-opacity">+ Gambar</button>}
                    </div>
                </div>
            ))}
        </div>
        
        <div className="mt-4 flex-shrink-0">
            <button type="button" onClick={addCard} className="w-full flex items-center justify-center p-3 rounded-lg border-2 border-dashed border-gray-400 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#4A4458]/40 transition-colors">
                <Icon name="plus" className="w-5 h-5 mr-2" />
                Tambah Kartu Lain
            </button>
        </div>
    </form>
  )
}

export default AddEditCardForm;