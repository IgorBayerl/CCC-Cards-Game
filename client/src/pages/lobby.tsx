import { useGameContext } from '~/components/GameContext'
import Loading from '~/components/Atoms/Loading'
import PlayersList from '~/components/PlayersList'
import { useEffect } from 'react'
import router from 'next/router'
import Layout from '~/components/Atoms/Layout'
import { ActionIcon, Button, Select } from '@mantine/core'
import { IconArrowBack, IconVolume, IconVolumeOff } from '@tabler/icons-react'
import { CopyToClipboard } from '~/components/Atoms/CopyToClipboard'
import { useQuery } from 'react-query'
import { getDecks } from '~/api/deck'
import CheckBoxCard from '~/components/Atoms/CheckBoxCard'
import { type IDeckConfigScreen } from '~/models/Deck'

export default function LobbyPage() {
  const {
    roomId,
    gameState,
    isCurrentUserLeader,
    gameConfig,
    leaveRoom,
    setConfig,
    admCommand,
  } = useGameContext()

  const decksResponse = useQuery('get-decks', getDecks)

  const handleLeaveRoom = () => {
    void router.push('/')
    leaveRoom()
  }

  useEffect(() => {
    if (!roomId) handleLeaveRoom()
  }, [roomId])

  const handleChangeRoomSize = (value: string) => {
    const newSize = parseInt(value)
    setConfig({ ...gameConfig, roomSize: newSize })
  }

  const handleChangeScoreToWin = (value: string) => {
    const newScoreToWin = parseInt(value)
    setConfig({ ...gameConfig, scoreToWin: newScoreToWin })
  }

  const handleChangeTimeToPlay = (value: string) => {
    const newTimeToPlay = parseInt(value)
    setConfig({ ...gameConfig, time: newTimeToPlay })
  }

  const handleChangeSelectedCards = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { checked, id } = event.target

    let newSelectedDecksIds
    if (checked) {
      newSelectedDecksIds = [...gameConfig.decks, id]
    } else {
      newSelectedDecksIds = gameConfig.decks.filter((deckId) => deckId !== id)
    }
    setConfig({ ...gameConfig, decks: newSelectedDecksIds })
  }

  const handleStartGame = () => {
    admCommand('start')
  }

  if (!roomId || decksResponse.isLoading) {
    return <Loading />
  }

  if (decksResponse.isError || !decksResponse.data) {
    return <div>Something went wrong!</div>
  }

  const decks = decksResponse.data

  const roomInviteLink = `${window.location.origin}/?roomId=${roomId}`

  const roomSize = gameConfig?.roomSize?.toString() || '4'
  const scoreToWin = gameConfig?.scoreToWin?.toString() || '10'
  const timeToPlay = gameConfig?.time?.toString() || '60'

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
        <div className="flex flex-col border sm:flex-row">
          <div className="min-w-fit  bg-blue-700  ">
            <Select
              allowDeselect={false}
              value={roomSize}
              onChange={handleChangeRoomSize}
              disabled={!isCurrentUserLeader}
              data={Array.from({ length: 17 }, (_, i) => i + 4).map((i) => ({
                value: i.toString(),
                label: `${i} Players`,
              }))}
            />
            <PlayersList
              players={gameState.players}
              leader={gameState.leader}
              roomSize={gameConfig.roomSize}
            />
          </div>
          <div className="bg-green-600">
            <div className="flex items-center">
              <div className="px-4 py-2 text-center">Score to win</div>
              <Select
                allowDeselect={false}
                value={scoreToWin}
                onChange={handleChangeScoreToWin}
                disabled={!isCurrentUserLeader}
                data={Array.from({ length: 27 }, (_, i) => i + 4).map((i) => ({
                  value: i.toString(),
                  label: `${i} Points`,
                }))}
              />
              <div className="px-4 py-2 text-center">Time</div>
              <Select
                allowDeselect={false}
                value={timeToPlay}
                onChange={handleChangeTimeToPlay}
                disabled={!isCurrentUserLeader}
                data={Array.from({ length: 10 }, (_, i) => (i + 3) * 10).map(
                  (i) => ({
                    value: i.toString(),
                    label: `${i} Seconds`,
                  })
                )}
              />
              {/* <div>Score to win: {gameConfig.scoreToWin}</div> */}
            </div>
            <div>
              {/* <h1>Decks</h1> */}
              {/* <p>Choose the decks you want to play with</p> */}
              <div className="grid max-h-[65vh] grid-cols-1 items-stretch gap-2 overflow-y-scroll bg-yellow-400 p-3 md:grid-cols-2 lg:grid-cols-4">
                {decks.length === 0 && (
                  <div className="text-center">No decks found</div>
                )}
                {decks.map((deck: IDeckConfigScreen) => (
                  <CheckBoxCard
                    key={deck.id}
                    id={deck.id}
                    disabled={!isCurrentUserLeader}
                    selected={gameConfig.decks.includes(deck.id)}
                    onChange={handleChangeSelectedCards}
                  >
                    <div>{deck.language}</div>
                    <h1 className="my-0">{deck.name}</h1>
                    <p>{deck.description}</p>
                  </CheckBoxCard>
                ))}
              </div>
              <div className="flex items-center justify-evenly">
                <CopyToClipboard text="Invite" content={roomInviteLink} />
                <Button
                  disabled={!isCurrentUserLeader}
                  onClick={handleStartGame}
                >
                  Start Game
                </Button>
              </div>
            </div>
          </div>
        </div>
        <div>Footer</div>
      </div>
    </Layout>
  )
}
