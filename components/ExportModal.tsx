import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { useCardStore } from '../store/cardStore';
import { Deck } from '../types';
import Icon from './Icon';
import { exportData } from '../services/exportService';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialItemId: number | null;
  currentParentId: number | null;
  selectedDeckId: number | null;
}

type ExportScope = 'all' | 'folder' | 'deck';
type ExportFormat = 'csv' | 'xlsx';

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

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, initialItemId, currentParentId, selectedDeckId }) => {
    const getDeckById = useCardStore(state => state.getDeckById);
    
    const [scope, setScope] = useState<ExportScope>('all');
    const [format, setFormat] = useState<ExportFormat>('xlsx');
    const [isLoading, setIsLoading] = useState(false);
    const [contextItem, setContextItem] = useState<Deck | null>(null);
    
    const isContextExport = initialItemId !== null;

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
        const fetchItemInfo = async () => {
            const itemIdToFetch = isContextExport ? initialItemId : (selectedDeckId ?? currentParentId);
            
            if (itemIdToFetch) {
                const item = await getDeckById(itemIdToFetch);
                setContextItem(item || null);
            } else {
                setContextItem(null);
            }
        };

        if (isOpen) {
            fetchItemInfo();
            if (!isContextExport) {
                if (selectedDeckId) setScope('deck');
                else if (currentParentId) setScope('folder');
                else setScope('all');
            }
        }
    }, [isOpen, isContextExport, initialItemId, selectedDeckId, currentParentId, getDeckById]);

    useEffect(() => {
        if (isContextExport && contextItem) {
            setScope(contextItem.type);
        }
    }, [isContextExport, contextItem]);


    const handleExport = async () => {
        setIsLoading(true);
        let exportScope: 'all' | 'folder' | 'deck' = 'all';
        let exportItemId: number | null = null;
        let exportItemName = 'export';

        if (isContextExport && contextItem) {
            exportScope = contextItem.type;
            exportItemId = contextItem.id;
            exportItemName = contextItem.title;
        } else {
            exportScope = scope;
            if (scope === 'deck') {
                exportItemId = selectedDeckId;
                exportItemName = contextItem?.title ?? 'deck';
            } else if (scope === 'folder') {
                exportItemId = currentParentId;
                exportItemName = contextItem?.title ?? 'folder';
            } else {
                exportItemName = 'all_decks';
            }
        }
        
        // Brief delay to allow UI to update to loading state
        await new Promise(resolve => setTimeout(resolve, 100));
        
        await exportData(exportScope, format, exportItemId, exportItemName);

        setIsLoading(false);
        onClose();
    };

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const OptionButton = ({ label, value, current, setter, disabled = false }: { label: string, value: string, current: string, setter: (val: any) => void, disabled?: boolean }) => (
        <button
            onClick={() => !disabled && setter(value)}
            disabled={disabled}
            className={`w-full px-4 py-3 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                current === value
                ? 'bg-[#C8B4F3] text-black shadow-sm'
                : 'bg-gray-200 dark:bg-[#4A4458] text-gray-800 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-600/60'
            }`}
        >
            {label}
        </button>
    );

    const renderScopeSelection = () => {
        if (isContextExport) {
            return (
                <div className="w-full px-4 py-3 rounded-xl text-sm font-semibold bg-gray-200 dark:bg-[#4A4458] text-gray-800 dark:text-gray-100 text-center">
                    {contextItem 
                        ? `Ekspor ${contextItem.type === 'folder' ? 'Folder' : 'Dek'}: "${contextItem.title}"`
                        : 'Memuat item...'
                    }
                </div>
            );
        }

        return (
            <div className="grid grid-cols-1 gap-3">
                <OptionButton label="Semua Dek" value="all" current={scope} setter={setScope} />
                <OptionButton 
                    label={currentParentId && contextItem?.type === 'folder' ? `Folder: "${contextItem.title}"` : 'Folder Saat Ini'}
                    value="folder" 
                    current={scope} 
                    setter={setScope} 
                    disabled={!currentParentId || !!selectedDeckId}
                />
                <OptionButton
                    label={selectedDeckId && contextItem ? `Dek: "${contextItem.title}"` : 'Dek Saat Ini'}
                    value="deck" 
                    current={scope} 
                    setter={setScope} 
                    disabled={!selectedDeckId}
                />
            </div>
        );
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    key="export-modal-backdrop"
                    onClick={handleBackdropClick}
                    className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
                    variants={backdropVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                >
                    <motion.div
                        onClick={e => e.stopPropagation()}
                        className="bg-white dark:bg-[#2B2930] rounded-2xl p-6 w-full max-w-md shadow-xl"
                        variants={modalVariants}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="export-modal-title"
                    >
                        <h2 id="export-modal-title" className="text-xl font-bold text-gray-900 dark:text-white mb-6">Ekspor Data</h2>
                        
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-500 dark:text-[#C8C5CA] mb-3 px-1">CAKUPAN EKSPOR</h3>
                                {renderScopeSelection()}
                            </div>

                            <div>
                                <h3 className="text-sm font-semibold text-gray-500 dark:text-[#C8C5CA] mb-3 px-1">FORMAT FILE</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <OptionButton label="Excel (.xlsx)" value="xlsx" current={format} setter={setFormat} />
                                    <OptionButton label="CSV (.csv)" value="csv" current={format} setter={setFormat} />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3 mt-8">
                            <button type="button" onClick={onClose} className="px-4 py-2 rounded-full text-[#C8B4F3] font-semibold hover:bg-gray-500/10 dark:hover:bg-white/10">Batal</button>
                            <button type="button" onClick={handleExport} disabled={isLoading} className="px-6 py-2 bg-[#C8B4F3] text-black font-semibold rounded-full disabled:opacity-50 min-w-[90px] flex items-center justify-center">
                                {isLoading ? <Icon name="refresh" className="w-5 h-5 animate-spin" /> : 'Ekspor'}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ExportModal;