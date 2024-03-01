import { type Deck, type DeckFilters } from '@ccc-cards-game/types';
import { useQuery } from 'react-query';
import { fetchDecks } from '~/api/deck';
import LoadingFullScreen from '../Atoms/LoadingFullScreen';
import { useGameContext } from '../GameContext';
import React from 'react';
import DeckItem from '../Atoms/DeckItem';
import Clickable from '../Atoms/Clickable';
import SelectedBorder from '../Atoms/SelectedBorder';
import useTranslation from 'next-translate/useTranslation';
import useSound from 'use-sound';
import { useAudio } from '../AudioContext';

interface SearchDecksListProps {
  filters: DeckFilters;
}

const queryConfig = {
  refetchOnWindowFocus: false,
  refetchOnMount: false,
}

const SearchDecksList: React.FC<SearchDecksListProps> = ({ filters }) => {
  // Localization and Context
  const { t } = useTranslation('lobby')
  const { gameConfig, setConfig } = useGameContext()
  const { isMuted } = useAudio()

  // Sounds
  const [playSwitchOn] = useSound('/sounds/switch-on.mp3')
  const [playSwitchOff] = useSound('/sounds/switch-off.mp3')

  const decksResponse = useQuery(
    ['get-decks', filters.language, filters.darknessLevel, filters.title],
    () => fetchDecks(filters),
    queryConfig
  )

  const handleDeckChange = (deck: Deck) => {
    const checked = !deck.selected
    const id = deck.id

    if (!isMuted) checked ? playSwitchOn() : playSwitchOff()

    let newSelectedDecks: Deck[] = []
    if (checked) {
      // deck to add is the deck with the id passed as argument
      const deckToAdd = decksData.find((deck) => deck.id === id)

      // if the deck is not found, log an error and return
      if (!deckToAdd) return console.error(`Deck not found with id ${id}`)

      newSelectedDecks = [...gameConfig.availableDecks, deckToAdd]
    } else {
      newSelectedDecks = gameConfig.availableDecks.filter((deck) => deck.id !== id)
    }

    setConfig({ ...gameConfig, availableDecks: newSelectedDecks })
  }

  if (decksResponse.isLoading) {
    return <LoadingFullScreen />
  }

  if (decksResponse.isError || !decksResponse.data) {
    return <div>Something went wrong!</div>
  }

  const decksData = decksResponse.data.data.decks

  const decksListData = decksData.map((deck) => ({
    ...deck,
    selected: gameConfig.availableDecks.some((selectedDeck) => selectedDeck.id === deck.id),
  }))

  return (
    <div className="gap-3 h-full overflow-y-auto overflow-x-clip rounded-md md:mx-3">
      {decksListData.map((deck) => (
        <React.Fragment key={`${deck.id}_deck`}>
          <div>
            <Clickable
              onClick={() => handleDeckChange(deck)}
            >
              <SelectedBorder active={deck.selected} >
                <div className='px-2 py-2 flex flex-1'>
                  <DeckItem deck={deck} />
                </div>
              </SelectedBorder>
            </Clickable>
            <div className="divider mx-auto my-0 w-32" />
          </div>
        </React.Fragment>
      ))}
    </div>
  );
};

export default SearchDecksList;
