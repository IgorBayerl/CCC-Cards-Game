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
    playerSelectCards,
  } = useGameContext()
  const myCards = myHand.cards

  const [selectedCards, setSelectedCards] = useState<Array<ICard>>([])

  const { currentQuestionCard } = gameState
  const { classes } = useStyles()

  const handleCardClick = (card: ICard) => {
    if (selectedCards.includes(card)) {
      setSelectedCards(selectedCards.filter((c) => c !== card))
    } else if (
      gameState.currentQuestionCard &&
      selectedCards.length < gameState.currentQuestionCard.spaces
    ) {
      setSelectedCards([...selectedCards, card])
    }
  }

  const handleConfirm = () => {
    if (selectedCards.length === gameState.currentQuestionCard?.spaces) {
      playerSelectCards(selectedCards)
      toast.success('Cards selected')
      return
    }

    toast.error('You must select the correct number of cards')
  }

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
            <div className={classes.questionContainer}>
              {currentQuestionCard && (
                <GameCard cardInfo={currentQuestionCard} selected={false} />
              )}
            </div>
            {/* <div className="bg-red-200">{JSON.stringify(selectedCards)}</div> */}
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
              <Button onClick={handleConfirm}>Confirm</Button>
            </div>
          )}
        </div>
      </InGameLayout>
    </Layout>
  )
}

