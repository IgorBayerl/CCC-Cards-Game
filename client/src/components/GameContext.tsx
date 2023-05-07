import router from 'next/router'
import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react'
import { type Socket } from 'socket.io-client'
import { useSocketContext } from '~/components/SocketContext'

interface IGameContextValue {
  gameState: IGameState
  roomId: string
  socket: Socket | undefined
  gameConfig: IGameConfig
  setGameConfig: (config: IGameConfig) => void
  joinRoom: (username: string, roomId: string) => void
  leaveRoom: () => void
  setConfig: (config: IGameConfig) => void
  admCommand: (command: string) => void
}

interface IGameConfig {
  decks: string[]
  rounds: number
  roomSize: number
  timeLimit: number
}

interface IGameProviderProps {
  children: ReactNode
}

export interface IGameState {
  players: IPlayer[]
  leader: IPlayer
  roomStatus: 'waiting' | 'starting' | 'choosing_cards' | 'judging' | 'end'
}

export interface IPlayer {
  id: string
  username: string
  roundRole: 'player' | 'judge'
  score: number
}

export interface IDrawing {
  id: string
  playerId: string
  imageUrl: string
}

interface ISocketError {
  message: string
  error: Error
}

const defaultGameConfig: IGameConfig = {
  decks: [],
  rounds: 3,
  roomSize: 4,
  timeLimit: 60,
}

const initialGameState: IGameState = {
  players: [],
  leader: {
    id: '',
    username: '',
    roundRole: 'player',
    score: 0,
  },
  roomStatus: 'waiting',
}

const GameContext = createContext<IGameContextValue>({
  gameState: initialGameState,
  roomId: '',
  socket: undefined,
  gameConfig: defaultGameConfig,
  setGameConfig: () => undefined,
  joinRoom: () => undefined,
  leaveRoom: () => undefined,
  setConfig: () => undefined,
  admCommand: (_) => undefined,
})

const useGameContext = () => useContext(GameContext)

const GameProvider: React.FC<IGameProviderProps> = ({ children }) => {
  const { socket } = useSocketContext()
  const [gameState, setGameState] = useState(initialGameState)
  const [roomId, setRoomId] = useState<string>('')
  const [gameConfig, setGameConfig] = useState<IGameConfig>(defaultGameConfig)

  useEffect(() => {
    socket?.on('game:updateState', (newState: IGameState) => {
      console.log('game:updateState', newState)
      setGameState(newState)
    })

    socket?.on('room:joinedRoom', (roomId: string) => {
      setRoomId(roomId)
      void router.push('/lobby')
    })

    socket?.on('game:error', handleError)
    socket?.on('room:error', handleError)

    return () => {
      socket?.off('game:updateState')
      socket?.off('room:joinedRoom')
      socket?.off('game:error')
      socket?.off('room:error')
    }
  }, [socket])

  const handleError = (socketError: ISocketError) => {
    const { message, error } = socketError
    console.log(message)
    console.error(error)
  }

  const joinRoom = (username: string, roomId: string) => {
    socket?.emit('room:joinRoom', { username, roomId })
  }

  const leaveRoom = () => {
    socket?.emit('room:leaveRoom')
    setRoomId('')
    setGameState(initialGameState)
  }

  const setConfig = (config: IGameConfig) => {
    setGameConfig(config)
    socket?.emit('game:setConfig', config)
  }

  const admCommand = (command: string) => {
    // Send an adm command message to the server -> example command: "start" || "kick"
    socket?.emit('game:admCommand', command)
  }

  const value = {
    gameState,
    roomId,
    socket,
    gameConfig,
    setGameConfig,
    joinRoom,
    leaveRoom,
    setConfig,
    admCommand,
  }

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

export { useGameContext, GameProvider }