// src/rooms/GameRoom.ts
import { Socket } from 'socket.io'
import { ICardAnswer, ICardQuestion } from '../models/Deck'
import { getDeckById, shuffleCards } from '../lib/deckUtils'
import Room, { Player } from './Room'

interface IGameState {
  players: Player[]
  leader: Player | null
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
  private decks: Array<string>
  private scoreToWin: number
  private time: number

  private status: TRoomStatus = 'waiting'
  private judge: Player | null = null
  private currentJudgeIndex: number | null = null
  private availableQuestionCards: ICardQuestion[] = []
  private availableAnswerCards: ICardAnswer[] = []

  constructor(
    id: string,
    config: IGameConfig = { roomSize: 8, decks: [], scoreToWin: 8, time: 60 }
  ) {
    super(id, { roomSize: config.roomSize })
    this.decks = config.decks
    this.scoreToWin = config.scoreToWin
    this.time = config.time
  }

  setConfig(config: IGameConfig): void {
    super.setRoomConfig({ roomSize: config.roomSize })
    this.decks = config.decks
    this.scoreToWin = config.scoreToWin
    this.time = config.time
  }

  // Rest of your methods...
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
