import { useGameContext } from '~/components/GameContext'
import Layout from '~/components/Layout/Layout'

import InGameLayout from '~/components/Layout/InGameLayout'
import { GameCardResult } from '~/components/Atoms/GameCard'

import Image from 'next/image'
import TimerTitle from '~/components/Layout/TimerScreen'
import useTranslation from 'next-translate/useTranslation'
import { type AnswerCardCollection, type Round } from '@ccc-cards-game/types'

export default function MockResults() {
  const { t } = useTranslation('*')

  const lastRound: Round = {
    winner: '3',
    questionCard: {
      text: 'qaaaen ___ gekreuzt ___ gekreuzt',
      spaces: 2,
      id: 'batata'
    },
    answerCards: new Map<string, AnswerCardCollection>([
      ['1', { cards: [{ id: '1a', text: 'Singing in the shower' }, { id: '1b', text: 'Singing in the shower' }] }], 
      ['2', { cards: [{ id: '2a', text: 'Juggling apples' }, { id: '2b', text: 'Juggling apples' }] }], 
      ['3', { cards: [{ id: '3a', text: 'Singing apples' }, { id: '3b', text: 'apples apples' }] }], 
    ]),
    judge: '',
    revealedCards: [],
    currentRevealedId: '',
    allCardsRevealed: false
  }

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

  const isCurrentUserLeader = false

  const winnerId = lastRound.winner
  const winner = {
    username: 'winner',
    pictureUrl: 'https://avatars.githubusercontent.com/u/52197833?v=4',
  }
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
    <>
      <TimerTitle key="roundWinner" title='round winner' time={time} />
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
              <div className="chat-bubble bg-neutral text-gray-200">
                <GameCardResult question={questionCard.text} answers={winnerAnswersText} />
              </div>
            </div>
          </div>
        </div>
      </div>
      {isCurrentUserLeader && (
        <div className="flex items-center justify-center px-4 py-2">
          <button className="btn flex-1">
            {t('i-next-round')}
          </button>
        </div>
      )}
    </>
  )
}
