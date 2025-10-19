import { db } from './databaseService';
import { Card, Deck } from '../types';
import { utils, writeFile } from 'xlsx';
import Papa from 'papaparse';
import { getCardsInHierarchy } from '../utils/gameUtils';
import { useCardStore } from '../store/cardStore';

const buildDeckPathMap = async (): Promise<Map<number, string>> => {
    const allDecks = await db.decks.toArray();
    const deckMap = new Map<number, Deck>(allDecks.map(d => [d.id, d]));
    const pathMap = new Map<number, string>();

    const getPath = (deckId: number): string => {
        if (pathMap.has(deckId)) {
            return pathMap.get(deckId)!;
        }
        const deck = deckMap.get(deckId);
        if (!deck) return '';
        if (deck.parentId === null) {
            const path = deck.title;
            pathMap.set(deckId, path);
            return path;
        }
        const parentPath = getPath(deck.parentId);
        const fullPath = parentPath ? `${parentPath} > ${deck.title}` : deck.title;
        pathMap.set(deckId, fullPath);
        return fullPath;
    };
    
    for (const deck of allDecks) {
        if (deck.type === 'deck') {
            getPath(deck.id);
        }
    }
    return pathMap;
};


const getCardsForExport = async (scope: 'all' | 'folder' | 'deck', itemId: number | null): Promise<Card[]> => {
    if (scope === 'all') {
        return await db.cards.orderBy('deckId').toArray();
    }
    if (scope === 'deck' && itemId) {
        return await db.cards.where({ deckId: itemId }).toArray();
    }
    if (scope === 'folder' && itemId) {
        return await getCardsInHierarchy(itemId);
    }
    return [];
};

export const exportData = async (
    scope: 'all' | 'folder' | 'deck',
    format: 'csv' | 'xlsx',
    itemId: number | null,
    itemName: string = 'export'
) => {
    try {
        const cardsToExport = await getCardsForExport(scope, itemId);
        if (cardsToExport.length === 0) {
            useCardStore.getState().showNotification({
                message: "Tidak ada kartu untuk diekspor dalam cakupan ini.",
                type: 'error'
            });
            return;
        }

        const deckPathMap = await buildDeckPathMap();

        // Transformasi data untuk ekspor dengan header yang dapat dibaca manusia
        const dataForSheet = cardsToExport.map(card => ({
            'Jalur Dek': deckPathMap.get(card.deckId) || 'Dek Tidak Dikenal',
            'Kanji (Depan)': card.front,
            'Katakana (Belakang)': card.back,
            'Terjemahan/Transkripsi': card.transcription || '',
            'Contoh Kalimat': card.example || ''
        }));
        
        const safeItemName = itemName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const fileName = `${safeItemName}_${new Date().toISOString().split('T')[0]}.${format}`;

        if (format === 'xlsx') {
            const worksheet = utils.json_to_sheet(dataForSheet);
            const workbook = utils.book_new();
            utils.book_append_sheet(workbook, worksheet, 'Flashcards');
            writeFile(workbook, fileName);
        } else { // csv
            const csv = Papa.unparse(dataForSheet);
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', fileName);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }

        useCardStore.getState().showNotification({
            message: `${cardsToExport.length} kartu berhasil diekspor!`,
            type: 'success'
        });
        
    } catch (error) {
        console.error("Gagal mengekspor data:", error);
        useCardStore.getState().showNotification({
            message: "Terjadi kesalahan saat mengekspor.",
            type: 'error'
        });
    }
};