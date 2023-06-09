// src/rooms/GameRoom.ts
import { type Server, type Socket } from 'socket.io'
import { ICardAnswer, ICardQuestion, IDeck, IDeckConfigScreen } from '../models/Deck'
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
  lastRound: IGameRound | null
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
  decks: Array<IDeckConfigScreen>
  scoreToWin: number
  time: number
}

type TRoomStatus =
  | 'waiting'
  | 'starting'
  | 'playing'
  | 'judging'
  | 'results'
  | 'finished'

export default class GameRoom extends Room {
  players: GamePlayer[]
  private decks: Array<IDeckConfigScreen>
  private scoreToWin: number
  private time: number

  private rounds: IGameRound[] = []

  private status: TRoomStatus = 'waiting'
  private judge: Player | null = null
  private currentJudgeIndex: number | null = null
  private currentQuestionCard: ICardQuestion | null = null

  private availableQuestionCards: ICardQuestion[] = []
  private availableAnswerCards: ICardAnswer[] = []
  private usedQuestionCards: ICardQuestion[] = []

  constructor(
    id: string,
    io: Server,
    // TODO: Remove this default decks in the future
    config: IGameConfig = {
      roomSize: 6,
      decks: [],
      scoreToWin: 8,
      time: 20,
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

  // BUG: This function is not working properly, all the players are getting the same cards, just in random order
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

  getNextPlayerCardsResults(): {
    cards: { [playerId: string]: ICardAnswer[] } | null
    hasNext: boolean
  } {
    if (this.rounds.length > 0) {
      const round = this.rounds[this.rounds.length - 1]
      const playerIds = Object.keys(round.answerCards)

      if (round.currentJudgedPlayerIndex < playerIds.length) {
        const currentPlayerId = playerIds[round.currentJudgedPlayerIndex]
        round.currentJudgedPlayerIndex++ // Move to the next player
        const hasNext = round.currentJudgedPlayerIndex < playerIds.length

        // Return an object mapping player IDs to card arrays
        const cards: { [playerId: string]: ICardAnswer[] } = {}
        for (let i = 0; i < round.currentJudgedPlayerIndex; i++) {
          const playerId = playerIds[i]
          cards[playerId] = round.answerCards[playerId]
        }

        return { cards, hasNext }
      }
    }

    return { cards: null, hasNext: false }
  }

  getNextQuestionCard(): ICardQuestion | null {
    // If there are no cards left in availableQuestionCards,
    // shuffle the usedQuestionCards and make them the new availableQuestionCards.
    if (this.availableQuestionCards.length === 0) {
      this.availableQuestionCards = shuffleCards(this.usedQuestionCards)
      this.usedQuestionCards = []
    }

    // Get the next card and remove it from the availableQuestionCards.
    const nextCard = this.availableQuestionCards.pop() || null

    // If a card was retrieved, add it to the used cards.
    if (nextCard) {
      this.usedQuestionCards.push(nextCard)
    }

    return nextCard
  }

  getAllCards(): { [playerId: string]: ICardAnswer[] } {
    if (this.rounds.length > 0) {
      const round = this.rounds[this.rounds.length - 1]
      return round.answerCards
    }

    return {}
  }

  requestNextCard(socket: Socket): void {
    const { cards: nextCards, hasNext } = this.getNextPlayerCardsResults()
    if (nextCards) {
      // Emit the entire 'cards' object instead of just the array for the next player
      this.broadcast('game:updateResultCards', { cards: nextCards, hasNext })
    } else {
      // When no next cards are available, emit all the cards with hasNext set to false
      const allCards = this.getAllCards()
      this.broadcast('game:updateResultCards', {
        cards: allCards,
        hasNext: false,
      })
      console.log('All cards have been sent.')
    }
  }

  seeAllRoundAnswers(socket: Socket): void {
    const allCards = this.getAllCards()
    this.broadcast('game:showAllCards', { cards: allCards, hasNext: false })
  }

  // TODO: handle judge quitting
  // TODO: handle player quitting

  /**
   * Selects a random judge from the players array.
   */
  selectJudge(): void {
    console.log('>>> choosing a random judge...')
    this.startingStatusUpdate('>>> choosing a random judge...')
    if (this.players.length > 0) {
      this.currentJudgeIndex = Math.floor(Math.random() * this.players.length)
      this.judge = this.players[this.currentJudgeIndex]
    }
  }

  /**
   * Populates the available cards with the selected decks.
   */
  populateCards(): void {
    console.log('>>> populating the available cards...')
    this.startingStatusUpdate('>>> populating the available cards...')
    this.availableQuestionCards = []
    this.availableAnswerCards = []
    for (const deck of this.decks) {
      const deckData = getDeckById(deck.id)
      if (!deckData) {
        console.error(`Deck with id ${deck.id} not found.`)
        continue
      }
      this.availableQuestionCards.push(...deckData.cards.questions)
      this.availableAnswerCards.push(...deckData.cards.answers)
    }
  }

  /**
   * Shuffles the available cards.
   */
  shuffleCards(): void {
    console.log('>>> shuffling the cards...')
    this.startingStatusUpdate('>>> shuffling the cards...')
    this.availableQuestionCards = shuffleCards(this.availableQuestionCards)
    this.availableAnswerCards = shuffleCards(this.availableAnswerCards)
  }

  /**
   * Gives the specified number of cards to the specified player.
   */
  dealCardsToPlayer(player: GamePlayer, cardsToDeal: number): void {
    const cardsNeeded = cardsToDeal - player.cards.length

    if (cardsNeeded > 0) {
      if (this.availableAnswerCards.length < cardsNeeded) {
        console.error('Not enough cards in the deck.')
        return
      }

      for (let i = 0; i < cardsNeeded; i++) {
        const cardIndex = Math.floor(
          Math.random() * this.availableAnswerCards.length
        )
        player.cards.push(this.availableAnswerCards[cardIndex])
        this.availableAnswerCards.splice(cardIndex, 1)
      }
    } else if (cardsNeeded < 0) {
      // Remove the excess cards
      player.cards.splice(cardsToDeal)
    }
  }

  /**
   * Deals cards to each player.
   * The number of cards dealt is based on the number of spaces on the current question card.
   * At the end of the round, each player should have 5 cards.
   */
  dealQuestionCardsForEveryone(): void {
    if (this.currentQuestionCard) {
      const cardsToDeal = 5 + this.currentQuestionCard.spaces

      // Give cards to each player
      console.log(`>>> giving ${cardsToDeal} cards to each player...`)
      this.startingStatusUpdate(
        `>>> giving ${cardsToDeal} cards to each player...`
      )
      for (let player of this.players) {
        this.dealCardsToPlayer(player, cardsToDeal)
      }
    } else {
      console.error('No current question card is set.')
    }
  }

  startGame(socket: Socket): void {
    console.log('>>> starting game...')

    this.status = 'starting'
    this.broadcastState()

    this.selectJudge()

    this.populateCards()

    this.shuffleCards()

    // Give a question card to the judge
    console.log('>>> giving a question card to the judge...')
    this.startingStatusUpdate('>>> giving a question card to the judge...')
    this.currentQuestionCard = this.getNextQuestionCard()

    this.dealQuestionCardsForEveryone()
    this.notifyPlayerCards()

    // // Give 6 cards to each player
    // console.log('>>> giving 6 cards to each player...')
    // this.startingStatusUpdate('>>> giving 6 cards to each player...')
    // for (let player of this.players) {
    //   this.giveCardsToPlayer(player)
    // }
    // this.notifyPlayerCards()

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
    this.broadcastState()
    // }, 4000)
  }
  nextRound(): void {
    if (this.checkForWinner()) {
      return
    }

    // Select the next player as a judge
    if (this.players.length > 0 && this.currentJudgeIndex !== null) {
      this.currentJudgeIndex =
        (this.currentJudgeIndex + 1) % this.players.length
      this.judge = this.players[this.currentJudgeIndex]

      // Reset hasSubmittedCards for all players
      this.players.forEach((player) => (player.hasSubmittedCards = false))
    } else {
      console.error(
        'Cannot select a judge, no players available or current judge index is null'
      )
    }
    this.status = 'playing'
    this.updatePlayerStatuses()

    // Add a round here
    this.currentQuestionCard = this.getNextQuestionCard()
    if (this.judge && this.currentQuestionCard) {
      this.addRound(this.currentQuestionCard, this.judge)
    }

    this.dealQuestionCardsForEveryone()
    this.notifyPlayerCards()

    // Make sure each player has 6 cards
    // TODO: Implement this
    // this.players.forEach(player => {
    // while (player.cards.length < 6) {
    //   this.giveCardsToPlayer(player)
    // }
    // })
    this.broadcastState()
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

  checkForWinner(): boolean {
    for (let player of this.players) {
      if (player.score >= this.scoreToWin) {
        this.status = 'finished'
        this.updatePlayerStatuses()
        console.log(`${player.username} has won the game!`)
        this.broadcastState()
        return true
      }
    }
    return false
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
      lastRound: this.lastRound,
      config: {
        roomSize: this.roomSize,
        decks: this.decks,
        scoreToWin: this.scoreToWin,
        time: this.time,
      },
    }
  }

  get lastRound(): IGameRound | null {
    return this.rounds.length > 0 ? this.rounds[this.rounds.length - 1] : null
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
    console.log('>>> judge selection', winningPlayerId)
    const winningPlayerName = this.players.find(
      (p) => p.id === winningPlayerId
    )?.username
    console.log('>>> judge selection', winningPlayerName)
    // Find the winning player and increment their score.
    const winningPlayer = this.players.find((p) => p.id === winningPlayerId)
    if (!winningPlayer) return

    winningPlayer.score++

    // Store the winner for the round
    if (this.rounds.length > 0) {
      this.rounds[this.rounds.length - 1].winner = winningPlayer
    }

    // If the winning player has reached the score to win, update the game state to 'finished'.
    // if (winningPlayer.score === this.scoreToWin) {
    //   // TODO: move this in a place where it will be shown after the round results
    //   this.status = 'finished'
    //   this.broadcastState()
    //   return
    // }

    this.status = 'results'
    this.broadcastState()
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
      console.log(
        `>>> 1 >> Player ${player.username} has submitted their cards.`,
        player.cards
      )
      const selectedCardTexts = new Set(selectedCards.map((card) => card.text))
      player.cards = player.cards.filter(
        (card) => !selectedCardTexts.has(card.text)
      )
      console.log(
        `>>> 2 >> Player ${player.username} has submitted their cards.`,
        player.cards
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
      this.notifyPlayerCards()
      this.broadcastState()
    }
  }

  broadcast(messageType: string, content: any): void {
    const roomId = this.id // Assuming the GameRoom class has an `id` property representing the room id
    this.io.to(roomId).emit(messageType, content)
  }

  broadcastState(): void {
    this.io.to(this.id).emit('game:updateState', this.state)
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
