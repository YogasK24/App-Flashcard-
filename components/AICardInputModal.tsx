import React, { useState, FormEvent, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import Icon from './Icon';
import { generateVocabFromSource } from '../services/aiService';
import { useCardStore } from '../store/cardStore';
import { db } from '../services/databaseService';
import { Deck } from '../types';
import VocabPreviewModal from './VocabPreviewModal';

export interface GeneratedCard {
  kanji: string;
  katakana: string;
  transcription: string;
}

// Menambahkan isDuplicate sebagai properti opsional untuk pemrosesan internal
export interface ProcessedGeneratedCard extends GeneratedCard {
  isDuplicate?: boolean;
}

interface AICardInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  deckId: number; // Prop sekarang wajib
  onCardsAdded?: () => void;
}

const backdropVariants: Variants = {
  visible: { opacity: 1 },
  hidden: { opacity: 0 },
  exit: { opacity: 0 }
};

const modalVariants: Variants = {
  hidden: { y: '100vh', opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 30 } },
  exit: { y: '100vh', opacity: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } }
};

const AICardInputModal: React.FC<AICardInputModalProps> = ({ 
    isOpen, 
    onClose, 
    deckId, 
    onCardsAdded, 
}) => {
  const [sourceText, setSourceText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [cardsForPreview, setCardsForPreview] = useState<GeneratedCard[]>([]);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  const [targetDeck, setTargetDeck] = useState<Deck | null>(null);
  const mountedRef = useRef(false);

  const { bulkAddCardsToDeck, showNotification } = useCardStore(state => ({
    bulkAddCardsToDeck: state.bulkAddCardsToDeck,
    showNotification: state.showNotification,
  }));

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const handleClose = useCallback(() => {
    setSourceText('');
    setError(null);
    setIsLoading(false);
    setCardsForPreview([]);
    setIsPreviewOpen(false);
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
        if (!isPreviewOpen && event.key === 'Escape') {
            handleClose();
        }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
        document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isPreviewOpen, handleClose]);


  useEffect(() => {
    const fetchDeckInfo = async () => {
      if (isOpen && deckId) {
        const currentDeck = await db.decks.get(deckId);
        setTargetDeck(currentDeck || null);
      }
    };
    fetchDeckInfo();
  }, [isOpen, deckId]);

  const handleGenerate = async (e: FormEvent) => {
    e.preventDefault();
    if (!sourceText.trim() || isLoading || !deckId) return;

    setIsLoading(true);
    setError(null);

    try {
      const vocabList = await generateVocabFromSource(sourceText);
      if (!mountedRef.current) return;

      if (vocabList && vocabList.length > 0) {
        
        const uniqueKanji = new Set<string>();
        const uniqueVocabFromAI = vocabList.filter(card => {
          const trimmedKanji = card.kanji.trim().toLowerCase();
          if (uniqueKanji.has(trimmedKanji)) {
            return false;
          }
          uniqueKanji.add(trimmedKanji);
          return true;
        });

        const existingCardsInDeck = await db.cards.where('deckId').equals(deckId).toArray();
        if (!mountedRef.current) return;

        const existingFronts = new Set(existingCardsInDeck.map(card => card.front.trim().toLowerCase()));

        const newCards = uniqueVocabFromAI.filter(card => !existingFronts.has(card.kanji.trim().toLowerCase()));

        if (newCards.length > 0) {
          setCardsForPreview(newCards);
          setIsPreviewOpen(true);
        } else {
          setError("Semua kosakata yang dihasilkan sudah ada di dek yang dipilih atau merupakan duplikat.");
        }

      } else {
        setError("AI tidak dapat menemukan kosakata yang dapat diekstrak. Coba teks yang lebih panjang atau berbeda.");
      }
    } catch (err) {
      if (!mountedRef.current) return;
      console.error("Error generating vocab from source:", err);
      const errorMessage = err instanceof Error ? err.message : "Terjadi kesalahan.";
      setError(`Gagal menghasilkan kartu: ${errorMessage}`);
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  };
  
  const handleSaveFromPreview = async (cardsToSave: GeneratedCard[]) => {
    if (!deckId || cardsToSave.length === 0) return;
    setIsLoading(true);
    try {
        const cardsData = cardsToSave.map(card => ({
            front: card.kanji,
            back: card.katakana,
            transcription: card.transcription,
        }));
        await bulkAddCardsToDeck(deckId, cardsData);

        showNotification({ message: `${cardsToSave.length} kartu baru berhasil ditambahkan!`, type: 'success' });
        if (onCardsAdded) {
            onCardsAdded();
        }
    } catch (error) {
        showNotification({ message: 'Gagal menambahkan kartu.', type: 'error' });
    } finally {
        if (mountedRef.current) {
            setIsLoading(false);
        }
        setIsPreviewOpen(false);
        handleClose();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && !isPreviewOpen && (
          <motion.div
            key="ai-card-input-modal"
            onClick={handleBackdropClick}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.div
              onClick={e => e.stopPropagation()}
              className="bg-white dark:bg-[#2B2930] rounded-2xl p-6 w-full max-w-2xl shadow-xl"
              variants={modalVariants}
              role="dialog"
              aria-modal="true"
              aria-labelledby="ai-card-modal-title"
            >
              <div className="flex justify-between items-center mb-4">
                  <h2 id="ai-card-modal-title" className="text-xl font-bold text-gray-900 dark:text-white">Buat Kartu dengan AI</h2>
                  <button onClick={handleClose} className="p-2 rounded-full hover:bg-gray-500/10 dark:hover:bg-white/10" aria-label="Tutup">
                      <Icon name="plus" className="w-6 h-6 rotate-45" />
                  </button>
              </div>
              
              {error && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-sm mb-4 text-center">
                    {error}
                  </motion.p>
              )}
              
              <form onSubmit={handleGenerate}>
                  <p className="text-gray-600 dark:text-[#C8C5CA] mb-6">
                    Masukkan kata, kalimat, atau bahkan seluruh artikel ke dalam dek <span className="font-bold text-gray-800 dark:text-white">{targetDeck?.title || '...'}</span>. AI akan secara otomatis mengekstrak kosakata yang relevan untuk Anda.
                  </p>
                  <div className="mb-4">
                  <label htmlFor="source-text-ai" className="block text-sm font-medium text-gray-600 dark:text-[#C8C5CA] mb-2">
                      Teks Sumber
                  </label>
                  <textarea
                      id="source-text-ai"
                      value={sourceText}
                      onChange={(e) => setSourceText(e.target.value)}
                      className="w-full h-40 bg-gray-100 dark:bg-[#4A4458] border border-gray-300 dark:border-[#645F73] text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#C8B4F3] resize-y"
                      placeholder="Tempel teks Bahasa Jepang di sini..."
                      required
                      autoFocus
                  />
                  </div>
                   
                  <div className="flex justify-end space-x-3 mt-4">
                      <button type="button" onClick={handleClose} className="px-4 py-2 rounded-full text-[#C8B4F3] font-semibold hover:bg-gray-500/10 dark:hover:bg-white/10">
                        Batal
                      </button>
                      <button
                        type="submit"
                        className={`px-6 py-2 font-semibold rounded-full flex items-center justify-center min-w-[150px] transition-colors duration-200 disabled:opacity-50 ${
                            isLoading 
                            ? 'bg-gray-500 text-white dark:bg-gray-700 dark:text-gray-300' 
                            : 'bg-[#C8B4F3] text-black'
                        }`}
                        disabled={!sourceText.trim() || isLoading || !deckId}
                      >
                          {isLoading ? (
                          <Icon name="refresh" className="w-5 h-5 animate-spin" />
                          ) : (
                          <span className="flex items-center">
                              <Icon name="sparkle" className="w-5 h-5 mr-2" />
                              Hasilkan Kartu
                          </span>
                          )}
                      </button>
                  </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <VocabPreviewModal 
        isOpen={isPreviewOpen}
        onClose={handleClose}
        cardsToPreview={cardsForPreview}
        onSave={handleSaveFromPreview}
        targetDeckTitle={targetDeck?.title || ''}
      />
    </>
  );
};

export default AICardInputModal;