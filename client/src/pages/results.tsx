import { useGameContext } from '~/components/GameContext'
import router from 'next/router'
import Layout from '~/components/Layout/Layout'
import {
  ActionIcon,
  Button,
  createStyles,
  useMantineTheme,
} from '@mantine/core'
import InGameLayout from '~/components/Layout/InGameLayout'
import GameCard, { GameCardResult } from '~/components/Atoms/GameCard'
import { ICard, ICardAnswer } from '~/models/Deck'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { CountdownCircleTimer } from 'react-countdown-circle-timer'
import Image from 'next/image'

const useStyles = createStyles((theme, _params, getRef) => {
  const { colorScheme } = useMantineTheme()

  return {
    startingMessage: {
      backgroundColor:
        theme.colorScheme === 'dark'
          ? theme.colors.red[1]
          : theme.colors.red[3],
    },
    gameContainer: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      gap: theme.spacing.md,
      borderRadius: theme.radius.md,
      position: 'relative',
    },
    cardContainer: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      flexGrow: 1,
    },
    questionContainer: {
      display: 'flex',
      justifyContent: 'center',
      marginTop: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
    },
    playerCards: {
      display: 'flex',
      justifyContent: 'center',
      gap: theme.spacing.md,
    },
    confirmButton: {
      display: 'flex',
      justifyContent: 'center',
      gap: theme.spacing.md,
    },
    questionCard: {
      backgroundColor:
        colorScheme === 'dark' ? theme.colors.red[4] : theme.colors.red[6],
      color:
        colorScheme === 'dark' ? theme.colors.dark[9] : theme.colors.gray[9],
    },
    answerCard: {
      backgroundColor:
        colorScheme === 'dark' ? theme.colors.teal[4] : theme.colors.teal[6],
      color:
        colorScheme === 'dark' ? theme.colors.dark[9] : theme.colors.gray[9],
    },
    cardSizePortrait: {
      width: 130,
      aspectRatio: '3/4',
    },
    cardSizePortraitSelected: {
      width: 200,
      aspectRatio: '3/4',
    },
    cardBorder: {
      border: `2px solid ${
        colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[4]
      }`,
    },
    selectedGroup: {
      border: `2px solid ${theme.colors.blue[6]}`, // Adjust the color and border thickness as you need
    },
  }
})

export default function Results() {
  const { socket, gameState, isCurrentUserLeader } = useGameContext()

  const handleGoToNextRound = () => {
    socket?.emit('game:admCommand', 'next_round')
  }

  const { classes } = useStyles()

  const lastRoundResults = gameState.lastRound

  const winner = lastRoundResults?.winner

  const lastRoundQuestionCard = lastRoundResults?.questionCard as ICard
  const lastRoundWinnerAnswers = lastRoundResults?.answerCards[winner?.id || '']

  const time = 10 // 10 seconds on the screen before going to the next round

  const [timerId, setTimerId] = useState<ReturnType<typeof setTimeout> | null>(
    null
  )

  // Cleanup function to clear the timer when the component unmounts
  useEffect(() => {
    return () => {
      if (timerId !== null) {
        clearTimeout(timerId)
      }
    }
  }, [timerId])

  const startTimer = () => {
    // Clear the old timer if it exists
    if (timerId !== null) {
      clearTimeout(timerId)
    }

    // Convert the time to milliseconds
    const timeout = time * 1000

    const id = setTimeout(() => {
      handleGoToNextRound()
    }, timeout)

    // Store the timer id so it can be cleared later
    setTimerId(id)
  }

  // Start the timer when the component mounts or time changes
  useEffect(() => {
    startTimer()
  }, [time])

  // function handleStartNewGame(){
  const renderTime = ({ remainingTime }: { remainingTime: number }) => {
    if (remainingTime === 0) {
      return <div className="timer">Too late!</div>
    }
    return (
      <div className="timer">
        <div className="value">{remainingTime}</div>
      </div>
    )
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
        <div className={classes.gameContainer}>
          <div className="flex flex-col items-center gap-3 ">
            <div className=" flex w-full justify-between  p-3">
              <h1>Round winner!</h1>
              <CountdownCircleTimer
                isPlaying
                size={70}
                duration={time}
                colors={['#004777', '#F7B801', '#A30000', '#A30000']}
                colorsTime={[7, 5, 2, 0]}
                onComplete={() => {
                  handleGoToNextRound()
                }}
              >
                {renderTime}
              </CountdownCircleTimer>
            </div>
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
              <div className={classes.confirmButton}>
                <Button onClick={handleGoToNextRound}>Next Round</Button>
              </div>
            )}
          </div>
        </div>
      </InGameLayout>
    </Layout>
  )
}
