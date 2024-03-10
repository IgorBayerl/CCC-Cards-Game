import React, { useEffect, useState } from 'react';
import { useQuery } from 'react-query';
import useTranslation from 'next-translate/useTranslation';
import SearchDecksList from './SearchDecksList';
import DeckFiltersSection from '../Atoms/DeckFilters';
import { fetchLanguages } from '~/api/deck';
import { type DeckFilters } from '@ccc-cards-game/types';
import usePersistentState from '~/hooks/usePersistentState';

const queryConfig = {
  refetchOnWindowFocus: false,
  refetchOnMount: false,
};

const SearchDecks: React.FC = () => {
  const { lang } = useTranslation();
  const { data: languages = [] } = useQuery<string[]>('get-languages', fetchLanguages, queryConfig);
  const [deckFilters, setDeckFilters] = usePersistentState<DeckFilters>('deckFilters', {
    title: '',
    darknessLevel: [1, 2, 3],
    language: [],
  });

  // State to track if the component has initialized.
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // On component mount, check if deckFilters should update based on the current language
    if (!initialized && languages.length > 0) {
      const fallbackLanguage = languages.includes(lang) ? lang : languages[0] || 'en';

      // Update only if the language list is empty
      if (deckFilters.language.length === 0) {
        setDeckFilters((currentFilters) => ({
          ...currentFilters,
          language: [fallbackLanguage],
        }));
      }
      setInitialized(true);
    }
  }, [deckFilters.language.length, lang, languages, setDeckFilters, initialized]);

  return (
    <div className="flex flex-col gap-2 bg-opacity-50 text-accent max-h-full scrollbar-none">
      <DeckFiltersSection setFilters={setDeckFilters} filters={deckFilters} />
      <SearchDecksList filters={deckFilters} />
    </div>
  );
};

export default SearchDecks;
