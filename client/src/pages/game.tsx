import { useGameContext } from '~/components/GameContext'
import router from 'next/router'
import Layout from '~/components/Atoms/Layout'
import { ActionIcon, Button } from '@mantine/core'
import { IconArrowBack, IconVolume, IconVolumeOff } from '@tabler/icons-react'

export default function Game() {
  const { leaveRoom, myHand, isCurrentUserJudge, gameState, startingState } =
    useGameContext()

  const handleLeaveRoom = () => {
    void router.push('/')
    leaveRoom()
  }

  const myCards = myHand.cards
  const selectedCard = myHand.selectedCard

  if (gameState.status === 'starting') {
    return (
      <Layout>
        <h1 className="bg-red-400">{startingState}</h1>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="flex w-full flex-col bg-purple-300">
        <div className=" flex justify-between bg-red-400">
          <Button
            leftIcon={<IconArrowBack size="1rem" />}
            onClick={handleLeaveRoom}
          >
            Leave Room
          </Button>
          Logo
          <div>
            <ActionIcon variant="outline" color="blue">
              <IconVolume />
            </ActionIcon>
            <ActionIcon variant="outline" color="blue">
              <IconVolumeOff />
            </ActionIcon>
          </div>
        </div>
        <div className="flex flex-col gap-3 border bg-yellow-300 sm:flex-row">
          {/* {JSON.stringify(gameState)} */}
          {/* TODO:why tha fuck this is not working, add the players list with the judge icon to debug */}
          {isCurrentUserJudge && (
            <div>
              {myCards.map((card) => (
                <div
                  key={card.id}
                  className="rounded-lg bg-white p-3 shadow-md"
                >
                  <div>{card.id}</div>
                  <div>{card.text}</div>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col gap-3">
            <div>
              {selectedCard &&
                selectedCard.map((card) => (
                  <div
                    key={card.id}
                    className="rounded-lg bg-white p-3 shadow-md"
                  >
                    <div>{card.id}</div>
                    <div>{card.text}</div>
                  </div>
                ))}
            </div>
            <div className="flex gap-3">
              <Button>Confirm</Button>
            </div>
          </div>
        </div>
        <div>Footer</div>
      </div>
    </Layout>
  )
}
