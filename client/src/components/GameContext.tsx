import { Client, Room } from 'colyseus.js'
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
// import { useSocketContext } from '~/components/SocketContext'
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
  // socket: Socket | undefined
  gameConfig: IGameConfig
  startingState: string
  isCurrentUserLeader: boolean
  isCurrentUserJudge: boolean
  joinRoom: (username: string, roomId: string, pictureUrl: string) => void
  createRoom: (username: string, pictureUrl: string) => void
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
  availableDecks: IDeckConfigScreen[]
  scoreToWin: number
  roomSize: number
  roundTime: number
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
  players: Map<string, IPlayer>
  leader: string
  roomStatus: TRoomStatus
  judge: string | null
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
  availableDecks: [],
  scoreToWin: 8,
  roomSize: 4,
  roundTime: 60,
}

const initialGameState: IGameState = {
  players: new Map(),
  leader: '',
  judge: null,
  roomStatus: 'waiting',
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
  // socket: undefined,
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
  const [myHand, setMyHand] = useState<IMyHand>(initialHandState)
  // const [roomId, setRoomId] = useState<string>('')
  const [isCurrentUserLeader, setIsCurrentUserLeader] = useState(false)
  const [isCurrentUserJudge, setIsCurrentUserJudge] = useState(false)
  // const [myId, setMyId] = useState<string>('')
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

  const soundsPerPage: Record<string, PlayFunction | undefined> = {
    '/lobby': playEnterLobby, //OK
    '/game': playNewRound, //OK
    '/judging': playTumDum, //OK
    '/results': playTumDum, //OK
    '/end': playPartyHorn,
  }

  const playSound = (url: string) => {
    // console.log('playSound', url)
    // console.log('isMuted', isMuted)
    // if (isMuted) return
    setTimeout(() => {
      soundsPerPage[url]?.()
    }, 500)
  }

  // useEffect(() => {
  //   socket?.on('game:updateState', handleChangeState)

  //   socket?.on('room:joinedRoom', (roomId: string) => {
  //     console.log('room:joinedRoom', roomId)
  //     // setRoomId(roomId)
  //     localStorage.setItem('oldSocketId', socket?.id || '')
  //   })

  //   socket?.on('game:updateCards', handleUpdateCards)
  //   socket?.on('message:status', setStartingState)
  //   socket?.on('message:notify', handleNotify)

  //   socket?.on('game:error', handleError)
  //   socket?.on('room:error', handleError)

  //   socket?.on('disconnect', handleDisconnect)

  //   return () => {
  //     socket?.off('game:updateState')
  //     socket?.off('room:joinedRoom')
  //     socket?.off('game:updateCards')
  //     socket?.off('message:status')
  //     socket?.off('message:notify')
  //     socket?.off('game:error')
  //     socket?.off('room:error')
  //     socket?.off('disconnect')
  //   }
  // }, [socket])

  useEffect(() => {
    console.log('room Updated')
    if (room) {
      room.onMessage('room:joinedRoom', (roomId: string) => {
        console.log('a room:joinedRoom', roomId)
        // setRoomId(roomId)
        localStorage.setItem('oldSocketId', roomId || '')
      })

      room.onStateChange(handleChangeState)

      return () => room && room.removeAllListeners()
    }
  }, [room])

  // useEffect(() => {
  //   if (!socket || !gameState.leader) return
  //   setIsCurrentUserLeader(gameState.leader === socket.id)
  //   setIsCurrentUserJudge(gameState.judge === socket.id)
  // }, [socket, gameState])

  const handleChangeState = (newState: IGameState) => {
    console.log('game:updateState', newState.config)

    console.log('>>>ROOM STATUS: ', newState.roomStatus)
    const newPath = statusToUrl[newState.roomStatus]
    if (newPath && router.pathname !== newPath) {
      void playSound(newPath)
      void router.push(newPath)
    }

    // console.log('PLAYERS: ', newState.players)

    setGameState({ ...newState })
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

    // setRoomId('')
    setGameState({ ...initialGameState })
    void router.push('/')
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
      // setRoomId(room.id)
    } catch (error) {
      // @ts-ignore
      toast.error('Error creating room: ' + error.message)
      console.error(error)
    }
  }

  const leaveRoom = () => {
    room?.leave()
    // setRoomId('')
    setGameState({ ...initialGameState })
  }

  const setConfig = (config: IGameConfig) => {
    console.log('game:setConfig', config)
    setGameState((prevState) => ({
      ...prevState,
      config,
    }))

    room?.send('game:setConfig', config)
  }

  const admCommand = (command: string) => {
    // Send an adm command message to the server -> example command: "start" || "kick" || "start-new-game"
    console.log('sending adm command:', command)
    room?.send('game:admCommand', command)
  }

  // Player Actions
  const playerSelectCards = (cards: ICardAnswer[]) => {
    // Ensure that the `socket` is connected before emitting the event.
    // if (!socket) return

    // Emit the event to the server.
    console.log('game:playerSelection', cards)
    // socket.emit('game:playerSelection', cards)
  }

  const gameConfig = gameState.config

  const value = {
    myId: myId,
    myStatus: gameState.players.get(myId)?.status || 'none',
    myHand,
    gameState,
    roomId,
    // socket,
    gameConfig,
    startingState,
    isCurrentUserLeader: gameState.leader === myId,
    isCurrentUserJudge,
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
