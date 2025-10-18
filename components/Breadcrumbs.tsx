import React, { useState, useEffect } from 'react';
import { Deck } from '../types';
import { useCardStore } from '../store/cardStore';

interface BreadcrumbsProps {
  currentDeckId: number | null;
  onNavigate: (deckId: number | null) => void;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ currentDeckId, onNavigate }) => {
  const [path, setPath] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(false);
  const getDeckPath = useCardStore(state => state.getDeckPath);

  useEffect(() => {
    const fetchPath = async () => {
      setLoading(true);
      const newPath = await getDeckPath(currentDeckId);
      setPath(newPath);
      setLoading(false);
    };

    fetchPath();
  }, [currentDeckId, getDeckPath]);

  // Mencegah pergeseran layout saat memuat dengan menampilkan placeholder.
  if (loading) {
    return <div className="h-5 pb-2 animate-pulse"><div className="bg-gray-700/50 h-4 w-1/3 rounded"></div></div>;
  }
  
  if (path.length === 0) {
    return <div className="h-5 pb-2"></div>; // Menjaga ruang agar konsisten
  }

  return (
    <nav aria-label="breadcrumb" className="pb-2 text-sm text-[#C8C5CA] flex items-center flex-wrap h-5">
      <button onClick={() => onNavigate(null)} className="hover:underline">
        Semua Dek
      </button>
      {path.map((deck, index) => (
        <React.Fragment key={deck.id}>
          <span className="mx-2 select-none">/</span>
          {index < path.length - 1 ? (
            <button onClick={() => onNavigate(deck.id)} className="hover:underline">
              {deck.title}
            </button>
          ) : (
            <span className="font-semibold text-white" aria-current="page">
              {deck.title}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumbs;