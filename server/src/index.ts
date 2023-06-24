import express from 'express'
import { Server } from 'socket.io'
import { createServer } from 'http'
import RoomManager from './rooms/RoomManager'
import { handleJoinRoom, handleLeaveRoom } from './roomEvents'
import {
  handleSetConfig,
  handleAdmCommand,
  handlePlayerSelection,
  handleRequestNextCard,
  handleJudgeDecision,
  handleSeeAllRoundAnswers,
} from './gameEvents'
import cors from 'cors'
// import decks from './data/decks.json'
import fs from 'fs'
import path from 'path'
import { ICardAnswer } from './models/Deck'
import { listDecks } from './lib/deckUtils'
import { z, ZodParsedType } from 'zod'
import { DecksQuerySchema } from './validation/endpointsValidation'

// Read and parse all deck JSON files
const decksDirectory = path.join(__dirname, './data/decks')
const deckFiles = fs.readdirSync(decksDirectory)
const decks = deckFiles.map((file) => {
  const deck = JSON.parse(
    fs.readFileSync(path.join(decksDirectory, file), 'utf-8')
  )
  const [language, _rest, id] = file.split('_')
  deck.id = id.split('.')[0] // remove .json extension
  deck.language = language
  return deck
})

const app = express()
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
})

app.use(cors())

app.get('/', (req, res) => {
  res.send('Hello Cyber Chaos Cards!')
})

app.get('/decks', (req, res) => {
  const result = DecksQuerySchema.safeParse(req.query)

  if (!result.success) {
    res.status(400).json({
      message: 'Invalid query parameters',
      errors: result.error.issues,
    })
    return
  }

  const { language, category } = result.data
  const decksList = listDecks({ language, category })
  res.json(decksList)
})

app.get('/decks/:id', (req, res) => {
  const deckId = req.params.id
  const deck = decks.find((d) => d.id === deckId)

  if (!deck) {
    res.status(404).json({ message: 'Deck not found' })
  } else {
    res.json(deck)
  }
})

interface IJoinRequest {
  username: string
  roomId: string
  pictureUrl: string
  oldSocketId?: string
}

const roomManager = new RoomManager(io)

io.on('connection', (socket) => {
  console.log('A user connected!')

  socket.on('room:joinRoom', (joinRequest: IJoinRequest) => {
    handleJoinRoom(socket, roomManager, joinRequest)
  })

  socket.on('room:leaveRoom', () => {
    handleLeaveRoom(socket, roomManager)
  })

  socket.on('game:admCommand', (command) => {
    handleAdmCommand(socket, roomManager, command)
  })

  socket.on('game:setConfig', (config) => {
    handleSetConfig(socket, roomManager, config)
  })

  socket.on('game:playerSelection', (selectedCards: ICardAnswer[]) => {
    handlePlayerSelection(socket, roomManager, selectedCards)
  })

  socket.on('game:requestNextCard', () => {
    handleRequestNextCard(socket, roomManager)
  })

  socket.on('game:seeAllRoundAnswers', () => {
    handleSeeAllRoundAnswers(socket, roomManager)
  })

  socket.on('game:judgeDecision', (winningPlayerId: string) => {
    handleJudgeDecision(socket, roomManager, winningPlayerId)
  })

  //BUG: When everyone leaves the room, the server is breaking, its not possible to connect anymore
  socket.on('disconnect', () => {
    console.log('A user disconnected!')
    // Change leaveRoom to disconnectFromRoom
    const room = roomManager.disconnectFromRoom(socket)
    room?.broadcastState()
  })
})

const PORT = process.env.PORT || 3365

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
