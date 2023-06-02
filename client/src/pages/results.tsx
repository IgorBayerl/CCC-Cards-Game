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
import TimerScreen from '~/components/Layout/TimerScreen'

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

  return (
    <Layout>
      <InGameLayout>
        <TimerScreen
          subtitle="Round winner!"
          time={time}
          handleTimeout={handleTimeout}
        >
          <div className="">
            <div className="flex flex-col items-center gap-3 ">
              <div className="flex flex-col items-center gap-10  lg:flex-row">
                <div>
                  <div>
                    <div className="flex flex-col items-center">
                      <Image
                        src={winner?.pictureUrl || ''}
                        alt={winner?.username || ''}
                        width={100}
                        height={100}
                        className="rounded-full"
                      />
                      <h3>{winner?.username}</h3>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <GameCardResult
                    question={lastRoundQuestionCard.text}
                    answers={
                      lastRoundWinnerAnswers?.map((card) => card.text) || []
                    }
                  />
                  {/* <div className={classes.questionContainer}>
                  {<GameCard cardInfo={lastRoundQuestionCard} />}
                </div>
                <div className={classes.playerCards}>
                  {lastRoundWinnerAnswers?.map((card) => (
                    <GameCard key={card.id} cardInfo={card} />
                  ))}
                </div> */}
                </div>
              </div>
              {isCurrentUserLeader && (
                <div className="">
                  <button onClick={handleGoToNextRound}>Next Round</button>
                </div>
              )}
            </div>
          </div>
        </TimerScreen>
      </InGameLayout>
    </Layout>
  )
}
