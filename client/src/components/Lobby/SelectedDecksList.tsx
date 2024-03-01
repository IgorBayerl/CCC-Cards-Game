import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGameContext } from '~/components/GameContext';
import { type Deck } from '@ccc-cards-game/types';
import DeckItemCard from '../Atoms/DeckItem';


const SelectedDecksList: React.FC = () => {
  const { gameConfig } = useGameContext()

  const decksData: Deck[] = gameConfig.availableDecks.map((deck) => ({
    ...deck,
    selected: true,
  }))

  return (
    <div className="flex flex-col gap-2 overflow-y-auto overflow-x-clip max-h-full bg-opacity-50 text-accent scrollbar-none">
      <AnimatePresence mode="popLayout">
        {decksData.map((deck) => (
          <React.Fragment key={`${deck.id}_deck`}>
            <motion.div>
              <div className='px-3 py-2 flex flex-1'>
                <DeckItemCard deck={deck} />
              </div>
              <div className="divider mx-auto my-0 w-32" />
            </motion.div>
          </React.Fragment>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default SelectedDecksList;
