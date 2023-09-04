import { Client, type Room } from 'colyseus.js'
import router from 'next/router'
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from 'react'
import { toast } from 'react-toastify'
import useSound from 'use-sound'
import { type TPlayerStatus } from '~/lib/playerUtils'

import { useAudio } from './AudioContext'

import {
  type SetConfigPayload,
  type AdmCommandPayload,
  type MyRoomState,
  type Player,
  type QuestionCard,
  type RoomConfig,
  type AnswerCard,
  type RoomStatus,
  MessageType,
  type GameMessagePayloads,
} from '../../shared/types'

interface IGameContextValue {
  myId: string
  myStatus: TPlayerStatus
  gameState: MyRoomState
  roomId: string
  gameConfig: RoomConfig
  startingState: string
  isCurrentUserLeader: boolean
  isCurrentUserJudge: boolean
  joinRoom: (username: string, roomId: string, pictureUrl: string) => void
  createRoom: (username: string, pictureUrl: string) => void
  leaveRoom: () => void
  setConfig: (config: RoomConfig) => void
  admCommand: (command: AdmCommandPayload) => void
  playerSelectCards: (cards: AnswerCard[]) => void
}

interface IGameProviderProps {
  children: ReactNode
}

type SoundPage = '/lobby' | '/game' | '/judging' | '/results' | '/end'

const defaultGameConfig: RoomConfig = {
  availableDecks: [],
  scoreToWin: 8,
  roomSize: 4,
  roundTime: 60,
}

const initialGameState: MyRoomState = {
  config: defaultGameConfig,
  players: new Map<string, Player>(),
  rounds: [],
  roomStatus: 'waiting',
  judge: '',
  isJudgeSelected: false,
  currentQuestionCard: {} as QuestionCard,
  isQuestionCardSelected: false,
  usedQuestionCards: [],
  usedAnswerCards: [],
  leader: '',
}

const statusToUrl: Record<RoomStatus, SoundPage> = {
  waiting: '/lobby',
  starting: '/game',
  playing: '/game',
  judging: '/judging',
  results: '/results',
  finished: '/end',
}

const GameContext = createContext<IGameContextValue>({
  myId: '',
  myStatus: 'pending',
  gameState: initialGameState,
  roomId: '',
  gameConfig: defaultGameConfig,
  startingState: '',
  isCurrentUserLeader: false,
  isCurrentUserJudge: false,
  joinRoom: () => undefined,
  createRoom: () => undefined,
  leaveRoom: () => undefined,
  setConfig: () => undefined,
  admCommand: (_) => undefined,
  playerSelectCards: (_) => undefined,
})

const useGameContext = () => useContext(GameContext)

// Initialize the Colyseus client
const client = new Client('ws://localhost:2567')

