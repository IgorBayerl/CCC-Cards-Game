import { type DeckFilters } from '@ccc-cards-game/types';
import DeckFiltersSection from '../Atoms/DeckFilters';
import { useEffect, useState } from 'react';
import SearchDecksList from './SearchDecksList';
import useTranslation from 'next-translate/useTranslation';

const SearchDecks: React.FC = () => {
  const { lang } = useTranslation();

  const [deckFilters, setDeckFilters] = useState<DeckFilters>({
    title: '',
    darknessLevel: [1, 2, 3],
    language: ['pt'],
  });

  useEffect(() => {
    setDeckFilters((currentFilters) => ({
      ...currentFilters,
      language: [lang],
    }));
  }, [lang]);

  return (
    <div className="flex flex-col gap-2 bg-opacity-50 text-accent max-h-full scrollbar-none">
      <DeckFiltersSection
        setFilters={setDeckFilters} filters={deckFilters} />
      <SearchDecksList filters={deckFilters} />
    </div>
  );
};

export default SearchDecks;
