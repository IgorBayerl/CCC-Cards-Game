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

export default function Judging() {
  const {
    myHand,
    socket,
    gameState,
    startingState,
    playerSelectCards,
    isCurrentUserJudge,
  } = useGameContext()
  const myCards = myHand.cards

  const { currentQuestionCard } = gameState
  const { classes } = useStyles()

  const [resultCards, setResultCards] = useState<IUpdateResultCards>({
    hasNext: false,
    cards: {},
  })
  const [selectedGroup, setSelectedGroup] = useState<{
    playerId: string
    cards: ICardAnswer[]
  } | null>(null)
  const [seeAllResults, setSeeAllResults] = useState(false)

  const hasNext = resultCards.hasNext
  const cards = resultCards.cards
  const lastCards = Object.values(cards).pop()

  const seeGoToAllResultsBtn = !hasNext && !seeAllResults
  const seeNextBtn = hasNext && !seeAllResults
  const seeIndividualResults = !seeAllResults
  const seeConfirmBtn = seeAllResults
  const enableConfirmBtn = selectedGroup !== null

  useEffect(() => {
    socket?.on('game:updateResultCards', (resultCards: IUpdateResultCards) => {
      console.log('game:updateResultCards', resultCards)
      // setResultCards(updatedCards)
      setResultCards(resultCards)
    })

    return () => {
      socket?.off('game:updateResultCards')
    }
  }, [socket])

  const handleGroupClick = (playerId: string, group: ICardAnswer[]) => {
    setSelectedGroup({ playerId, cards: group })
  }

  const sendDecision = () => {
    if (selectedGroup) {
      socket?.emit('game:judgeDecision', selectedGroup)
      setSelectedGroup(null)
    } else {
      toast.error('You must select a group of cards')
    }
  }
  const handleConfirm = () => {
    if (selectedGroup) {
      console.log(
        'Confirming selection of group:',
        selectedGroup.cards,
        'from player:',
        selectedGroup.playerId
      )
      toast.success(`${selectedGroup.playerId} Wins`)
      sendDecision()
      setSelectedGroup(null) // Clear the selection
    } else {
      toast.error('You must select a group of cards')
    }
  }

  const handleNextCard = () => {
    console.log('>> next card')
    socket?.emit('game:requestNextCard')
  }

  const handleSeeResults = () => {
    setSeeAllResults(true)
    console.log('>> see results')
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
            {/* {JSON.stringify(selectedGroup)} */}
            {/* {JSON.stringify(resultCards)} */}
            {seeIndividualResults &&
              lastCards?.map((card) => (
                <div key={card.id} className={classes.playerCards}>
                  <GameCard cardInfo={card} selected={false} />
                </div>
              ))}

            <div className="flex  gap-3">
              {
                // all results
                seeAllResults &&
                  Object.entries(cards).map(([playerId, cardList]) => (
                    <div
                      key={playerId}
                      className={`flex flex-col gap-5  ${
                        selectedGroup && selectedGroup.playerId === playerId
                          ? classes.selectedGroup
                          : ''
                      }`}
                      onClick={() => handleGroupClick(playerId, cardList)}
                    >
                      {cardList.map((card) => (
                        <div key={card.id} className={classes.playerCards}>
                          <GameCard cardInfo={card} selected={false} />
                        </div>
                      ))}
                    </div>
                  ))
              }
            </div>
          </div>
          {isCurrentUserJudge && (
            <div className={classes.confirmButton}>
              <Button onClick={handleNextCard}>Next</Button>
              {seeGoToAllResultsBtn && (
                <Button
                  onClick={handleSeeResults}
                  variant="outline"
                  color="teal"
                  leftIcon={
                    <ActionIcon variant="outline" color="teal" radius="xl">
                      🏆
                    </ActionIcon>
                  }
                >
                  See all results
                </Button>
              )}
              {seeNextBtn && <Button onClick={handleNextCard}>Next</Button>}
              {seeConfirmBtn && (
                <Button disabled={!enableConfirmBtn} onClick={handleConfirm}>
                  Confirm
                </Button>
              )}
            </div>
          )}
        </div>
      </InGameLayout>
    </Layout>
  )
}
