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
  type MyRoomState,
  type Player,
  type QuestionCard,
  type RoomConfig,
  type AnswerCard,
  type RoomStatus,
  MessageType,
  type GameMessagePayloads,
} from '@ccc-cards-game/types'
import extractErrorMessage from '~/lib/extractErrorMessage'
import { useDiscordAuthenticatedContext } from '~/hooks/useDiscordAuthenticatedContext'
import isRunningInDiscord from '~/lib/isDiscord'
import { getWsUrl } from '~/services/api'
import useDiscordSdk from '~/hooks/useDiscordSdk'


interface IGameContextValue {
  myId: string
  myStatus: TPlayerStatus
  gameState: MyRoomState
  room: Room<MyRoomState> | null
  roomId: string
  gameConfig: RoomConfig
  isCurrentUserLeader: boolean
  isCurrentUserJudge: boolean
  player: Player | null
  joinRoom: (username: string, roomId: string, pictureUrl: string) => void
  createRoom: (username: string, pictureUrl: string) => void
  leaveRoom: () => void
  setConfig: (config: RoomConfig) => void
  sendToRoom: (type: MessageType, payload: GameMessagePayloads[MessageType]) => void
  playerSelectCards: (cards: AnswerCard[]) => void
}


interface RoomMetadata {
  channelId: string;
}


interface IGameProviderProps {
  children: ReactNode
}

export type GamePage = '/lobby' | '/game' | '/judging' | '/results' | '/end'


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
  currentQuestionCard: {} as QuestionCard,
  usedQuestionCards: [],
  usedAnswerCards: [],
  leader: '',
}

const statusToUrl: Record<RoomStatus, GamePage> = {
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
  room: null,
  roomId: '',
  gameConfig: defaultGameConfig,
  isCurrentUserLeader: false,
  isCurrentUserJudge: false,
  player: null,
  joinRoom: () => undefined,
  createRoom: () => undefined,
  leaveRoom: () => undefined,
  setConfig: () => undefined,
  sendToRoom: () => undefined,
  playerSelectCards: (_) => undefined,
})

const useGameContext = () => useContext(GameContext)

// Initialize the Colyseus client

const URL = getWsUrl()
const client = new Client(URL)

const GameProvider: React.FC<IGameProviderProps> = ({ children }) => {
  const [gameState, setGameState] = useState(initialGameState)
  const { isMuted } = useAudio()
  const discordSdk = useDiscordSdk();


  const [room, setRoom] = useState<Room<MyRoomState> | null>(null)
  const discordAuthenticatedContext = useDiscordAuthenticatedContext();
  const { user_parsed_info, isDiscordAuthenticated } = discordAuthenticatedContext

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
    (url: GamePage) => {
      if (isMuted) return
      setTimeout(() => {
        soundsPerPage[url]?.()
      }, 500)
    },
    [isMuted, soundsPerPage]
  )

  const handleChangeState = useCallback(
    (newState: MyRoomState) => {

      const newPath = statusToUrl[newState.roomStatus]
      console.log('New path:', newPath)
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

  const sendToRoom = useCallback(
    <T extends MessageType>(type: T, payload: GameMessagePayloads[T]) => {
      if (!room) {
        console.error('Attempted to send message without an active room')
        return
      }

      room.send(type, payload)
    },
    [room]
  )

  const joinRoom = async (username: string, roomId: string, pictureUrl: string) => {
    const oldPlayerId = localStorage.getItem('oldPlayerId')
    const room = await client.joinById<MyRoomState>(roomId, {
      username,
      pictureUrl,
      oldPlayerId: oldPlayerId || undefined,
    })
    setRoom(room)
  }

  const createRoom = async (username: string, pictureUrl: string) => {
    try {
      const room = await client.create<MyRoomState>('my_room', {
        username,
        pictureUrl,
      })
      setRoom(room)
    } catch (error) {
      const errorMessage = extractErrorMessage(error)
      toast.error(`Error: ${errorMessage}`)
      console.error(error)
    }
  }

  async function joinOrCreateByChannelId(username: string, channelId: string, pictureUrl: string): Promise<void> {
    // Attempt to find a room with the matching channelId
    const rooms = await client.getAvailableRooms<RoomMetadata>('my_room')
      .then(rooms => rooms.filter(room => room?.metadata?.channelId === channelId));

    if (rooms.length > 0) {
      // If a matching room is found, attempt to join it
      try {
        const targetRoom = rooms[0];
        if (targetRoom) {
          await joinRoom(username, targetRoom.roomId, pictureUrl)
          return
        }
      } catch (error) {
        console.error("Error joining the room:", error);
      }
    }

    // If no room with the desired channelId exists, create a new one
    await createRoom(username, pictureUrl)
  }




  const leaveRoom = () => {
    void room?.leave()
    setGameState({ ...initialGameState })
  }

  const setConfig = (config: SetConfigPayload) => {
    setGameState((prevState) => ({
      ...prevState,
      config,
    }))
    sendToRoom(MessageType.SET_CONFIG, config)
  }

  const playerSelectCards = (cards: AnswerCard[]) => {
    const payload = {
      selection: cards,
    }
    sendToRoom(MessageType.PLAYER_SELECTION, payload)
  }

  const gameConfig = gameState.config

  const player = gameState.players.get(myId)

  useEffect(() => {
    if (!discordAuthenticatedContext.user_parsed_info.userId) {
      console.warn("Discord client or user data is not available.");
      return;
    }
    const { username, picture } = discordAuthenticatedContext.user_parsed_info
    const channelId = discordSdk?.channelId || 'unknown'

    // BUG This is running twice for some reason just on dev- it ends with two clients connected with the same user
    void joinOrCreateByChannelId(username, channelId, picture);
  }, [discordAuthenticatedContext]); 

  useEffect(() => {
    if (room) {
      room.onMessage('room:joinedRoom', (_roomId: string) => {
      // TODO save this room id to auto reconnect in the future
        const myId = room.sessionId
        localStorage.setItem('oldPlayerId', myId || '')
      })

      room.onMessage('game:error', handleError)
      room.onMessage('game:notify', handleNotify)

      room.onStateChange(handleChangeState)

      room.onLeave(handleDisconnect)

      return () => room && room.removeAllListeners()
    }
  }, [room, handleChangeState])

  const value = {
    myId: myId,
    myStatus: player?.status || 'none',
    gameState,
    room,
    roomId,
    gameConfig,
    isCurrentUserLeader: gameState.leader === myId,
    isCurrentUserJudge: gameState.judge === myId,
    player: player || null, 
    joinRoom,
    createRoom,
    leaveRoom,
    setConfig,
    sendToRoom,
    playerSelectCards,
  }

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

export { useGameContext, GameProvider }
