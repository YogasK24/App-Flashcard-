import React, { useState } from 'react';
import { Card } from '../types';
import Icon from '../components/Icon';
import AddEditCardForm, { FormCardData } from '../components/AddEditCardForm';

interface EditCardPageProps {
  card: Card;
  onBack: () => void;
  onSave: (cardId: number, data: Partial<Omit<Card, 'id'>>) => void;
}

const EditCardPage: React.FC<EditCardPageProps> = ({ card, onBack, onSave }) => {
  const [isFormValid, setIsFormValid] = useState(true); // Mulai sebagai valid karena sudah terisi

  // Konversi objek Card ke format yang diharapkan oleh AddEditCardForm
  const initialFormData: FormCardData[] = [{
    key: card.id || 0,
    front: card.front,
    back: card.back,
    transcription: card.transcription || '',
    example: card.example || '',
    image: null, // Edit gambar belum didukung
    showTranscription: !!card.transcription,
    showExample: !!card.example,
    showImage: !!card.imageUrl,
  }];

  const handleSave = (cards: Omit<FormCardData, 'key' | 'showTranscription' | 'showExample' | 'showImage'>[]) => {
    if (cards.length > 0 && card.id) {
      const updatedData = cards[0];
      onSave(card.id, {
        front: updatedData.front,
        back: updatedData.back,
        transcription: updatedData.transcription,
        example: updatedData.example,
        // imageUrl belum ditangani
      });
    }
  };

  return (
    <div className="flex flex-col h-full animate-fade-in-slow">
        <header className="p-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
                <button onClick={onBack} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10" aria-label="Kembali">
                    <Icon name="chevronLeft" className="w-6 h-6" />
                </button>
                <h2 className="text-xl font-semibold">Ubah Kartu</h2>
            </div>
            <button
                type="submit"
                form="add-edit-card-form"
                disabled={!isFormValid}
                className="bg-[#C8B4F3] text-black font-semibold px-5 py-2 rounded-full transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Simpan
            </button>
        </header>
        <main className="flex-grow px-4 overflow-y-auto pb-4">
            <AddEditCardForm
                isEditMode
                initialData={initialFormData}
                onSave={handleSave}
                onValidationChange={setIsFormValid}
            />
        </main>
    </div>
  );
};

export default EditCardPage;