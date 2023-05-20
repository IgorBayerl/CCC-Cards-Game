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
import { useEffect, useState } from 'react'
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

export default function Judging() {
  const { myHand, socket, gameState, startingState, playerSelectCards } =
    useGameContext()
  const myCards = myHand.cards

  const { currentQuestionCard } = gameState
  const { classes } = useStyles()

  useEffect(() => {
    socket?.on('game:updateCards', (updatedCards) => {
      console.log('game:updateCards', updatedCards)
      // setCards(updatedCards)
    })
    socket?.on('game:allCards', (nextCard) => {
      console.log('game:allCards', nextCard)
    })
    return () => {
      socket?.off('game:updateCards')
      socket?.off('game:allCards')
    }
  }, [socket])

  const handleConfirm = () => {
    console.log('confirming')
    // if (selectedCards.length === gameState.currentQuestionCard?.spaces) {
    //   playerSelectCards(selectedCards)
    //   toast.success('Cards selected')
    //   return
    // }

    // toast.error('You must select the correct number of cards')
  }

  const handleNextCard = () => {
    console.log('>> next card')
    socket?.emit('game:requestNextCard')
  }

  if (gameState.status === 'starting') {
    return (
      <Layout>
        <h1 className={classes.startingMessage}>{startingState}</h1>
      </Layout>
    )
  }

  // TODO: add a timer
  // TODO: change the layout to look more like a chat than a card game
  return (
    <Layout>
      <InGameLayout>
        <div className={classes.gameContainer}>
          <h1>Judging</h1>
          <div className={classes.cardContainer}>
            <div className={classes.questionContainer}>
              {currentQuestionCard && (
                <GameCard cardInfo={currentQuestionCard} selected={false} />
              )}
            </div>

            {/* TODO: add a visualization with each card */}
          </div>

          <div className={classes.confirmButton}>
            <Button onClick={handleConfirm}>Confirm</Button>
            <Button onClick={handleNextCard}>Next</Button>
          </div>
        </div>
      </InGameLayout>
    </Layout>
  )
}
