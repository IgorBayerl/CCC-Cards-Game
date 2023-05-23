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
import GameCard from '~/components/Atoms/GameCard'
import { ICard } from '~/models/Deck'
import { useState } from 'react'
import { toast } from 'react-toastify'
import { CountdownCircleTimer } from 'react-countdown-circle-timer'
import useSound from 'use-sound'
import { useAudio } from '~/components/AudioContext'

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
  }
})

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
  const { classes } = useStyles()

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

  const time = gameState.config.time

  const renderTime = ({ remainingTime }: { remainingTime: number }) => {
    if (remainingTime === 0) {
      return <div className="timer">Too late!</div>
    }
    return (
      <div className="timer">
        <div className="value">{remainingTime}</div>
        <div className="text">seconds</div>
      </div>
    )
  }

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
    setTimeout(() => {
      playerSelectCards(finalSelectedCards)
      toast.success('Cards selected')
    }, 1000)
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
        <h1 className={classes.startingMessage}>{startingState}</h1>
      </Layout>
    )
  }

  return (
    <Layout>
      <InGameLayout>
        <div className={classes.gameContainer}>
          <div className={classes.cardContainer}>
            <CountdownCircleTimer
              isPlaying
              duration={time}
              colors={['#004777', '#F7B801', '#A30000', '#A30000']}
              colorsTime={[7, 5, 2, 0]}
              onComplete={handleTimeout}
            >
              {renderTime}
            </CountdownCircleTimer>
            <div className={classes.questionContainer}>
              {currentQuestionCard && (
                <GameCard cardInfo={currentQuestionCard} selected={false} />
              )}
            </div>
            {/* <div className="bg-red-200">{JSON.stringify(selectedCards)}</div> */}
            {isCurrentUserJudge && (
              <div className="flex justify-center">
                <h2>Just wait the other players</h2>
              </div>
            )}
            {!isCurrentUserJudge && (
              <div className={classes.playerCards}>
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
            <div className={classes.confirmButton}>
              <Button onClick={handleConfirm} disabled={!canConfirm}>
                Confirm
              </Button>
            </div>
          )}
        </div>
      </InGameLayout>
    </Layout>
  )
}

