import { useGameContext } from '~/components/GameContext'
import router from 'next/router'
import Layout from '~/components/Layout/Layout'

import InGameLayout from '~/components/Layout/InGameLayout'
import GameCard, { GameCardResult } from '~/components/Atoms/GameCard'
import { ICard, ICardAnswer } from '~/models/Deck'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { CountdownCircleTimer } from 'react-countdown-circle-timer'
import TimerTitle from '~/components/Layout/TimerScreen'
import LoadingWithText from '~/components/Atoms/LoadingWithText'
import { useAudio } from '~/components/AudioContext'
import useSound from 'use-sound'

interface IUpdateResultCards {
  hasNext: boolean
  cards: { [playerId: string]: ICardAnswer[] }
}

export default function Judging() {

  const { isMuted } = useAudio()

  const [playSwitchOn] = useSound('/sounds/switch-on.mp3')

  const { myHand, socket, gameState, isCurrentUserJudge } = useGameContext()

  const { currentQuestionCard } = gameState

  const [timerId, setTimerId] = useState<ReturnType<typeof setTimeout> | null>(
    null
  )

  const [resultCards, setResultCards] = useState<IUpdateResultCards>({
    hasNext: true,
    cards: {},
  })
  const [selectedGroup, setSelectedGroup] = useState<{
    playerId: string
    cards: ICardAnswer[]
  } | null>(null)
  const [seeAllResults, setSeeAllResults] = useState(false)

  const [resetKey, setResetKey] = useState(0)

  const hasNext = resultCards.hasNext === true
  const cards = resultCards.cards
  const lastCards = Object.values(cards).pop()

  const seeGoToAllResultsBtn = !hasNext && !seeAllResults
  const seeNextBtn = hasNext && !seeAllResults
  const seeIndividualResults = !seeAllResults
  const seeConfirmBtn = seeAllResults
  const enableConfirmBtn = selectedGroup !== null

  useEffect(() => {
    socket?.on('game:updateResultCards', (resultCards: IUpdateResultCards) => {
      console.log('game:updateResultCards', resultCards)
      setResetKey((prevKey) => prevKey + 1)
      setResultCards(resultCards)
    })

    socket?.on('game:showAllCards', (resultCards: IUpdateResultCards) => {
      console.log('game:showAllCards', resultCards)
      setResetKey((prevKey) => prevKey + 1)
      setSeeAllResults(true)
      setResultCards(resultCards)
    })
    return () => {
      socket?.off('game:updateResultCards')
      socket?.off('game:showAllCards')
    }
  }, [socket])

  const handleGroupClick = (playerId: string, group: ICardAnswer[]) => {
    if (!isCurrentUserJudge) return
    
    if (!isMuted) playSwitchOn()
    setSelectedGroup({ playerId, cards: group })
  }

  const sendDecision = () => {
    if (selectedGroup) {
      socket?.emit('game:judgeDecision', selectedGroup.playerId)
      setSelectedGroup(null)
    } else {
      toast.error('You must select a group of cards')
    }
  }
  const handleConfirm = () => {
    if (selectedGroup) {
      console.log(
        'Confirming selection of group:',
        selectedGroup.cards,
        'from player:',
        selectedGroup.playerId
      )
      sendDecision()
      setSelectedGroup(null) // Clear the selection
    } else {
      toast.error('You must select a group of cards')
    }
  }

  const handleNextCard = () => {
    console.log('>> next card')
    socket?.emit('game:requestNextCard')
  }

  const handleSeeResults = () => {
    setSeeAllResults(true)
    socket?.emit('game:seeAllRoundAnswers')
    console.log('>> see results')
  }
  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     handleTimerTimeout()
  //   }, 10000)
  //   setTimerId(timer)
  //   return () => {
  //     void clearTimeout(timer)
  //   }
  // }, [])

  useEffect(() => {
    return () => {
      if (timerId !== null) {
        clearTimeout(timerId)
      }
    }
  }, [timerId])

  const handleTimerTimeout = () => {
    if (!isCurrentUserJudge) return
    if (seeNextBtn) {
      handleNextCard()
      return
    }

    if (seeGoToAllResultsBtn) {
      handleSeeResults()
      return
    }
    if (seeConfirmBtn) {
      // TODO: select a random group
      resultCards.cards
      const randomPlayerId = Object.keys(resultCards.cards)[0]! //BUG: not that random
      const randomGroup = resultCards.cards[randomPlayerId]!
      handleGroupClick(randomPlayerId, randomGroup)

      // TODO: wait for a second and then confirm
      // setTimeout(() => {
      handleConfirm() //BUG: this is throwing the you must select a group error, but it is selecting a group
      // }, 1000)
    }
  }

  const time = 99999 // 10 seconds

  // TODO: add a timer
  // TODO: change the layout to look more like a chat than a card game

  const getAnswerCardText = () => {
    if(seeAllResults) {
      return selectedGroup?.cards.map((card) => card.text) || []
    }
    return lastCards?.map((card) => card.text) || []
  }

  const answersCardText = lastCards?.map((card) => card.text) || []

  return (
    <InGameLayout>
      <div className="bg-destaque-mobile flex flex-1 flex-col py-2 md:mx-4">
        <TimerTitle
          key={resetKey}
          subtitle="Judging"
          time={time}
          handleTimeout={handleTimerTimeout}
        />
        <div className="flex flex-1 flex-col">
          <div className="flex flex-1 flex-col justify-between">
            <div className="flex flex-1 items-center justify-center">
              {currentQuestionCard && (
                <GameCardResult
                  question={currentQuestionCard.text}
                  answers={getAnswerCardText()}
                />
              )}
            </div>
            <div className="">
              {seeIndividualResults &&
                lastCards?.map((card, index) => (
                  <div key={index} className="">
                    <GameCard cardInfo={card} selected={false} />
                  </div>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
              {
                // all results
                seeAllResults &&
                  Object.entries(cards).map(([playerId, cardList]) => (
                    <div
                      key={playerId}
                      className={`flex flex-col gap-1  ${
                        selectedGroup && selectedGroup.playerId === playerId
                          ? 'border-2 border-primary'
                          : 'border-2 border-transparent'
                      }`}
                      onClick={() => handleGroupClick(playerId, cardList)}
                    >
                      {cardList.map((card, index) => (
                        <div key={index} className="">
                          <GameCard cardInfo={card} selected={false} />
                        </div>
                      ))}
                    </div>
                  ))
              }
            </div>
          </div>
        </div>
      </div>
      <JudgeActions
        isCurrentUserJudge={isCurrentUserJudge}
        seeGoToAllResultsBtn={seeGoToAllResultsBtn}
        handleSeeResults={handleSeeResults}
        seeNextBtn={seeNextBtn}
        handleNextCard={handleNextCard}
        seeConfirmBtn={seeConfirmBtn}
        enableConfirmBtn={enableConfirmBtn}
        handleConfirm={handleConfirm}
      />
      {!isCurrentUserJudge && (
        <div className="flex items-center justify-center px-4 py-2">
          <LoadingWithText text="Wait the judge." />
        </div>
      )}
    </InGameLayout>
  )
}

interface IJudgeActionsProps {
  isCurrentUserJudge: boolean
  seeGoToAllResultsBtn: boolean
  handleSeeResults: () => void
  seeNextBtn: boolean
  handleNextCard: () => void
  seeConfirmBtn: boolean
  enableConfirmBtn: boolean
  handleConfirm: () => void
}

export const JudgeActions: React.FC<IJudgeActionsProps> = ({
  isCurrentUserJudge,
  seeGoToAllResultsBtn,
  handleSeeResults,
  seeNextBtn,
  handleNextCard,
  seeConfirmBtn,
  enableConfirmBtn,
  handleConfirm,
}) => {
  if (!isCurrentUserJudge) {
    return null
  }
  return (
    <div className="flex items-center justify-center px-4 py-2">
      {seeGoToAllResultsBtn && (
        <button className="btn flex-1" onClick={handleSeeResults}>
          See all results
        </button>
      )}
      {seeNextBtn && (
        <button className="btn flex-1" onClick={handleNextCard}>
          Next
        </button>
      )}
      {seeConfirmBtn && (
        <button
          className="btn flex-1"
          disabled={!enableConfirmBtn}
          onClick={handleConfirm}
        >
          Confirm
        </button>
      )}
    </div>
  )
}

{
  /* <div className="flex items-center justify-center px-4 py-2">
          <button
            className="btn flex-1"
            onClick={handleConfirm}
            disabled={!canConfirm}
          >
            Confirm
          </button>
        </div> */
}
