import { useGameContext } from '~/components/GameContext'

import InGameLayout from '~/components/Layout/InGameLayout'
import GameCard, { GameCardResult } from '~/components/Atoms/GameCard'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import TimerTitle from '~/components/Layout/TimerScreen'
import LoadingWithText from '~/components/Atoms/LoadingWithText'
import { useAudio } from '~/components/AudioContext'
import useSound from 'use-sound'
import useTranslation from 'next-translate/useTranslation'
import { MessageType, type AnswerCard } from '@ccc-cards-game/types'

export default function Judging() {
  const { isMuted } = useAudio()
  const { t } = useTranslation('game')

  const [playSwitchOn] = useSound('/sounds/switch-on.mp3')

  const { sendToRoom, gameState, isCurrentUserJudge, gameConfig } = useGameContext()

  const currentQuestionCard = gameState.currentQuestionCard
  const rounds = gameState.rounds
  const currentRound = rounds[rounds.length - 1]
  const { allCardsRevealed, answerCards } = currentRound || {}
  const hasNext = allCardsRevealed === false
  const currentRevealedCardId = currentRound?.currentRevealedId || ''

  const [selectedGroup, setSelectedGroup] = useState<{
    playerId: string
    cards: AnswerCard[]
  } | null>(null)
  const seeAllResults = !hasNext

  const [resetKey, setResetKey] = useState(0)

  
  useEffect(() => {
    if (allCardsRevealed) {
      setResetKey((prev) => prev + 1)
    }
  }, [allCardsRevealed, currentRevealedCardId])


  const time = gameConfig.roundTime || 10

  const seeGoToAllResultsBtn = !hasNext && !seeAllResults
  const seeNextBtn = hasNext && !seeAllResults
  const seeIndividualResults = !seeAllResults
  const seeConfirmBtn = seeAllResults
  const enableConfirmBtn = selectedGroup !== null

  const handleGroupClick = (playerId: string, cards: AnswerCard[]) => {
    if (!isCurrentUserJudge) return

    if (!isMuted) playSwitchOn()
    setSelectedGroup({ playerId, cards })
  }

  const sendDecision = () => {
    if (selectedGroup) {
      const payload = {
        winner: selectedGroup.playerId,
      }
      sendToRoom(MessageType.JUDGE_DECISION, payload)
      setSelectedGroup(null)
    } else {
      toast.error('You must select a group of cards')
    }
  }
  const handleConfirm = () => {
    if (selectedGroup) {
      sendDecision()
      setSelectedGroup(null) // Clear the selection
    } else {
      toast.error('You must select a group of cards')
    }
  }

  const handleNextCard = () => {
    sendToRoom(MessageType.REQUEST_NEXT_CARD, null)
  }


  function getRevealedCardTexts() {
    if (seeAllResults) {
      if (!selectedGroup) return []
      return selectedGroup.cards.map((card) => card.text)
    }

    if (!currentRound) return []

    const revealedCardCollection = currentRound?.answerCards?.get(currentRevealedCardId) || { cards: [] }

    return revealedCardCollection.cards.map((card) => card.text)
  }

  return (
    <InGameLayout>
      <TimerTitle key={resetKey} subtitle={t('i-judging')} time={time} />
      <div className="bg-destaque-mobile flex flex-1 flex-col overflow-y-auto py-2 text-accent md:mx-4">
        <div className="flex flex-1 flex-col">
          <div className="flex flex-1 flex-col justify-between">
            <div className="flex flex-1 items-center justify-center">
              {currentQuestionCard && (
                <GameCardResult question={currentQuestionCard.text || ''} answers={getRevealedCardTexts()} />
              )}
            </div>
            <div className="">
              {seeIndividualResults &&
                currentRound?.answerCards?.get(currentRevealedCardId)?.cards.map((card, index) => (
                  <div key={index} className="">
                    <GameCard cardInfo={card} selected={false} />
                  </div>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-2 overflow-y-auto lg:grid-cols-2">
              {seeAllResults &&
                answerCards &&
                [...answerCards.entries()].map(([playerId, cardCollection]) => (
                  <div
                    key={playerId}
                    className={`flex flex-col gap-1  ${
                      selectedGroup && selectedGroup.playerId === playerId
                        ? 'border-2 border-primary'
                        : 'border-2 border-transparent'
                    }`}
                    onClick={() => handleGroupClick(playerId, cardCollection.cards)}
                  >
                    {cardCollection.cards.map((card, index) => (
                      <div key={index} className="">
                        <GameCard cardInfo={card} selected={false} />
                      </div>
                    ))}
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
      <JudgeActions
        isCurrentUserJudge={isCurrentUserJudge}
        seeGoToAllResultsBtn={seeGoToAllResultsBtn}
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
  seeNextBtn: boolean
  handleNextCard: () => void
  seeConfirmBtn: boolean
  enableConfirmBtn: boolean
  handleConfirm: () => void
}

export const JudgeActions: React.FC<IJudgeActionsProps> = ({
  isCurrentUserJudge,
  seeGoToAllResultsBtn,
  seeNextBtn,
  handleNextCard,
  seeConfirmBtn,
  enableConfirmBtn,
  handleConfirm,
}) => {
  const { t } = useTranslation('game')
  if (!isCurrentUserJudge) {
    return null
  }
  return (
    <div className="flex items-center justify-center px-4 py-2">
      {seeGoToAllResultsBtn && (
        <button className="btn flex-1" onClick={handleNextCard}>
          {t('i-see-all-results')}
        </button>
      )}
      {seeNextBtn && (
        <button className="btn flex-1" onClick={handleNextCard}>
          {t('i-next')}
        </button>
      )}
      {seeConfirmBtn && (
        <button
          className="btn flex-1"
          disabled={!enableConfirmBtn}
          onClick={handleConfirm}
        >
          {t('i-confirm')}
        </button>
      )}
    </div>
  )
}
