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
} from './gameEvents'
import cors from 'cors'
import decks from './data/decks.json'
import { ICardAnswer } from './models/Deck'

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
  res.send('Hello World!')
})

app.get('/decks', (req, res) => {
  const language = req.query.language
  const filteredDecks = !language
    ? decks
    : decks.filter((deck) => deck.language.includes(language as string))

  const deckSummaries = filteredDecks.map((deck) => ({
    id: deck.id,
    name: deck.name,
    language: deck.language,
    description: deck.description,
  }))

  res.json(deckSummaries)
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

  // TODO: implement this on the frontend
  socket.on('game:playerSelection', (selectedCards: ICardAnswer[]) => {
    handlePlayerSelection(socket, roomManager, selectedCards)
  })

  socket.on('game:requestNextCard', () => {
    handleRequestNextCard(socket, roomManager)
  })

  // TODO: implement this on the frontend
  socket.on('game:judgeDecision', (winningPlayerId: string) => {
    handleJudgeDecision(socket, roomManager, winningPlayerId)
  })

  socket.on('disconnect', () => {
    console.log('A user disconnected!')
    const room = roomManager.leaveRoom(socket)
    room?.notifyState(socket)
  })
})

const PORT = process.env.PORT || 3365

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
