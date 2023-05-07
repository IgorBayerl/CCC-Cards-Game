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

interface IGameContextValue {
  gameState: IGameState
  roomId: string
  socket: Socket | undefined
  gameConfig: IGameConfig
  isCurrentUserLeader: boolean
  joinRoom: (username: string, roomId: string, pictureUrl: string) => void
  leaveRoom: () => void
  setConfig: (config: IGameConfig) => void
  admCommand: (command: string) => void
}

interface IGameConfig {
  decks: string[]
  scoreToWin: number
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
  config: IGameConfig
}

export interface IPlayer {
  id: string
  username: string
  pictureUrl: string
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
  scoreToWin: 8,
  roomSize: 4,
  timeLimit: 60,
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
  roomStatus: 'waiting',
  config: defaultGameConfig,
}

const GameContext = createContext<IGameContextValue>({
  gameState: initialGameState,
  roomId: '',
  socket: undefined,
  gameConfig: defaultGameConfig,
  isCurrentUserLeader: false,
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
  const [isCurrentUserLeader, setIsCurrentUserLeader] = useState(false)

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

    socket?.on('disconnect', handleDisconnect)

    return () => {
      socket?.off('game:updateState')
      socket?.off('room:joinedRoom')
      socket?.off('game:error')
      socket?.off('room:error')
      socket?.off('disconnect')
    }
  }, [socket])

  useEffect(() => {
    if (!socket || !gameState.leader) return
    setIsCurrentUserLeader(gameState.leader.id === socket.id)
  }, [socket, gameState])

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
    gameState,
    roomId,
    socket,
    gameConfig,
    isCurrentUserLeader,
    joinRoom,
    leaveRoom,
    setConfig,
    admCommand,
  }

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

export { useGameContext, GameProvider }
