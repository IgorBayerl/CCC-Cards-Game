import { useGameContext } from '~/components/GameContext'
import Loading from '~/components/Atoms/Loading'
import PlayersList from '~/components/PlayersList'
import { useEffect } from 'react'
import router from 'next/router'
import Layout from '~/components/Layout/Layout'
import { CopyToClipboard } from '~/components/Atoms/CopyToClipboard'
import { useQuery } from 'react-query'
import { getDecks } from '~/api/deck'
import CheckBoxCard from '~/components/Atoms/CheckBoxCard'
import { type IDeckConfigScreen } from '~/models/Deck'
import ContainerHeader from '~/components/Layout/ContainerHeader'
import ContainerFooter from '~/components/Layout/ContainerFooter'
import { toast } from 'react-toastify'
import useSound from 'use-sound'
import { useAudio } from '~/components/AudioContext'

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
  // TODO: change this to a getStaticProps with revalidate of 1 hour
  const decksResponse = useQuery('get-decks', getDecks)

  const [playSwitchOn] = useSound('/sounds/switch-on.mp3')
  const [playSwitchOff] = useSound('/sounds/switch-off.mp3')
  const { isMuted } = useAudio()

  const handleLeaveRoom = () => {
    void router.push('/')
    leaveRoom()
  }

  useEffect(() => {
    if (!roomId) handleLeaveRoom()
  }, [roomId])

  const handleChangeRoomSize = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
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

    if (!isMuted) checked ? playSwitchOn() : playSwitchOff()

    let newSelectedDecksIds
    if (checked) {
      newSelectedDecksIds = [...gameConfig.decks, id]
    } else {
      newSelectedDecksIds = gameConfig.decks.filter((deckId) => deckId !== id)
    }
    setConfig({ ...gameConfig, decks: newSelectedDecksIds })
  }

  const handleStartGame = () => {
    //verify if there are enough players
    if (gameState.players.length < 3) {
      toast.error('You need at least 3 players to start the game, sorry!')
      return
    }

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
      <div className="flex flex-col gap-3 dark:border-gray-600 md:rounded-xl md:border-4 md:px-5 md:py-2 2xl:mx-auto">
        <ContainerHeader />
        <div className="flex flex-col sm:flex-row">
          <div className="flex min-w-fit flex-col gap-5">
            <select
              className="select"
              disabled={!isCurrentUserLeader}
              value={roomSize}
              onChange={handleChangeRoomSize}
            >
              {Array.from({ length: 17 }, (_, i) => i + 4).map((i) => (
                <option
                  className="text-lg"
                  key={i}
                  value={i.toString()}
                >{`${i} Players`}</option>
              ))}
            </select>
            <PlayersList
              players={gameState.players}
              leader={gameState.leader}
              roomSize={gameConfig.roomSize}
            />
          </div>
          <div className="">
            <div>
              <div defaultValue="decks">
                <div className="tabs">
                  <a className="tab-lifted tab">Decks Selection</a>
                  <a className="tab-lifted tab tab-active">Settings</a>
                  <a className="tab-lifted tab">Tab 3</a>
                </div>

                <div value="decks">
                  <div className="grid max-h-[65vh] grid-cols-1 items-stretch gap-2  p-3 md:grid-cols-2 lg:grid-cols-4">
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
                </div>
                <div value="settings">
                  <div className="flex flex-col items-center">
                    <div className="px-4 py-2 text-center">Score to win</div>
                    <select
                      className="select w-full max-w-xs"
                      onChange={(e) => handleChangeScoreToWin(e.target.value)}
                      disabled={!isCurrentUserLeader}
                      value={scoreToWin}
                    >
                      {Array.from({ length: 27 }, (_, i) => i + 4).map((i) => (
                        <option value={i.toString()}>{`${i} Points`}</option>
                      ))}
                    </select>
                    <div className="px-4 py-2 text-center">Time</div>

                    <select
                      className="select w-full max-w-xs"
                      onChange={(e) => handleChangeTimeToPlay(e.target.value)}
                      disabled={!isCurrentUserLeader}
                      value={timeToPlay}
                    >
                      {Array.from({ length: 6 }, (_, i) => (i + 1) * 10).map(
                        (i) => (
                          <option value={i.toString()}>{`${i} Seconds`}</option>
                        )
                      )}
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-evenly">
                {isCurrentUserLeader && (
                  <>
                    <CopyToClipboard text="Invite" content={roomInviteLink} />
                    <button
                      className="btn"
                      disabled={!isCurrentUserLeader}
                      onClick={handleStartGame}
                    >
                      Start Game
                    </button>
                  </>
                )}
                {!isCurrentUserLeader && (
                  <>
                    <div>Loading... </div> Waiting for the host to setup and
                    start the game.
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
