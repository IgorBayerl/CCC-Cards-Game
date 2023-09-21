import { useGameContext } from '~/components/GameContext'
import Layout from '~/components/Layout/Layout'

import InGameLayout from '~/components/Layout/InGameLayout'
import { GameCardResult } from '~/components/Atoms/GameCard'

import Image from 'next/image'
import TimerTitle from '~/components/Layout/TimerScreen'
import useTranslation from 'next-translate/useTranslation'
import { MessageType } from '~/lib/shared/types'

export default function Results() {
  const { sendToRoom, gameState, isCurrentUserLeader } = useGameContext()
  const { t } = useTranslation('game')

  const handleGoToNextRound = () => {
    sendToRoom(MessageType.ADMIN_NEXT_ROUND, null)
  }

  const lastRound = gameState.rounds[gameState.rounds.length - 1]

  const time = 10 //|| gameState.config.time // 10 seconds on the screen before going to the next round

  if (!lastRound) {
    return (
      <Layout>
        <InGameLayout>
          <div>Loading</div>
        </InGameLayout>
      </Layout>
    )
  }

  const winnerId = lastRound.winner
  const winner = gameState.players.get(winnerId)
  const questionCard = lastRound.questionCard
  const winnerAnswerCollection = lastRound.answerCards?.get(winnerId)
  const winnerAnswers = winnerAnswerCollection?.cards || []

  const winnerAnswersText = winnerAnswers.map((card) => card.text)

  if (!winner || !questionCard || !winnerAnswers) {
    return (
      <Layout>
        <InGameLayout>
          <div>Error</div>
        </InGameLayout>
      </Layout>
    )
  }

  return (
    <InGameLayout>
      <TimerTitle key="roundWinner" subtitle={t('i-round-winner')} time={time} />
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
                <div className="avatar chat-image">
                  <div className="w-10 rounded-full">
                    <Image
                      src={winner.pictureUrl}
                      alt={winner.username}
                      width={100}
                      height={100}
                      className="rounded-full"
                    />
                  </div>
                </div>
                <div className="chat-bubble bg-neutral text-gray-200">
                  <GameCardResult question={questionCard.text} answers={winnerAnswersText} />
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
