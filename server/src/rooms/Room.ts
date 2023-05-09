// src/rooms/Room.ts
import { Socket } from 'socket.io'
import { ICardAnswer, ICardQuestion } from '../models/Deck'
import { IGameConfig } from '../models/Game'
import { getDeckById, shuffleCards } from '../lib/deckUtils'

interface Player {
  id: string
  username: string
  pictureUrl: string
}

interface IGameState {
  players: Player[]
  leader: Player | null
  config: {
    roomSize: number
    decks: Array<string>
    scoreToWin: number
    time: number
  }
}

type TRoomStatus = 'waiting' | 'starting' | 'playing' | 'judging' | 'finished'

export default class Room {
  id: string
  players: Player[]
  leader: Player | null

  private roomSize: number
  private decks: Array<string>
  private scoreToWin: number
  private time: number

  private status: TRoomStatus = 'waiting'
  private judge: Player | null = null
  private currentJudgeIndex: number | null = null
  private availableQuestionCards: ICardQuestion[] = []
  private availableAnswerCards: ICardAnswer[] = []

  constructor(id: string) {
    this.id = id
    this.players = []
    this.leader = null
    this.roomSize = 8 // Default room size
    this.decks = [] // Default decks
    this.scoreToWin = 8 // Default score to win
    this.time = 60 // Default Time that the player has to guess make the move
  }

  setConfig(config: IGameConfig): void {
    this.roomSize = config.roomSize
    this.decks = config.decks
    this.scoreToWin = config.scoreToWin
    this.time = config.time
  }

  addPlayer(socket: Socket, username: string, pictureUrl: string) {
    const player = { id: socket.id, username, pictureUrl }
    this.players.push(player)
    if (!this.leader) {
      this.leader = player
    }
  }

  removePlayer(socket: Socket): boolean {
    const index = this.players.findIndex((player) => player.id === socket.id)
    if (index >= 0) {
      this.players.splice(index, 1)
      if (this.leader && this.leader.id === socket.id) {
        this.leader = this.players[0] || null
      }
      return true
    }
    return false
  }

  startGame(socket: Socket): void {
    this.status = 'starting'
    this.notifyState(socket)

    //choose a random judge
    if (this.players.length > 0) {
      this.currentJudgeIndex = Math.floor(Math.random() * this.players.length)
      this.judge = this.players[this.currentJudgeIndex]
    }

    // Populate the available cards with the selected decks
    this.availableQuestionCards = []
    this.availableAnswerCards = []
    for (let deckID of this.decks) {
      const deck = getDeckById(deckID)
      if (!deck) continue
      this.availableQuestionCards.push(...deck.cards.questions)
      this.availableAnswerCards.push(...deck.cards.answers)
    }

    // Shuffle the cards
    this.availableQuestionCards = shuffleCards(this.availableQuestionCards)
    this.availableAnswerCards = shuffleCards(this.availableAnswerCards)
    // TODO: Finalize this
    setTimeout(() => {
      this.status = 'playing'
      this.notifyState(socket)
    }, 4000)
  }

  nextRound(): void {
    // Select the next player as a judge
    if (this.players.length > 0 && this.currentJudgeIndex !== null) {
      this.currentJudgeIndex =
        (this.currentJudgeIndex + 1) % this.players.length
      this.judge = this.players[this.currentJudgeIndex]
    }
  }

  get isEmpty(): boolean {
    return this.players.length === 0
  }

  get isFull(): boolean {
    return this.players.length === this.roomSize
  }

  get state(): IGameState {
    return {
      players: this.players,
      leader: this.leader,
      config: {
        roomSize: this.roomSize,
        decks: this.decks,
        scoreToWin: this.scoreToWin,
        time: this.time,
      },
    }
  }

  notifyState(socket: Socket) {
    socket.to(this.id).emit('game:updateState', this.state)
  }

  notifyPlayerState(socket: Socket): void {
    socket.emit('game:updateState', this.state)
  }
}
