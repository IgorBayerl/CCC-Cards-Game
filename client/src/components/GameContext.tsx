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
import { useSocketContext } from '~/components/SocketContext'
import { ICardAnswer, ICardQuestion } from '~/models/Deck'

interface IGameContextValue {
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
}

type AdmCommand = 'start' | 'next_round' | 'end'

interface IGameConfig {
  decks: string[]
  scoreToWin: number
  roomSize: number
  time: number
}

interface IGameProviderProps {
  children: ReactNode
}

type TRoomStatus = 'waiting' | 'starting' | 'playing' | 'judging' | 'finished'

interface IGameState {
  players: IPlayer[]
  leader: IPlayer
  status: TRoomStatus
  judge: IPlayer | null
  currentQuestionCard: ICardQuestion | null
  config: IGameConfig
}

export interface IPlayer {
  id: string
  username: string
  pictureUrl: string
  roundRole: 'player' | 'judge'
  score: number
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
  },
  judge: null,
  status: 'waiting',
  currentQuestionCard: null,
  config: defaultGameConfig,
}

export interface IMyHand {
  cards: ICardAnswer[]
  selectedCard: Array<ICardAnswer>
}

const initialHandState: IMyHand = {
  cards: [],
  selectedCard: [],
}

const GameContext = createContext<IGameContextValue>({
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

  useEffect(() => {
    socket?.on('game:updateState', handleChangeState)

    socket?.on('room:joinedRoom', (roomId: string) => {
      setRoomId(roomId)
      // void router.push('/lobby')
    })

    socket?.on('game:updateCards', handleUpdateCards)
    socket?.on('message:status', setStartingState)

    socket?.on('game:error', handleError)
    socket?.on('room:error', handleError)

    socket?.on('disconnect', handleDisconnect)

    return () => {
      socket?.off('game:updateState')
      socket?.off('room:joinedRoom')
      socket?.off('game:updateCards')
      socket?.off('message:status')
      socket?.off('game:error')
      socket?.off('room:error')
      socket?.off('disconnect')
    }
  }, [socket])

  useEffect(() => {
    if (!socket || !gameState.leader) return
    setIsCurrentUserLeader(gameState.leader.id === socket.id)
    setIsCurrentUserJudge(gameState.judge?.id === socket.id)
  }, [socket, gameState])

  const handleChangeState = (newState: IGameState) => {
    console.log('game:updateState', newState)
    if (newState.status === 'waiting') {
      matchUrl('/lobby')
    }
    if (
      newState.status === 'starting' ||
      newState.status === 'playing' ||
      newState.status === 'judging'
    ) {
      matchUrl('/game')
    }

    setGameState(newState)
  }

  const handleUpdateCards = (cards: ICardAnswer[]) => {
    console.log('game:updateCards', cards)
    setMyHand((prevState) => ({
      ...prevState,
      cards,
    }))
  }

  const matchUrl = (path: string) => {
    router.pathname !== path && void router.push(path)
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
    socket?.emit('room:joinRoom', { username, roomId, pictureUrl })
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
    // Send an adm command message to the server -> example command: "start" || "kick"
    socket?.emit('game:admCommand', command)
  }

  const gameConfig = gameState.config

  const value = {
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
  }

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

export { useGameContext, GameProvider }
