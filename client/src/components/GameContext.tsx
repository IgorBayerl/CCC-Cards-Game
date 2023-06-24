import router from 'next/router'
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react'
import { toast } from 'react-toastify'
import { type Socket } from 'socket.io-client'
import useSound from 'use-sound'
import { useSocketContext } from '~/components/SocketContext'
import { TPlayerStatus } from '~/lib/playerUtils'
import {
  ICard,
  ICardAnswer,
  ICardQuestion,
  IDeckConfigScreen,
} from '~/models/Deck'
import { useAudio } from './AudioContext'

interface IGameContextValue {
  myId: string
  myStatus: TPlayerStatus
  myHand: IMyHand
  gameState: IGameState
  roomId: string
  socket: Socket | undefined
  gameConfig: IGameConfig
  startingState: string
  isCurrentUserLeader: boolean
  isCurrentUserJudge: boolean
  joinRoom: (username: string, roomId: string, pictureUrl: string) => void
  leaveRoom: () => void
  setConfig: (config: IGameConfig) => void
  admCommand: (command: AdmCommand) => void
  playerSelectCards: (cards: ICardAnswer[]) => void
}

type AdmCommand =
  | 'start'
  | 'next_round'
  | 'end'
  | 'start-new-game'
  | 'back-to-lobby'

interface IGameConfig {
  decks: IDeckConfigScreen[]
  scoreToWin: number
  roomSize: number
  time: number
}

interface IGameProviderProps {
  children: ReactNode
}

type TRoomStatus =
  | 'waiting'
  | 'starting'
  | 'playing'
  | 'judging'
  | 'results'
  | 'finished'

type PlayFunction = () => void
export interface IGameState {
  players: IPlayer[]
  leader: IPlayer
  status: TRoomStatus
  judge: IPlayer | null
  currentQuestionCard: ICardQuestion | null
  lastRound: IGameRound | null
  config: IGameConfig
  rounds?: IGameRound[]
}

export interface IGameRound {
  questionCard: ICardQuestion
  answerCards: { [playerId: string]: ICardAnswer[] }
  judge: IPlayer
  winner: IPlayer | null
  currentJudgedPlayerIndex: number
}

export interface IPlayer {
  id: string
  username: string
  pictureUrl: string
  roundRole: 'player' | 'judge'
  score: number
  status: TPlayerStatus
  isOffline: boolean
}

interface ISocketError {
  message: string
  error: Error
}

const defaultGameConfig: IGameConfig = {
  decks: [],
  scoreToWin: 8,
  roomSize: 4,
  time: 60,
}

const initialGameState: IGameState = {
  players: [],
  leader: {
    id: '',
    username: '',
    pictureUrl: '',
    roundRole: 'player',
    score: 0,
    status: 'pending',
    isOffline: false,
  },
  judge: null,
  status: 'waiting',
  currentQuestionCard: null,
  lastRound: null,
  config: defaultGameConfig,
}

export interface IMyHand {
  cards: ICard[]
}

const initialHandState: IMyHand = {
  cards: [],
}

const statusToUrl = {
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
  myHand: initialHandState,
  gameState: initialGameState,
  roomId: '',
  socket: undefined,
  gameConfig: defaultGameConfig,
  startingState: '',
  isCurrentUserLeader: false,
  isCurrentUserJudge: false,
  joinRoom: () => undefined,
  leaveRoom: () => undefined,
  setConfig: () => undefined,
  admCommand: (_) => undefined,
  playerSelectCards: (_) => undefined,
})

const useGameContext = () => useContext(GameContext)

