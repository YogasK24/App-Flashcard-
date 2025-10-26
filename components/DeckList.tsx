import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FixedSizeList as List } from 'react-window';
import { Deck } from '../types';
import DeckItem from './DeckItem';
import Icon from './Icon';

interface DeckListProps {
  decks: Deck[];
  loading: boolean;
  onItemClick: (deck: Deck) => void;
  onShowContextMenu: (event: React.MouseEvent, deckId: number) => void;
  onPlayClick: (deckId: number) => void;
  openingDeckId: number | null;
  highlightedItemId: number | null;
  searchQuery: string;
}

const Row = ({ index, style, data }: { index: number; style: React.CSSProperties; data: any }) => {
    const { decks, onItemClick, onShowContextMenu, onPlayClick, openingDeckId, highlightedItemId } = data;
    const deck = decks[index];

    // Menerapkan padding untuk mensimulasikan efek `space-y-2`
    const itemStyle = {
      ...style,
      top: `${(style.top as number) + 4}px`,
      height: `${(style.height as number) - 8}px`,
    };
  
    return (
      <div style={itemStyle}>
        <DeckItem
          deck={deck}
          onItemClick={onItemClick}
          onShowContextMenu={onShowContextMenu}
          onPlayClick={onPlayClick}
          openingDeckId={openingDeckId}
          highlightedItemId={highlightedItemId}
        />
      </div>
    );
};

const DeckList: React.FC<DeckListProps> = ({ decks, loading, onItemClick, onShowContextMenu, onPlayClick, openingDeckId, highlightedItemId, searchQuery }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const observer = new ResizeObserver(entries => {
        if (entries[0]) {
            const { width, height } = entries[0].contentRect;
            setSize({ width, height });
        }
    });
    if (containerRef.current) {
        observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, []);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <p className="text-gray-500 dark:text-[#C8C5CA]">Memuat dek...</p>
      </div>
    );
  }

  if (decks.length === 0) {
    const isSearching = searchQuery.trim() !== '';
    if (isSearching) {
        return (
            <div className="flex flex-col justify-center items-center h-48 text-center text-gray-500 dark:text-[#C8C5CA]">
                <Icon name="search" className="w-16 h-16 mb-4 opacity-50" />
                <h3 className="text-lg font-semibold text-gray-700 dark:text-white">Hasil pencarian kosong</h3>
                <p className="mt-1">Coba kata kunci lain atau periksa filternya.</p>
            </div>
        );
    }
    return (
      <div className="flex flex-col justify-center items-center h-48 text-center text-gray-500 dark:text-[#C8C5CA]">
        <Icon name="folder" className="w-16 h-16 mb-4 opacity-50" />
        <h3 className="text-lg font-semibold text-gray-700 dark:text-white">Belum ada dek</h3>
        <p className="mt-1">Ayo buat yang pertama menggunakan tombol + di bawah!</p>
      </div>
    );
  }

  const DECK_ITEM_HEIGHT = 88;
  const ROW_GAP = 8;
  const ITEM_SIZE_WITH_GAP = DECK_ITEM_HEIGHT + ROW_GAP;

  const itemData = {
    decks,
    onItemClick,
    onShowContextMenu,
    onPlayClick,
    openingDeckId,
    highlightedItemId,
  };

  return (
    <div ref={containerRef} className="h-full w-full">
      {size.width > 0 && size.height > 0 && (
        <List
          height={size.height}
          itemCount={decks.length}
          itemSize={ITEM_SIZE_WITH_GAP}
          width={size.width}
          itemData={itemData}
        >
          {Row}
        </List>
      )}
    </div>
  );
};

export default DeckList;