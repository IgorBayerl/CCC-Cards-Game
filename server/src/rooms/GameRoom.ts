// src/rooms/GameRoom.ts
import { type Server, type Socket } from 'socket.io'
import { ICardAnswer, ICardQuestion } from '../models/Deck'
import { getDeckById, shuffleCards } from '../lib/deckUtils'
import Room from './Room'
import GamePlayer from './GamePlayer'
import Player from './Player'

interface IGameState {
  players: Player[]
  leader: Player | null
  status: TRoomStatus
  judge: Player | null
  currentQuestionCard: ICardQuestion | null
  config: IGameConfig
}

interface IGameConfig {
  roomSize: number
  decks: Array<string>
  scoreToWin: number
  time: number
}

type TRoomStatus = 'waiting' | 'starting' | 'playing' | 'judging' | 'finished'

export default class GameRoom extends Room {
  players: GamePlayer[]
  private decks: Array<string>
  private scoreToWin: number
  private time: number

  private status: TRoomStatus = 'waiting'
  private judge: Player | null = null
  private currentJudgeIndex: number | null = null
  private currentQuestionCard: ICardQuestion | null = null
  private availableQuestionCards: ICardQuestion[] = []
  private availableAnswerCards: ICardAnswer[] = []

  constructor(
    id: string,
    io: Server,
    config: IGameConfig = { roomSize: 8, decks: [], scoreToWin: 8, time: 60 }
  ) {
    super(id, io, { roomSize: config.roomSize })
    this.players = []
    this.decks = config.decks
    this.scoreToWin = config.scoreToWin
    this.time = config.time
  }

  addPlayer(socket: Socket, username: string, pictureUrl: string) {
    const player = new GamePlayer(socket.id, username, pictureUrl, socket.id)
    this.players.push(player)
    if (!this.leader) {
      this.leader = player
    }
  }

  setConfig(config: IGameConfig): void {
    super.setRoomConfig({ roomSize: config.roomSize })
    this.decks = config.decks
    this.scoreToWin = config.scoreToWin
    this.time = config.time
  }

  // Rest of your methods...
  startGame(socket: Socket): void {
    console.log('>>> starting game...')

    this.status = 'starting'
    this.notifyStateAll(socket)

    //choose a random judge
    console.log('>>> choosing a random judge...')
    this.startingStatusUpdate('>>> choosing a random judge...')
    if (this.players.length > 0) {
      this.currentJudgeIndex = Math.floor(Math.random() * this.players.length)
      this.judge = this.players[this.currentJudgeIndex]
    }

    // Populate the available cards with the selected decks
    console.log('>>> populating the available cards...')
    this.startingStatusUpdate('>>> populating the available cards...')
    this.availableQuestionCards = []
    this.availableAnswerCards = []
    for (let deckID of this.decks) {
      const deck = getDeckById(deckID)
      if (!deck) continue
      this.availableQuestionCards.push(...deck.cards.questions)
      this.availableAnswerCards.push(...deck.cards.answers)
    }

    // Shuffle the cards
    console.log('>>> shuffling the cards...')
    this.startingStatusUpdate('>>> shuffling the cards...')
    this.availableQuestionCards = shuffleCards(this.availableQuestionCards)
    this.availableAnswerCards = shuffleCards(this.availableAnswerCards)

    // Give 6 cards to each player
    console.log('>>> giving 6 cards to each player...')
    this.startingStatusUpdate('>>> giving 6 cards to each player...')
    for (let player of this.players) {
      player.cards = this.availableAnswerCards.splice(0, 6)
    }
    this.notifyPlayerCards()

    // Give a question card to the judge
    console.log('>>> giving a question card to the judge...')
    this.startingStatusUpdate('>>> giving a question card to the judge...')
    this.currentQuestionCard = this.availableQuestionCards.pop() || null

    // setTimeout(() => {
    this.status = 'playing'
    this.notifyStateAll(socket)
    // }, 4000)
  }

  nextRound(): void {
    // Select the next player as a judge
    if (this.players.length > 0 && this.currentJudgeIndex !== null) {
      this.currentJudgeIndex =
        (this.currentJudgeIndex + 1) % this.players.length
      this.judge = this.players[this.currentJudgeIndex]
    }
  }

  get statePlayers(): Player[] {
    return this.players.map((player) => {
      return {
        id: player.id,
        username: player.username,
        pictureUrl: player.pictureUrl,
      }
    })
  }

  get state(): IGameState {
    return {
      players: this.statePlayers,
      leader: this.leader,
      status: this.status,
      judge: this.judge,
      currentQuestionCard: this.currentQuestionCard,
      config: {
        roomSize: this.roomSize,
        decks: this.decks,
        scoreToWin: this.scoreToWin,
        time: this.time,
      },
    }
  }

  notifyStateAll(socket: Socket): void {
    this.notifyState(socket)
    this.notifyPlayerState(socket)
  }

  notifyState(socket: Socket) {
    socket.to(this.id).emit('game:updateState', this.state)
  }

  notifyPlayerState(socket: Socket): void {
    socket.emit('game:updateState', this.state)
  }

  notifyPlayerCards(): void {
    for (let player of this.players) {
      const socketId = player.socketId
      this.io.to(socketId).emit('game:updateCards', player.cards)
    }
  }

  startingStatusUpdate(message: string): void {
    this.io.to(this.id).emit('message:status', message)
  }
}
