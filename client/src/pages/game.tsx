import { useGameContext } from '~/components/GameContext'
import router from 'next/router'
import Layout from '~/components/Layout/Layout'

import InGameLayout from '~/components/Layout/InGameLayout'
import GameCard from '~/components/Atoms/GameCard'
import { ICard } from '~/models/Deck'
import { useState } from 'react'
import { toast } from 'react-toastify'
import { CountdownCircleTimer } from 'react-countdown-circle-timer'
import useSound from 'use-sound'
import { useAudio } from '~/components/AudioContext'
import TimerScreen from '~/components/Layout/TimerScreen'

export default function Game() {
  const {
    myHand,
    isCurrentUserJudge,
    gameState,
    startingState,
    myId,
    playerSelectCards,
  } = useGameContext()
  const myCards = myHand.cards

  const [playSwitchOn] = useSound('/sounds/switch-on.mp3')
  const [playSwitchOff] = useSound('/sounds/switch-off.mp3')
  const { isMuted } = useAudio()

  const [selectedCards, setSelectedCards] = useState<Array<ICard>>([])

  const { currentQuestionCard } = gameState

  const myStatus = gameState.players.find((p) => p.id === myId)?.status

  const handleCardClick = (card: ICard) => {
    if (myStatus !== 'pending') return

    // if (!isMuted) checked ? playSwitchOn() : playSwitchOff()
    // find the substitute for checked

    if (selectedCards.includes(card)) {
      setSelectedCards(selectedCards.filter((c) => c !== card))
      if (!isMuted) playSwitchOff()
    } else if (
      gameState.currentQuestionCard &&
      selectedCards.length < gameState.currentQuestionCard.spaces
    ) {
      setSelectedCards([...selectedCards, card])
      if (!isMuted) playSwitchOn()
    }
  }

  // const time = gameState.config.time
  const time = 999999

  const handleTimeout = () => {
    console.log('Timeout triggered')
    if (isCurrentUserJudge) {
      console.log('isCurrentUserJudge is true, returning')
      return
    }
    if (!gameState.currentQuestionCard?.spaces) {
      console.log('No cards are required, returning')
      return
    }
    if (selectedCards.length === gameState.currentQuestionCard?.spaces) {
      console.log(
        'The user has already selected the required number of cards, returning'
      )
      return
    }

    // Randomly select cards
    const cardsToSelect =
      gameState.currentQuestionCard?.spaces - selectedCards.length
    const unselectedCards = myCards.filter(
      (card) => !selectedCards.includes(card)
    )
    const randomCards = unselectedCards
      .sort(() => 0.5 - Math.random())
      .slice(0, cardsToSelect)

    // Add randomly selected cards to the selected ones and submit
    const finalSelectedCards = [...selectedCards, ...randomCards]
    setSelectedCards(finalSelectedCards)
    // wait 1 second to submit
    // setTimeout(() => {
    playerSelectCards(finalSelectedCards)
    toast.success('Cards selected')
    // }, 1000)
  }

  const handleConfirm = () => {
    if (selectedCards.length === gameState.currentQuestionCard?.spaces) {
      playerSelectCards(selectedCards)
      toast.success('Cards selected')
      return
    }

    toast.error('You must select the correct number of cards')
  }

  const canConfirm =
    selectedCards.length === gameState.currentQuestionCard?.spaces &&
    !isCurrentUserJudge &&
    myStatus === 'pending'

  if (gameState.status === 'starting') {
    return (
      <Layout>
        <h1 className="">{startingState}</h1>
      </Layout>
    )
  }

  return (
    <Layout>
      <InGameLayout>
        <TimerScreen
          subtitle="Choose the best fit card(s)"
          time={time}
          handleTimeout={handleTimeout}
        >
          <div className="">
            <div className="">
              <div className="">
                {currentQuestionCard && (
                  <GameCard cardInfo={currentQuestionCard} selected={false} />
                )}
              </div>

              {isCurrentUserJudge && (
                <div className="flex justify-center">
                  <h2>Just wait the other players</h2>
                </div>
              )}
              {!isCurrentUserJudge && (
                <div className="">
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

            {!isCurrentUserJudge && (
              <div className="">
                <button onClick={handleConfirm} disabled={!canConfirm}>
                  Confirm
                </button>
              </div>
            )}
          </div>
        </TimerScreen>
      </InGameLayout>
    </Layout>
  )
}

