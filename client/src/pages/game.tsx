import { useGameContext } from '~/components/GameContext'
import Layout from '~/components/Layout/Layout'

import InGameLayout from '~/components/Layout/InGameLayout'
import GameCard, { GameCardResult } from '~/components/Atoms/GameCard'
import { useState } from 'react'
import { toast } from 'react-toastify'
import useSound from 'use-sound'
import { useAudio } from '~/components/AudioContext'
import TimerTitle from '~/components/Layout/TimerScreen'
import LoadingWithText from '~/components/Atoms/LoadingWithText'
import useTranslation from 'next-translate/useTranslation'
import { type Card } from '@ccc-cards-game/shared'

export default function Game() {
  const { isCurrentUserJudge, gameState, myId, playerSelectCards } = useGameContext()
  const myCards = gameState.players.get(myId)?.cards || []

  const { t } = useTranslation('game')

  const [playSwitchOn] = useSound('/sounds/switch-on.mp3')
  const [playSwitchOff] = useSound('/sounds/switch-off.mp3')
  const { isMuted } = useAudio()

  const [selectedCards, setSelectedCards] = useState<Array<Card>>([])

  const { currentQuestionCard } = gameState

  const player = gameState.players.get(myId)
  const myStatus = player?.status

  const handleCardClick = (card: Card) => {
    if (myStatus !== 'pending') return

    // if (!isMuted) checked ? playSwitchOn() : playSwitchOff()
    // find the substitute for checked

    if (selectedCards.includes(card)) {
      setSelectedCards(selectedCards.filter((c) => c !== card))
      if (!isMuted) playSwitchOff()
    } else if (gameState.currentQuestionCard && selectedCards.length < gameState.currentQuestionCard.spaces) {
      setSelectedCards([...selectedCards, card])
      if (!isMuted) playSwitchOn()
    }
  }

  // const time = gameState.config.time
  const time = gameState.config.roundTime || 10

  const handleConfirm = () => {
    if (selectedCards.length === gameState.currentQuestionCard?.spaces) {
      playerSelectCards(selectedCards)
      toast.success('Cards selected')
      return
    }

    toast.error('You must select the correct number of cards')
  }

  const canConfirm =
    selectedCards.length === gameState.currentQuestionCard?.spaces && !isCurrentUserJudge && myStatus === 'pending'

  const selectedCardsTextArray = selectedCards.map((card) => card.text) || []

  if (gameState.roomStatus === 'starting') {
    return (
      <Layout>
        <h1 className="">Starting</h1>
      </Layout>
    )
  }

  return (
    <InGameLayout>
      <TimerTitle key="Choose your cards" subtitle={t('i-choose-the-cards-that-best-fit')} time={time} />
      <div className="bg-destaque-mobile flex flex-1 flex-col overflow-y-auto py-2 text-accent md:mx-4">
        <div className="flex h-full flex-1 flex-col justify-between ">

          <div className="flex flex-1 items-center justify-center px-3">
            {currentQuestionCard && (
              <GameCardResult question={currentQuestionCard.text || ''} answers={selectedCardsTextArray} />
            )}
          </div>

          {isCurrentUserJudge && <LoadingWithText text="You are the Judge of the round, wait the others to play." />}
          {!isCurrentUserJudge && (
            <div className="grid grid-cols-1 gap-2 overflow-y-auto lg:grid-cols-2">
              {myCards.map((card, index) => {
                const cardIndex = selectedCards.indexOf(card)
                return (
                  <GameCard
                    key={index}
                    cardInfo={card}
                    selected={cardIndex !== -1}
                    number={cardIndex !== -1 ? cardIndex + 1 : undefined}
                    onClick={() => handleCardClick(card)}
                  />
                )
              })}
            </div>
          )}
        </div>
      </div>
      {!isCurrentUserJudge && (
        <div className="flex items-center justify-center px-4 py-2">
          <button className="btn flex-1" onClick={handleConfirm} disabled={!canConfirm}>
            {t('i-confirm')}
          </button>
        </div>
      )}
    </InGameLayout>
  )
}
