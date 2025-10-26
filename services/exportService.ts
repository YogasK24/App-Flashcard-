import { db } from './databaseService';
import { Card } from '../types';
import { utils, writeFile } from 'xlsx';
import Papa from 'papaparse';
import { getCardsInHierarchy } from '../utils/gameUtils';
import { useCardStore } from '../store/cardStore';

const getCardsForExport = async (scope: 'all' | 'folder' | 'deck', itemId: number | null): Promise<Card[]> => {
    if (scope === 'all') {
        return await db.cards.orderBy('deckId').toArray();
    }
    if (scope === 'deck' && itemId) {
        // PERBAIKAN: Menggunakan sintaks Dexie yang benar untuk kueri indeks tunggal.
        return await db.cards.where('deckId').equals(itemId).toArray();
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

        const masterFields: Record<string, (card: Card) => string | undefined> = {
            '日本語(漢字)': (card) => card.front,
            '日本語(片仮名)': (card) => card.back,
            'Terjemahan': (card) => card.transcription,
            'Contoh Kalimat': (card) => card.example,
        };
        
        // Optimasi: Tentukan header aktif dalam satu kali iterasi.
        const activeHeadersSet = new Set<string>();
        cardsToExport.forEach(card => {
            for (const header in masterFields) {
                if (Object.prototype.hasOwnProperty.call(masterFields, header)) {
                    const value = masterFields[header as keyof typeof masterFields](card);
                    if (value != null && String(value).trim() !== '') {
                        activeHeadersSet.add(header);
                    }
                }
            }
        });

        // Pertahankan urutan header asli dari masterFields.
        let activeHeaders = Object.keys(masterFields).filter(header => activeHeadersSet.has(header));

        // Jika tidak ada header yang aktif (mis., semua data opsional kosong),
        // pastikan setidaknya header utama disertakan.
        if (activeHeaders.length === 0) {
            activeHeaders = ['日本語(漢字)', '日本語(片仮名)'];
        }
        
        const dataForSheet = cardsToExport.map(card => {
            const row: Record<string, string> = {};
            activeHeaders.forEach(header => {
                const value = masterFields[header as keyof typeof masterFields](card);
                row[header] = value || '';
            });
            return row;
        });
        
        const safeItemName = itemName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        const fileName = `${safeItemName}_${new Date().toISOString().split('T')[0]}.${format}`;

        if (format === 'xlsx') {
            const worksheet = utils.json_to_sheet(dataForSheet, { header: activeHeaders });
            const workbook = utils.book_new();
            utils.book_append_sheet(workbook, worksheet, 'Flashcards');
            writeFile(workbook, fileName);
        } else { // csv
            const csv = Papa.unparse(dataForSheet, { columns: activeHeaders });
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