const GameProvider: React.FC<IGameProviderProps> = ({ children }) => {
  const { socket } = useSocketContext()
  const [gameState, setGameState] = useState(initialGameState)
  const [startingState, setStartingState] = useState('')
  const [myHand, setMyHand] = useState<IMyHand>(initialHandState)
  const [roomId, setRoomId] = useState<string>('')
  const [isCurrentUserLeader, setIsCurrentUserLeader] = useState(false)
  const [isCurrentUserJudge, setIsCurrentUserJudge] = useState(false)
  const [myId, setMyId] = useState<string>('')
  const { isMuted } = useAudio()

  const [playTumDum] = useSound('/sounds/tundom_down.mp3')
  const [playPartyHorn] = useSound('/sounds/party-horn.mp3')
  const [playNewRound] = useSound('/sounds/tudududum_up.mp3')
  const [playEnterLobby] = useSound('/sounds/tudududum_up_2.mp3')

  const soundsPerPage: Record<string, PlayFunction | undefined> = {
    '/lobby': playEnterLobby,
    '/game': playNewRound,
    '/judging': playTumDum,
    '/results': playTumDum,
    '/end': playPartyHorn,
  }

  const playSound = (url: string) => {
    // console.log('playSound', url)
    // console.log('isMuted', isMuted)
    // if (isMuted) return
    soundsPerPage[url]?.()
  }

  useEffect(() => {
    socket?.on('game:updateState', handleChangeState)

    socket?.on('room:joinedRoom', (roomId: string) => {
      setRoomId(roomId)
      localStorage.setItem('oldSocketId', socket?.id || '')
    })

    socket?.on('game:updateCards', handleUpdateCards)
    socket?.on('message:status', setStartingState)
    socket?.on('message:notify', handleNotify)

    socket?.on('game:error', handleError)
    socket?.on('room:error', handleError)

    socket?.on('disconnect', handleDisconnect)

    return () => {
      socket?.off('game:updateState')
      socket?.off('room:joinedRoom')
      socket?.off('game:updateCards')
      socket?.off('message:status')
      socket?.off('message:notify')
      socket?.off('game:error')
      socket?.off('room:error')
      socket?.off('disconnect')
    }
  }, [socket])

  useEffect(() => {
    if (!socket || !gameState.leader) return
    setIsCurrentUserLeader(gameState.leader.id === socket.id)
    setIsCurrentUserJudge(gameState.judge?.id === socket.id)
    setMyId(socket.id)
  }, [socket, gameState])

  const handleChangeState = (newState: IGameState) => {
    console.log('game:updateState', newState)

    const newPath = statusToUrl[newState.status]
    if (newPath && router.pathname !== newPath) {
      void router.push(newPath)
      void playSound(newPath)
    }

    setGameState(newState)
  }

  const handleUpdateCards = (cards: ICard[]) => {
    console.log('game:updateCards', cards)
    setMyHand((prevState) => ({
      ...prevState,
      cards,
    }))
  }

  const handleNotify = (message: string) => {
    toast.info(message)
  }

  const handleError = (socketError: ISocketError) => {
    const { message, error } = socketError
    console.log('SERVER:', message)
    console.error('SERVER:', error)
    toast.error(`Error: ${message}`)
  }

  const handleDisconnect = () => {
    toast.error('You have been disconnected from the server.')

    setRoomId('')
    setGameState(initialGameState)
    void router.push('/')
  }

  const joinRoom = (username: string, roomId: string, pictureUrl: string) => {
    const oldSocketId = localStorage.getItem('oldSocketId') || ''
    socket?.emit('room:joinRoom', {
      username,
      roomId,
      pictureUrl,
      oldSocketId: oldSocketId,
    })
  }

  const leaveRoom = () => {
    socket?.emit('room:leaveRoom')
    setRoomId('')
    setGameState(initialGameState)
  }

  const setConfig = (config: IGameConfig) => {
    console.log('game:setConfig', config)
    setGameState((prevState) => ({
      ...prevState,
      config,
    }))
    socket?.emit('game:setConfig', config)
  }

  const admCommand = (command: string) => {
    // Send an adm command message to the server -> example command: "start" || "kick" || "start-new-game"
    socket?.emit('game:admCommand', command)
  }

  // Player Actions
  const playerSelectCards = (cards: ICardAnswer[]) => {
    // Ensure that the `socket` is connected before emitting the event.
    if (!socket) return

    // Emit the event to the server.
    console.log('game:playerSelection', cards)
    socket.emit('game:playerSelection', cards)
  }

  const gameConfig = gameState.config

  const value = {
    myId,
    myStatus: gameState.players.find((p) => p.id === myId)?.status || 'none',
    myHand,
    gameState,
    roomId,
    socket,
    gameConfig,
    startingState,
    isCurrentUserLeader,
    isCurrentUserJudge,
    joinRoom,
    leaveRoom,
    setConfig,
    admCommand,
    playerSelectCards,
  }

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

export { useGameContext, GameProvider }
