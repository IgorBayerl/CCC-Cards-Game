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
import TimerScreen from '~/components/Layout/TimerScreen'

const useStyles = createStyles((theme) => {
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
  const { myHand, socket, gameState, isCurrentUserJudge } = useGameContext()

  const { currentQuestionCard } = gameState
  const { classes } = useStyles()

  const [timerId, setTimerId] = useState<ReturnType<typeof setTimeout> | null>(
    null
  )

  const [resultCards, setResultCards] = useState<IUpdateResultCards>({
    hasNext: true,
    cards: {},
  })
  const [selectedGroup, setSelectedGroup] = useState<{
    playerId: string
    cards: ICardAnswer[]
  } | null>(null)
  const [seeAllResults, setSeeAllResults] = useState(false)

  const [resetKey, setResetKey] = useState(0)

  const hasNext = resultCards.hasNext === true
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
      setResetKey((prevKey) => prevKey + 1)
      setResultCards(resultCards)
    })

    socket?.on('game:showAllCards', (resultCards: IUpdateResultCards) => {
      console.log('game:showAllCards', resultCards)
      setResetKey((prevKey) => prevKey + 1)
      setSeeAllResults(true)
      setResultCards(resultCards)
    })
    return () => {
      socket?.off('game:updateResultCards')
      socket?.off('game:showAllCards')
    }
  }, [socket])

  const handleGroupClick = (playerId: string, group: ICardAnswer[]) => {
    if (!isCurrentUserJudge) return
    setSelectedGroup({ playerId, cards: group })
  }

  const sendDecision = () => {
    if (selectedGroup) {
      socket?.emit('game:judgeDecision', selectedGroup.playerId)
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
    socket?.emit('game:seeAllRoundAnswers')
    console.log('>> see results')
  }
  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     handleTimerTimeout()
  //   }, 10000)
  //   setTimerId(timer)
  //   return () => {
  //     void clearTimeout(timer)
  //   }
  // }, [])

  useEffect(() => {
    return () => {
      if (timerId !== null) {
        clearTimeout(timerId)
      }
    }
  }, [timerId])

  const handleTimerTimeout = () => {
    if (!isCurrentUserJudge) return
    if (seeNextBtn) {
      handleNextCard()
      return
    }

    if (seeGoToAllResultsBtn) {
      handleSeeResults()
      return
    }
    if (seeConfirmBtn) {
      // TODO: select a random group
      resultCards.cards
      const randomPlayerId = Object.keys(resultCards.cards)[0]! //BUG: not that random
      const randomGroup = resultCards.cards[randomPlayerId]!
      handleGroupClick(randomPlayerId, randomGroup)

      // TODO: wait for a second and then confirm
      // setTimeout(() => {
      handleConfirm() //BUG: this is throwing the you must select a group error, but it is selecting a group
      // }, 1000)
    }
  }

  const time = 10 // 10 seconds

  // TODO: add a timer
  // TODO: change the layout to look more like a chat than a card game
  return (
    <Layout>
      <InGameLayout>
        <TimerScreen
          subtitle="Judging"
          time={time}
          handleTimeout={handleTimerTimeout}
        >
          <div className={classes.gameContainer}>
            <div className={classes.cardContainer}>
              <div className={classes.questionContainer}>
                {currentQuestionCard && (
                  <>
                    <GameCard cardInfo={currentQuestionCard} selected={false} />
                    {/* <GameCardResult
                    // TODO: make it show the selected card when the judge is deciding 
                      question={currentQuestionCard.text}
                      answers={lastCards?.map((card) => card.text) || []}
                    /> */}
                  </>
                )}
              </div>

              {seeIndividualResults &&
                lastCards?.map((card, index) => (
                  <div key={index} className={classes.playerCards}>
                    <GameCard cardInfo={card} selected={false} />
                  </div>
                ))}

              <div className="flex justify-center gap-3">
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
                        {cardList.map((card, index) => (
                          <div key={index} className={classes.playerCards}>
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
        </TimerScreen>
      </InGameLayout>
    </Layout>
  )
}