const GameProvider: React.FC<IGameProviderProps> = ({ children }) => {
  // const { socket } = useSocketContext()
  const [gameState, setGameState] = useState(initialGameState)
  const [startingState, setStartingState] = useState('')
  const { isMuted } = useAudio()

  const [room, setRoom] = useState<Room | null>(null)

  const myId = room?.sessionId || ''
  const roomId = room?.id || ''

  const audioConfig = {
    volume: 0.5,
  }

  const [playTumDum] = useSound('/sounds/tundom_down.mp3', audioConfig)
  const [playPartyHorn] = useSound('/sounds/party-horn.mp3', audioConfig)
  const [playNewRound] = useSound('/sounds/tudududum_up.mp3', audioConfig)
  const [playEnterLobby] = useSound('/sounds/tudududum_up_3.mp3', audioConfig)

  const soundsPerPage = useMemo(
    () => ({
      '/lobby': playEnterLobby,
      '/game': playNewRound,
      '/judging': playTumDum,
      '/results': playTumDum,
      '/end': playPartyHorn,
    }),
    [playEnterLobby, playNewRound, playTumDum, playPartyHorn]
  )

  //playSound to useCallback
  const playSound = useCallback(
    (url: SoundPage) => {
      if (isMuted) return
      setTimeout(() => {
        soundsPerPage[url]?.()
      }, 500)
    },
    [isMuted, soundsPerPage]
  )

  const handleChangeState = useCallback(
    (newState: MyRoomState) => {
      console.log('game:updateState', newState)

      const newPath = statusToUrl[newState.roomStatus]
      if (newPath && router.pathname !== newPath) {
        void playSound(newPath)
        void router.push(newPath)
      }

      setGameState({ ...newState })
    },
    [playSound]
  )

  const handleNotify = (message: string) => {
    toast.info(message)
  }

  const handleError = (errorMessage: string) => {
    console.error('SERVER:', errorMessage)
    toast.error(`Error: ${errorMessage}`)
  }

  const handleDisconnect = () => {
    toast.error('You have been disconnected from the server.')
    setGameState({ ...initialGameState })
    void router.push('/')
  }

  function sendToRoom<T extends MessageType>(
    type: T,
    payload: GameMessagePayloads[T]
  ) {
    if (!room) {
      console.error('Attempted to send message without an active room')
      return
    }

    room.send(type, payload)
  }

  const joinRoom = async (
    username: string,
    roomId: string,
    pictureUrl: string
  ) => {
    console.log('JOINING ROOM', roomId)
    const room = await client.joinById(roomId, {
      username,
      pictureUrl,
    })
    setRoom(room)
    // setRoomId(room.id)
  }

  const createRoom = async (username: string, pictureUrl: string) => {
    console.log('CREATING ROOM')
    try {
      const room = await client.create('my_room', {
        username,
        pictureUrl,
      })
      setRoom(room)
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
      toast.error('Error creating room: ' + error.message)
      console.error(error)
    }
  }

  const leaveRoom = () => {
    void room?.leave()
    setGameState({ ...initialGameState })
  }

  const setConfig = (config: SetConfigPayload) => {
    console.log('game:setConfig', config)
    console.log('AAAA >> game:setConfig', JSON.stringify(config))
    setGameState((prevState) => ({
      ...prevState,
      config,
    }))

    // room?.send('game:setConfig', config)
    sendToRoom(MessageType.SET_CONFIG, config)
  }

  const admCommand = (command: AdmCommandPayload) => {
    // Send an adm command message to the server -> example command: "start" || "kick" || "start-new-game"
    console.log('sending adm command:', command)
    sendToRoom(MessageType.ADM_COMMAND, command)
  }

  // Player Actions
  const playerSelectCards = (cards: AnswerCard[]) => {
    // Ensure that the `socket` is connected before emitting the event.
    // if (!socket) return

    // Emit the event to the server.
    console.log('game:playerSelection', cards)
    // socket.emit('game:playerSelection', cards)
  }

  const gameConfig = gameState.config

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const player = gameState.players.get(myId)

  useEffect(() => {
    console.log('room Updated')
    if (room) {
      room.onMessage('room:joinedRoom', (roomId: string) => {
        console.log('a room:joinedRoom', roomId)
        localStorage.setItem('oldSocketId', roomId || '')
      })

      room.onMessage('game:error', handleError)
      room.onMessage('game:notify', handleNotify)

      room.onStateChange(handleChangeState)

      return () => room && room.removeAllListeners()
    }
  }, [room, handleChangeState])

  const value = {
    myId: myId,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    myStatus: player?.status || 'none',
    // myStatus: gameState.players[myId]?.status || 'none',
    gameState,
    roomId,
    gameConfig,
    startingState,
    isCurrentUserLeader: gameState.leader === myId,
    isCurrentUserJudge: gameState.judge === myId,
    joinRoom,
    createRoom,
    leaveRoom,
    setConfig,
    admCommand,
    playerSelectCards,
  }

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

export { useGameContext, GameProvider }
