import { useGameContext } from '~/components/GameContext'
import router from 'next/router'
import Layout from '~/components/Layout/Layout'

import InGameLayout from '~/components/Layout/InGameLayout'
import GameCard, { GameCardResult } from '~/components/Atoms/GameCard'
import { ICard, ICardAnswer } from '~/models/Deck'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { CountdownCircleTimer } from 'react-countdown-circle-timer'
import Image from 'next/image'
import TimerTitle from '~/components/Layout/TimerScreen'

export default function Results() {
  const { socket, gameState, isCurrentUserLeader } = useGameContext()

  const handleGoToNextRound = () => {
    socket?.emit('game:admCommand', 'next_round')
  }

  const lastRoundResults = gameState.lastRound

  const winner = lastRoundResults?.winner

  const lastRoundQuestionCard = lastRoundResults?.questionCard as ICard
  const lastRoundWinnerAnswers = lastRoundResults?.answerCards[winner?.id || '']

  const time = 10 // 10 seconds on the screen before going to the next round

  // const [timerId, setTimerId] = useState<ReturnType<typeof setTimeout> | null>(
  //   null
  // )

  // Cleanup function to clear the timer when the component unmounts
  // useEffect(() => {
  //   return () => {
  //     if (timerId !== null) {
  //       clearTimeout(timerId)
  //     }
  //   }
  // }, [timerId])

  // const startTimer = () => {
  //   // Clear the old timer if it exists
  //   if (timerId !== null) {
  //     clearTimeout(timerId)
  //   }

  //   // Convert the time to milliseconds
  //   const timeout = time * 1000

  //   const id = setTimeout(() => {
  //     handleGoToNextRound()
  //   }, timeout)

  //   // Store the timer id so it can be cleared later
  //   setTimerId(id)
  // }

  // Start the timer when the component mounts or time changes
  // useEffect(() => {
  //   startTimer()
  // }, [time])

  // function handleStartNewGame(){

  function handleTimeout() {
    handleGoToNextRound()
  }

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
        subtitle="Round winner!"
        time={time}
        handleTimeout={handleTimeout}
      />
      <div className="bg-destaque-mobile flex flex-1 flex-col py-2 md:mx-4">
        <div className="flex flex-1 items-center ">
          <div className="flex flex-1 flex-col items-center gap-3">
            <Image
              src={winner?.pictureUrl || ''}
              alt={winner?.username || ''}
              width={100}
              height={100}
              className="rounded-full border-4 border-neutral dark:border-white"
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
                <div className="chat-bubble bg-gray-200 text-gray-800 dark:bg-neutral dark:text-gray-200">
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
            Next Round
          </button>
        </div>
      )}
    </InGameLayout>
  )
}
