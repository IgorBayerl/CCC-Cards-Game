import { useGameContext } from '~/components/GameContext'
import InGameLayout from '~/components/Layout/InGameLayout'
import { GameCardResult } from '~/components/Atoms/GameCard'
import { useState } from 'react'
import Image from 'next/image'
import ConfettiExplosion from 'react-confetti-explosion'
import useTranslation from 'next-translate/useTranslation'

export default function End() {
  const { gameState, admCommand, isCurrentUserLeader } = useGameContext()

  const { players } = gameState

  const { t } = useTranslation('game')

  const winner = players.reduce(
    (prev, current) => (prev.score > current.score ? prev : current),
    {
      score: -Infinity,
      username: 'No players',
      id: '',
      pictureUrl: '',
    }
  )

  const winnerHistory = gameState.rounds?.flatMap((round) => {
    const winnerId = round.winner?.id
    if (!winnerId) return []
    if (winnerId === winner.id) {
      return [
        {
          question: round.questionCard.text,
          answer: round.answerCards[winnerId],
        },
      ]
    }
    return []
  })

  const [keyTest, setKeyTest] = useState(0)

  function explodeConfetti() {
    setKeyTest((prev) => prev + 1)
  }

  function handleStartNewGame() {
    admCommand('start-new-game')
  }

  function handleBackToLobby() {
    admCommand('back-to-lobby')
  }

  return (
    <InGameLayout>
      <div className="bg-destaque-mobile flex flex-1 flex-col overflow-y-auto py-2 text-gray-200 md:mx-4">
        <h1 className="text-xl font-bold">{t('i-match-winner')}</h1>
        <div className="flex flex-1 items-center ">
          <div className="flex flex-1 flex-col items-center gap-3">
            <ConfettiExplosion key={keyTest} />
            <Image
              src={winner?.pictureUrl || ''}
              alt={winner?.username || ''}
              width={100}
              height={100}
              className="rounded-full border-4 border-white"
              onClick={explodeConfetti}
            />
            <h1 className="text-xl font-bold" onClick={explodeConfetti}>
              {winner?.username}
            </h1>
          </div>
        </div>
        <div className="mx-5 flex flex-1 flex-col overflow-y-auto scrollbar-none">
          {winnerHistory &&
            winnerHistory.map((item, index) => (
              <div key={index} className="chat chat-end ">
                <div className="chat-image avatar">
                  <div className="w-10 rounded-full">
                    <Image
                      src={winner?.pictureUrl || ''}
                      alt={winner?.username || ''}
                      width={100}
                      height={100}
                      className="rounded-full"
                    />
                  </div>
                </div>
                <div className="chat-bubble bg-neutral text-gray-200">
                  <GameCardResult
                    question={item?.question || ''}
                    answers={item?.answer?.map((answer) => answer.text) || []}
                  />
                </div>
              </div>
            ))}
        </div>
      </div>
      {isCurrentUserLeader && (
        <div className="flex flex-col  items-stretch justify-center gap-2 px-4 py-2 md:flex-row">
          <button className="btn flex-1" onClick={handleBackToLobby}>
            {t('i-back-to-lobby')}
          </button>
          <button className="btn flex-1" onClick={handleStartNewGame}>
            {t('i-play-again')}
          </button>
        </div>
      )}
    </InGameLayout>
  )
}
