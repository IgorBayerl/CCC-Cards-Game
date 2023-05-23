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
import { ICard, ICardAnswer } from '~/models/Deck'
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
    selectedGroup: {
      border: `2px solid ${theme.colors.blue[6]}`, // Adjust the color and border thickness as you need
    },
  }
})

interface IUpdateResultCards {
  hasNext: boolean
  cards: { [playerId: string]: ICardAnswer[] }
}

export default function End() {
  const {
    myHand,
    socket,
    gameState,
    startingState,
    playerSelectCards,
    isCurrentUserJudge,
  } = useGameContext()
  const myCards = myHand.cards

  const { players } = gameState
  // find the player with the highest score

  const winner = players.reduce(
    (prev, current) => (prev.score > current.score ? prev : current),
    { score: -Infinity, username: 'No players' }
  )

  const { classes } = useStyles()

  function handleStartNewGame() {
    // TODO: implement this
    // socket?.emit('start-new-game')
  }

  return (
    <Layout>
      <InGameLayout>
        <div className={classes.gameContainer}>
          <h1>End</h1>
          {winner.username}
          <Button onClick={handleStartNewGame}>Start New Game</Button>
        </div>
      </InGameLayout>
    </Layout>
  )
}
