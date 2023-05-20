// src/rooms/GameRoom.ts
import { type Server, type Socket } from 'socket.io'
import { ICardAnswer, ICardQuestion } from '../models/Deck'
import { getDeckById, shuffleCards } from '../lib/deckUtils'
import Room from './Room'
import GamePlayer, { TPlayerStatus } from './GamePlayer'
import Player from './Player'

interface IGameState {
  players: Player[]
  leader: Player | null
  status: TRoomStatus
  judge: Player | null
  currentQuestionCard: ICardQuestion | null
  config: IGameConfig
}

interface IGameRound {
  questionCard: ICardQuestion
  answerCards: { [playerId: string]: ICardAnswer[] }
  judge: Player
  winner: Player | null
  currentJudgedPlayerIndex: number
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

  private rounds: IGameRound[] = []

  private status: TRoomStatus = 'waiting'
  private judge: Player | null = null
  private currentJudgeIndex: number | null = null
  private currentQuestionCard: ICardQuestion | null = null
  private availableQuestionCards: ICardQuestion[] = []
  private availableAnswerCards: ICardAnswer[] = []

  constructor(
    id: string,
    io: Server,
    // TODO: Remove this default decks in the future
    config: IGameConfig = {
      roomSize: 6,
      decks: ['1', '2', '4', '5'],
      scoreToWin: 8,
      time: 60,
    }
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

    // Give the player cards if the game has already started
    if (this.status !== 'waiting' && this.status !== 'starting') {
      this.giveCardsToPlayer(player)
      const socketId = player.socketId
      this.io.to(socketId).emit('game:updateCards', player.cards)
    }
  }

  setConfig(config: IGameConfig): void {
    super.setRoomConfig({ roomSize: config.roomSize })
    this.decks = config.decks
    this.scoreToWin = config.scoreToWin
    this.time = config.time
  }

  giveCardsToPlayer(player: GamePlayer): void {
    for (let i = 0; i < 6; i++) {
      const cardIndex =
        (i + player.cards.length) % this.availableAnswerCards.length
      player.cards.push(this.availableAnswerCards[cardIndex])
    }
    // Shuffle the player's cards
    player.cards = shuffleCards(player.cards)
  }

  addRound(questionCard: ICardQuestion, judge: Player): void {
    this.rounds.push({
      questionCard,
      answerCards: {},
      judge,
      winner: null,
      currentJudgedPlayerIndex: 0, // Initialize to 0
    })
  }

  getNextPlayerCards(): { cards: ICardAnswer[] | null; hasNext: boolean } {
    if (this.rounds.length > 0) {
      const round = this.rounds[this.rounds.length - 1]
      const playerIds = Object.keys(round.answerCards)

      if (round.currentJudgedPlayerIndex < playerIds.length) {
        const currentPlayerId = playerIds[round.currentJudgedPlayerIndex]
        round.currentJudgedPlayerIndex++ // Move to the next player
        const hasNext = round.currentJudgedPlayerIndex < playerIds.length
        return {
          cards: round.answerCards[currentPlayerId],
          hasNext,
        }
      }
    }

    return { cards: null, hasNext: false }
  }

  getAllCards(): { [playerId: string]: ICardAnswer[] } {
    if (this.rounds.length > 0) {
      const round = this.rounds[this.rounds.length - 1]
      return round.answerCards
    }

    return {}
  }

  requestNextCard(socket: Socket): void {
    const { cards: nextCards, hasNext } = this.getNextPlayerCards()
    if (nextCards) {
      socket.emit('game:updateCards', { cards: nextCards, hasNext })
    } else {
      socket.emit('game:allCards', this.getAllCards())
      socket.emit('game:error', {
        message: 'Invalid configuration',
        error: 'Invalid configuration',
      })
      console.error('No next cards available.')
    }
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
      if (!deck) {
        console.error(`Deck with id ${deckID} not found.`)
        continue
      }
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
      this.giveCardsToPlayer(player)
    }
    this.notifyPlayerCards()

    // Give a question card to the judge
    console.log('>>> giving a question card to the judge...')
    this.startingStatusUpdate('>>> giving a question card to the judge...')
    this.currentQuestionCard = this.availableQuestionCards.pop() || null

    // Add a round here
    if (this.judge && this.currentQuestionCard) {
      this.addRound(this.currentQuestionCard, this.judge)
    }

    // Set the player statuses
    for (let player of this.players) {
      player.status = player === this.judge ? 'waiting' : 'pending'
    }

