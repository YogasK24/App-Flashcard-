import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';

interface ImportMappingModalProps {
  isOpen: boolean;
  onClose: () => void;
  headers: string[];
  previewData: any[][];
  fileName: string;
  onSave: (deckTitle: string, mapping: Record<string, string>) => void;
}

const backdropVariants: Variants = {
  visible: { opacity: 1 },
  hidden: { opacity: 0 },
  exit: { opacity: 0 },
};

const modalVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0,
    opacity: 1,
    transition: { duration: 0.2, ease: 'easeOut' }
  },
  exit: {
    y: 20,
    opacity: 0,
    transition: { duration: 0.2, ease: 'easeIn' }
  }
};

const appFields = [
    { key: 'kanji', label: 'Sisi Depan (Kanji)', required: true },
    { key: 'katakana', label: 'Sisi Belakang (Katakana)', required: true },
    { key: 'transcription', label: 'Transkripsi/Terjemahan', required: false },
    { key: 'exampleSentence', label: 'Contoh Kalimat', required: false },
];

const ImportMappingModal: React.FC<ImportMappingModalProps> = ({ isOpen, onClose, headers, previewData, fileName, onSave }) => {
  const [deckTitle, setDeckTitle] = useState(fileName);
  const [mapping, setMapping] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
            onClose();
        }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => {
        document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    setDeckTitle(fileName);
    
    // Coba petakan kolom secara otomatis berdasarkan nama header umum
    const initialMapping: Record<string, string> = {};
    const lowerHeaders = headers.map(h => String(h || '').toLowerCase());

    const findHeader = (keywords: string[]) => {
      for (const keyword of keywords) {
        const index = lowerHeaders.findIndex(h => h.includes(keyword));
        if (index !== -1) return headers[index];
      }
      return '';
    };

    initialMapping.kanji = findHeader(['front', 'term', 'word', 'kanji', 'pertanyaan']);
    initialMapping.katakana = findHeader(['back', 'definition', 'meaning', 'katakana', 'jawaban']);
    initialMapping.transcription = findHeader(['transcription', 'translation', 'terjemahan']);
    initialMapping.exampleSentence = findHeader(['example', 'sentence', 'contoh']);
    
    const usedHeaders = new Set<string>();
    const finalMapping: Record<string, string> = {};
    appFields.forEach(({ key }) => {
        const header = initialMapping[key];
        if (header && !usedHeaders.has(header)) {
            finalMapping[key] = header;
            usedHeaders.add(header);
        }
    });

    setMapping(finalMapping);
  }, [headers, fileName]);

  const handleMappingChange = (appFieldKey: string, fileHeader: string) => {
    setMapping(prev => {
        const newMapping = { ...prev };
        
        // Hapus pemetaan yang ada untuk header ini untuk mencegah duplikat
        for (const key in newMapping) {
            if (newMapping[key] === fileHeader) {
                delete newMapping[key];
            }
        }
        
        // Tetapkan pemetaan baru
        if (fileHeader) {
            newMapping[appFieldKey] = fileHeader;
        } else {
            delete newMapping[appFieldKey];
        }
        
        return newMapping;
    });
  };

  const isSaveDisabled = !deckTitle.trim() || !mapping.kanji || !mapping.katakana;

  const handleSave = () => {
    if (!isSaveDisabled) {
      onSave(deckTitle, mapping);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="import-mapping-backdrop"
          onClick={handleBackdropClick}
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <motion.div
            onClick={e => e.stopPropagation()}
            className="bg-white dark:bg-[#2B2930] rounded-2xl w-full max-w-2xl shadow-xl flex flex-col h-full max-h-[90vh]"
            variants={modalVariants}
            role="dialog"
            aria-modal="true"
            aria-labelledby="import-modal-title"
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 id="import-modal-title" className="text-xl font-bold text-gray-900 dark:text-white">Impor Dek dari File</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Petakan kolom dari file Anda ke bidang-bidang kartu.</p>
            </div>
            
            <div className="p-6 space-y-6 flex-grow overflow-y-auto">
                <div>
                    <label htmlFor="deck-title-import" className="block text-sm font-medium text-gray-600 dark:text-[#C8C5CA] mb-2">Nama Dek</label>
                    <input
                        type="text"
                        id="deck-title-import"
                        value={deckTitle}
                        onChange={(e) => setDeckTitle(e.target.value)}
                        className="w-full bg-gray-100 dark:bg-[#4A4458] border border-gray-300 dark:border-[#645F73] text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#C8B4F3]"
                        required
                    />
                </div>
                
                <div className="space-y-4">
                    {appFields.map(({ key, label, required }) => (
                         <div key={key} className="grid grid-cols-2 gap-4 items-center">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {label} {required && <span className="text-red-500">*</span>}
                            </label>
                            <select 
                                value={mapping[key] || ''} 
                                onChange={(e) => handleMappingChange(key, e.target.value)}
                                className="w-full bg-gray-100 dark:bg-[#4A4458] border border-gray-300 dark:border-[#645F73] text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#C8B4F3]"
                            >
                                <option value="">-- Abaikan Kolom Ini --</option>
                                {headers.map(header => (
                                    <option key={header} value={header}>{header}</option>
                                ))}
                            </select>
                         </div>
                    ))}
                </div>

                <div>
                    <h3 className="text-sm font-semibold text-gray-500 dark:text-[#C8C5CA] pt-2">Pratinjau Data (Hingga 10 baris pertama)</h3>
                    <div className="w-full overflow-x-auto border border-gray-600 dark:border-gray-300 rounded-lg max-h-48 mt-2">
                        <table className="min-w-full divide-y divide-gray-700 dark:divide-gray-300">
                            <thead className="bg-gray-700 dark:bg-gray-100 sticky top-0">
                                <tr>
                                    {headers.map((header) => (
                                        <th key={header} className="px-4 py-2 text-left text-xs font-medium text-gray-300 dark:text-gray-700 uppercase tracking-wider">
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-gray-800 dark:bg-white divide-y divide-gray-700 dark:divide-gray-300">
                                {previewData.map((row, index) => (
                                    <tr key={index}>
                                        {headers.map((_h, cellIndex) => (
                                            <td key={cellIndex} className="px-4 py-2 text-sm text-gray-300 dark:text-gray-800 whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">
                                                {row[cellIndex]}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button type="button" onClick={onClose} className="px-4 py-2 rounded-full text-[#C8B4F3] font-semibold hover:bg-gray-500/10 dark:hover:bg-white/10">Batal</button>
              <button type="button" onClick={handleSave} disabled={isSaveDisabled} className="px-6 py-2 bg-[#C8B4F3] text-black font-semibold rounded-full disabled:opacity-50 disabled:cursor-not-allowed">Impor</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ImportMappingModal;