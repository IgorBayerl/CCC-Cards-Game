import { useGameContext } from '~/components/GameContext'
import Layout from '~/components/Layout/Layout'

import InGameLayout from '~/components/Layout/InGameLayout'
import  { GameCardResult } from '~/components/Atoms/GameCard'
import { type ICard } from '~/models/Deck'

import Image from 'next/image'
import TimerTitle from '~/components/Layout/TimerScreen'
import useTranslation from 'next-translate/useTranslation'

export default function Results() {
  const { socket, gameState, isCurrentUserLeader } = useGameContext()
  const { t } = useTranslation('game')

  const handleGoToNextRound = () => {
    socket?.emit('game:admCommand', 'next_round')
  }

  const lastRoundResults = gameState.lastRound

  const winner = lastRoundResults?.winner

  const lastRoundQuestionCard = lastRoundResults?.questionCard as ICard
  const lastRoundWinnerAnswers = lastRoundResults?.answerCards[winner?.id || '']

  const time = 10 || gameState.config.time // 10 seconds on the screen before going to the next round

  if (!gameState.lastRound) {
    return (
      <Layout>
        <InGameLayout>
          <div>Loading</div>
        </InGameLayout>
      </Layout>
    )
  }

  const resultCardAnswer =
    lastRoundWinnerAnswers?.map((card) => card.text) || []

  return (
    <InGameLayout>
      <TimerTitle
        key="roundWinner"
        subtitle={t('i-round-winner')}
        time={time}
      />
      <div className="bg-destaque-mobile flex flex-1 flex-col py-2 text-accent md:mx-4">
        <div className="flex flex-1 items-center ">
          <div className="flex flex-1 flex-col items-center gap-3">
            <Image
              src={winner?.pictureUrl || ''}
              alt={winner?.username || ''}
              width={100}
              height={100}
              className="rounded-full border-4  border-white"
            />
            <h1 className="text-xl font-bold">{winner?.username}</h1>
            <div className="mx-5 flex  flex-1 flex-col items-center gap-10 lg:flex-row">
              <div className="chat chat-end ">
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
                    question={lastRoundQuestionCard.text}
                    answers={resultCardAnswer}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {isCurrentUserLeader && (
        <div className="flex items-center justify-center px-4 py-2">
          <button className="btn flex-1" onClick={handleGoToNextRound}>
            {t('i-next-round')}
          </button>
        </div>
      )}
    </InGameLayout>
  )
}
