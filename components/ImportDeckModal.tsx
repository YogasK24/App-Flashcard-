import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';

interface ImportDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: { headers: string[], rows: string[][], fileName: string };
  onConfirmImport: (deckTitle: string, frontHeader: string, backHeader: string) => void;
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

const ImportDeckModal: React.FC<ImportDeckModalProps> = ({ isOpen, onClose, data, onConfirmImport }) => {
  const [deckTitle, setDeckTitle] = useState('');
  const [frontHeader, setFrontHeader] = useState('');
  const [backHeader, setBackHeader] = useState('');

  useEffect(() => {
    if (data) {
      setDeckTitle(data.fileName);
      const lowerHeaders = data.headers.map(h => String(h).toLowerCase());
      const frontGuess = data.headers[lowerHeaders.findIndex(h => h.includes('front') || h.includes('term') || h.includes('word'))] || data.headers[0] || '';
      const backGuess = data.headers[lowerHeaders.findIndex(h => h.includes('back') || h.includes('definition') || h.includes('meaning'))] || data.headers[1] || '';
      
      setFrontHeader(frontGuess);
      setBackHeader(backGuess);
    }
  }, [data]);

  const handleConfirm = () => {
    if (deckTitle.trim() && frontHeader && backHeader) {
      onConfirmImport(deckTitle.trim(), frontHeader, backHeader);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const SelectMapping = ({ label, value, setter, options, otherValue }: { label: string, value: string, setter: (val: string) => void, options: string[], otherValue: string }) => (
    <div>
        <label className="block text-sm font-medium text-gray-600 dark:text-[#C8C5CA] mb-2">{label}</label>
        <select 
            value={value} 
            onChange={(e) => setter(e.target.value)}
            className="w-full bg-gray-100 dark:bg-[#4A4458] border border-gray-300 dark:border-[#645F73] text-gray-900 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#C8B4F3]"
        >
            <option value="">Pilih kolom</option>
            {options.map(header => (
                <option key={header} value={header} disabled={header === otherValue}>{header}</option>
            ))}
        </select>
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="import-deck-backdrop"
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
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Impor Dek dari File</h2>
            
            <div className="space-y-4">
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
                
                <h3 className="text-sm font-semibold text-gray-500 dark:text-[#C8C5CA] pt-2">Petakan Kolom</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <SelectMapping label="Depan Kartu" value={frontHeader} setter={setFrontHeader} options={data.headers} otherValue={backHeader} />
                    <SelectMapping label="Belakang Kartu" value={backHeader} setter={setBackHeader} options={data.headers} otherValue={frontHeader} />
                </div>

                <div>
                    <h3 className="text-sm font-semibold text-gray-500 dark:text-[#C8C5CA] pt-2">Pratinjau Data ({data.rows.length} baris)</h3>
                    <div className="max-h-32 overflow-y-auto bg-gray-100 dark:bg-[#1C1B1F] p-2 rounded-lg text-xs mt-2 border border-gray-300 dark:border-[#645F73]">
                        <table className="w-full">
                            <thead className="text-left text-gray-500 dark:text-[#948F99]">
                                <tr>
                                    {data.headers.map(h => <th key={h} className="p-1 font-semibold">{h}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {data.rows.slice(0, 5).map((row, index) => (
                                    <tr key={index} className="border-t border-gray-200 dark:border-gray-700">
                                        {data.headers.map((_h, cellIndex) => <td key={cellIndex} className="p-1 truncate max-w-[20ch]">{row[cellIndex]}</td>)}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div className="flex justify-end space-x-3 mt-8">
              <button type="button" onClick={onClose} className="px-4 py-2 rounded-full text-[#C8B4F3] font-semibold hover:bg-gray-500/10 dark:hover:bg-white/10">Batal</button>
              <button type="button" onClick={handleConfirm} disabled={!deckTitle.trim() || !frontHeader || !backHeader} className="px-6 py-2 bg-[#C8B4F3] text-black font-semibold rounded-full disabled:opacity-50">Impor</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ImportDeckModal;