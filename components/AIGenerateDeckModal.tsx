import React, { useState, FormEvent, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import Icon from './Icon';
import { generateDeckFromTopic } from '../services/aiService';
import { useCardStore } from '../store/cardStore';

interface AIGenerateDeckModalProps {
  isOpen: boolean;
  onClose: (newDeckId?: number) => void;
  parentId: number | null;
}

const backdropVariants: Variants = {
  visible: { opacity: 1 },
  hidden: { opacity: 0 },
  exit: { opacity: 0 }
};

const modalVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.2, ease: 'easeOut' } },
  exit: { y: 20, opacity: 0, transition: { duration: 0.2, ease: 'easeIn' } }
};

const AIGenerateDeckModal: React.FC<AIGenerateDeckModalProps> = ({ isOpen, onClose, parentId }) => {
  const [topic, setTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(false);

  const { addDeckWithCards, showNotification } = useCardStore(state => ({
    addDeckWithCards: state.addDeckWithCards,
    showNotification: state.showNotification,
  }));
  
  useEffect(() => {
    // Ref ini melacak apakah komponen terpasang.
    // Ini membantu mencegah pembaruan state setelah komponen dilepas,
    // yang bisa terjadi jika pengguna menutup modal saat panggilan AI asinkron sedang berlangsung.
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);


  const handleClose = useCallback((newDeckId?: number) => {
    setTopic('');
    setError(null);
    setIsLoading(false);
    onClose(newDeckId);
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            handleClose();
        }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
        document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleClose]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmedTopic = topic.trim();
    if (!trimmedTopic || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const vocabList = await generateDeckFromTopic(trimmedTopic);
      if (!mountedRef.current) return; // Batalkan jika sudah dilepas

      if (vocabList && vocabList.length > 0) {
        
        const cardsData = vocabList.map(card => ({
          front: card.kanji,
          back: card.katakana,
          transcription: card.transcription,
          example: card.exampleSentence,
        }));
        
        const result = await addDeckWithCards(trimmedTopic, cardsData, parentId);
        if (!mountedRef.current) return; // Batalkan jika sudah dilepas
        
        if (result.success) {
          showNotification({ message: `Dek "${trimmedTopic}" dengan ${vocabList.length} kartu berhasil dibuat!`, type: 'success' });
          handleClose(result.deckId);
        } else {
          setError(result.message || "Gagal membuat dek baru.");
        }
      } else {
        setError("AI tidak dapat menghasilkan kosakata untuk topik ini. Coba topik yang lain.");
      }
    } catch (err) {
      if (!mountedRef.current) return; // Batalkan juga saat error
      console.error("Error in AI deck generation flow:", err);
      const errorMessage = err instanceof Error ? err.message : "Terjadi kesalahan yang tidak diketahui.";
      setError(`Gagal: ${errorMessage}`);
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="ai-generate-deck-modal"
          onClick={handleBackdropClick}
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <motion.div
            onClick={e => e.stopPropagation()}
            className="bg-white dark:bg-[#2B2930] rounded-2xl p-6 w-full max-w-lg shadow-xl"
            variants={modalVariants}
            role="dialog"
            aria-modal="true"
            aria-labelledby="ai-deck-modal-title"
          >
            <h2 id="ai-deck-modal-title" className="text-xl font-bold text-gray-900 dark:text-white mb-4">Buat Dek Baru dengan AI</h2>
            <p className="text-gray-600 dark:text-[#C8C5CA] mb-6">
              Masukkan sebuah topik, dan AI akan membuat dek yang berisi kosakata yang relevan untuk Anda.
            </p>
            
            {error && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-sm mb-4 text-center">
                  {error}
                </motion.p>
            )}
            
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label htmlFor="topic-input-ai" className="block text-sm font-medium text-gray-600 dark:text-[#C8C5CA] mb-2">
                        Topik
                    </label>
                    <input
                        id="topic-input-ai"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        className="w-full bg-gray-100 dark:bg-[#4A4458] border border-gray-300 dark:border-[#645F73] text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#C8B4F3]"
                        placeholder="Contoh: Kosakata JLPT N4 tentang perjalanan"
                        required
                        autoFocus
                    />
                </div>
                 
                <div className="flex justify-end space-x-3 mt-8">
                    <button type="button" onClick={() => handleClose()} className="px-4 py-2 rounded-full text-[#C8B4F3] font-semibold hover:bg-gray-500/10 dark:hover:bg-white/10">
                      Batal
                    </button>
                    <button
                      type="submit"
                      className={`px-6 py-2 font-semibold rounded-full flex items-center justify-center min-w-[150px] transition-colors duration-200 disabled:opacity-50 ${
                          isLoading 
                          ? 'bg-gray-500 text-white dark:bg-gray-700 dark:text-gray-300' 
                          : 'bg-[#C8B4F3] text-black'
                      }`}
                      disabled={!topic.trim() || isLoading}
                    >
                        {isLoading ? (
                        <Icon name="refresh" className="w-5 h-5 animate-spin" />
                        ) : (
                        <span className="flex items-center">
                            <Icon name="sparkle" className="w-5 h-5 mr-2" />
                            Buat Dek
                        </span>
                        )}
                    </button>
                </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AIGenerateDeckModal;