    // setTimeout(() => {
    this.status = 'playing'
    this.updatePlayerStatuses()
    this.notifyStateAll(socket)
    // }, 4000)
  }
  nextRound(): void {
    // Select the next player as a judge
    if (this.players.length > 0 && this.currentJudgeIndex !== null) {
      this.currentJudgeIndex =
        (this.currentJudgeIndex + 1) % this.players.length
      this.judge = this.players[this.currentJudgeIndex]
      this.updatePlayerStatuses()

      // Reset hasSubmittedCards for all players
      this.players.forEach((player) => (player.hasSubmittedCards = false))
    } else {
      console.error(
        'Cannot select a judge, no players available or current judge index is null'
      )
    }

    // Add a round here
    this.currentQuestionCard = this.availableQuestionCards.pop() || null
    if (this.judge && this.currentQuestionCard) {
      this.addRound(this.currentQuestionCard, this.judge)
    }
  }

  updatePlayerStatuses(): void {
    switch (this.status) {
      case 'waiting':
      case 'starting':
        this.setAllPlayersStatus('waiting')
        break
      case 'playing':
        this.updatePlayingStatus()
        break
      case 'judging':
        this.updateJudgingStatus()
        break
      case 'finished':
        this.updateFinishedStatus()
        break
    }
  }
  setAllPlayersStatus(status: TPlayerStatus): void {
    this.players.forEach((player) => (player.status = status))
  }

  updatePlayingStatus(): void {
    this.players.forEach((player) => {
      player.status =
        player === this.judge ? 'waiting' : this.getCardStatus(player)
    })
  }

  getCardStatus(player: GamePlayer): TPlayerStatus {
    // Return 'pending' if the player has not submitted cards, 'done' otherwise.
    return player.hasSubmittedCards ? 'done' : 'pending'
  }

  updateJudgingStatus(): void {
    this.players.forEach((player) => {
      player.status = player === this.judge ? 'judge' : 'waiting'
    })
  }

  updateFinishedStatus(): void {
    let winner = this.getWinner()
    this.players.forEach((player) => {
      player.status = player === winner ? 'winner' : 'none'
    })
  }
  getWinner(): GamePlayer {
    return this.players.reduce((prev, current) =>
      prev.score > current.score ? prev : current
    )
  }

  checkForWinner(): void {
    for (let player of this.players) {
      if (player.score >= this.scoreToWin) {
        this.status = 'finished'
        this.updatePlayerStatuses()
        console.log(`${player.username} has won the game!`)
        break
      }
    }
  }

  get statePlayers(): Player[] {
    return this.players.map((player) => {
      return {
        id: player.id,
        username: player.username,
        pictureUrl: player.pictureUrl,
        score: player.score,
        status: player.status,
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

  get currentStatus(): TRoomStatus {
    return this.status
  }

  get currentJudge(): Player | null {
    return this.judge
  }

  get winningScore(): number {
    return this.scoreToWin
  }

  get gameRounds(): IGameRound[] {
    return this.rounds
  }

  judgeSelection(winningPlayerId: string, socket: Socket): void {
    // Find the winning player and increment their score.
    const winningPlayer = this.players.find((p) => p.id === winningPlayerId)
    if (winningPlayer) {
      winningPlayer.score++

      // Store the winner for the round
      if (this.rounds.length > 0) {
        this.rounds[this.rounds.length - 1].winner = winningPlayer
      }

      // If the winning player has reached the score to win, update the game state to 'finished'.
      if (winningPlayer.score === this.scoreToWin) {
        this.status = 'finished'
      } else {
        // Otherwise, start the next round.
        this.status = 'playing'
        this.nextRound()
      }

      // Update player statuses
      this.updatePlayerStatuses()

      // Notify the game room of the state change
      this.notifyState(socket)
    }
  }

  playerSelection(selectedCards: ICardAnswer[], socket: Socket): void {
    console.log('>>> player Selection')
    // Find the player and update their cards.
    const player = this.players.find((p) => p.socketId === socket.id)
    if (player && this.rounds.length > 0) {
      console.log(
        `Player ${player.username} has submitted their cards: ${selectedCards
          .map((card) => card.text)
          .join(', ')}.`
      )

      // Remove the selected cards from the player's hand
      player.cards = player.cards.filter(
        (card) => !selectedCards.includes(card)
      )

      // Store the selected cards for the round
      this.rounds[this.rounds.length - 1].answerCards[player.id] = selectedCards

      // Mark the player as having submitted cards
      player.hasSubmittedCards = true

      // Update player statuses
      this.updatePlayerStatuses()

      // Check if all players have submitted their cards
      const allPlayersSubmitted = this.players.every(
        (p) => p === this.judge || p.hasSubmittedCards
      )
      if (allPlayersSubmitted) {
        this.status = 'judging'
        this.updatePlayerStatuses()
      }

      // Notify the game room of the state change
      this.notifyState(socket)
      // Notify the player of their updated status
      this.notifyPlayerState(socket)
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
