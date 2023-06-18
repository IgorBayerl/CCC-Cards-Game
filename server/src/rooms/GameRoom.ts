// src/rooms/GameRoom.ts
import { type Server, type Socket } from 'socket.io'
import {
  ICard,
  ICardAnswer,
  ICardQuestion,
  IDeck,
  IDeckConfigScreen,
} from '../models/Deck'
import { getDeckById, shuffleCards } from '../lib/deckUtils'
import Room from './Room'
import GamePlayer, { TPlayerStatus } from './GamePlayer'
import Player from './Player'
import { delay } from '../lib/utils'

interface IGameState {
  players: Player[]
  leader: Player | null
  status: TRoomStatus
  judge: Player | null
  currentQuestionCard: ICardQuestion | null
  lastRound: IGameRound | null
  config: IGameConfig
  rounds?: IGameRound[]
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

  private timer: NodeJS.Timeout | null = null

  constructor(
    id: string,
    io: Server,
    // TODO: Remove this default decks in the future
    config: IGameConfig = {
      roomSize: 14,
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

  // /**
  //  * @deprecated Use addPlayer instead
  //  */
  // addPlayerNew(
  //   socket: Socket,
  //   username: string,
  //   pictureUrl: string,
  //   oldSocketId?: string
  // ) {
  //   // Call the parent class method first
  //   super.addPlayer(socket, username, pictureUrl, oldSocketId)

  //   // Retrieve the player (either newly created or existing one)
  //   const player = this.players.find((p) => p.id === socket.id)

  //   // If player is found (it should be) and the game has already started, give the player cards
  //   if (player && this.status !== 'waiting' && this.status !== 'starting') {
  //     // Only give cards to new players (those who don't have cards yet)
  //     if (player.cards.length === 0) {
  //       this.giveCardsToPlayer(player)
  //       const socketId = player.socketId
  //       this.io.to(socketId).emit('game:updateCards', player.cards)
  //     }
  //   }
  // }

  addPlayer(
    socket: Socket,
    username: string,
    pictureUrl: string,
    oldSocketId?: string
  ) {
    // Check if the player already exists using oldSocketId
    const existingPlayerIndex = oldSocketId
      ? this.players.findIndex((p) => p.id === oldSocketId)
      : -1

    if (existingPlayerIndex > -1) {
      // If the player exists, update their details
      this.players[existingPlayerIndex].id = socket.id // Update the new socket id
      this.players[existingPlayerIndex].isOffline = false // Set the player back to online
    } else {
      // If player does not exist, create a new player
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
  }

  removePlayer(socket: Socket): boolean {
    const result = super.disconnectPlayer(socket) // Call the parent method
    result && this.handleJudgeDisconnect()
    return result
  }

  disconnectPlayer(socket: Socket): boolean {
    const result = super.disconnectPlayer(socket) // Call the parent method
    result && this.handleJudgeDisconnect()
    return result
  }

  private setStatus(status: TRoomStatus) {
    this.status = status
    this.clearTimer()

    const autoplayStatuses = ['playing', 'judging', 'results']

    // the +2 is to give some time for the client to render the status change
    const timeInMs = (this.time + 2) * 1000

    if (autoplayStatuses.includes(status)) {
      this.timer = setTimeout(() => {
        this.autoPlay()
      }, timeInMs)
    }

    this.broadcastState()
  }

  private clearTimer() {
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }
  }

  private autoPlay() {
    const statusActions: { [key in TRoomStatus]?: () => void } = {
      playing: () => this.autoPlayPlaying(),
      judging: () => this.autoPlayJudging(),
      results: () => this.autoPlayResults(),
    }

    const action = statusActions[this.status]

    if (!action)
      return console.warn(`No autoplay action for status: ${this.status}`)

    action()
  }

  private autoPlayPlaying() {
    console.log('AUTO >>> autoPlayPlaying')
    // Get all the players that didn't play yet
    const playersThatDidntPlay = this.players.filter(
      (p) => p.status === 'pending' && !p.isOffline
    )

    //get the number of cards each player need to select
    const cardsPerPlayer = this.currentQuestionCard?.spaces || 1

    // Select random cards from each player
    playersThatDidntPlay.forEach((player) => {
      // Select random cards from the player hand
      const randomCards = this.selectRandomCards(player.cards, cardsPerPlayer)
      this.playerSelection(randomCards, player.socketId)
    })
  }

  private async autoPlayJudging() {
    let nextCardsExist = true

    const timeInMs = this.time * 1000
    // keep requesting next card until no next card
    while (nextCardsExist) {
      nextCardsExist = this.showNextCard()
      await delay(timeInMs)
    }

    this.seeAllRoundAnswers()
    await delay(timeInMs)
    // Select the winning player after going through all cards
    const notJudgePlayers = this.players.filter(
      (p) => p.id !== this.judge?.id && !p.isOffline
    )
    const randomPlayerIndex = Math.floor(Math.random() * notJudgePlayers.length)
    const randomPlayer = notJudgePlayers[randomPlayerIndex]
    const winningPlayerId = randomPlayer.id

    this.judgeSelection(winningPlayerId)
  }

  // Method to check if there are next cards available
  private checkNextCardsExist(): boolean {
    const { hasNext } = this.getNextPlayerCardsResults()
    return hasNext
  }

  private autoPlayResults() {
    this.nextRound()
  }

  private selectRandomCards(cards: ICard[], count: number): ICard[] {
    const randomCards: ICard[] = []
    for (let i = 0; i < count; i++) {
      const randomIndex = Math.floor(Math.random() * cards.length)
      randomCards.push(cards[randomIndex])
    }
    return randomCards
  }

  private handleJudgeDisconnect(): void {
    if (this.judge && this.judge.isOffline) {
      // If the judge disconnects, skip to the next round
      this.nextRound()
      // Emit a message
      this.broadcast('message:notify', 'Judge disconnected. Skipping round.')
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

  requestNextCard(): void {
    console.log('>>> requesting next card')
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

  showNextCard(): boolean {
    console.log('>>> showing next card')
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
    return hasNext
  }

  seeAllRoundAnswers(): void {
    console.log('>>> seeing all round answers')
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

    if (this.decks.length < 1) {
      console.log('>>> no decks selected')
      this.startingStatusUpdate('>>> no decks selected')
      socket.emit('game:error', {
        message: 'Select at least one deck to start the game.',
        error: 'NO_DECKS_SELECTED',
      })
      return
    }

    this.setStatus('starting')
    // this.status = 'starting'
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

    // Add a round here
    if (this.judge && this.currentQuestionCard) {
      this.addRound(this.currentQuestionCard, this.judge)
    }

    // Set the player statuses
    for (let player of this.players) {
      player.status = player === this.judge ? 'waiting' : 'pending'
    }

    // setTimeout(() => {
    // this.status = 'playing'
    this.setStatus('playing')
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
      do {
        this.currentJudgeIndex =
          (this.currentJudgeIndex + 1) % this.players.length
      } while (this.players[this.currentJudgeIndex].isOffline)

      this.judge = this.players[this.currentJudgeIndex]

      // Reset hasSubmittedCards for all players
      this.players.forEach((player) => (player.hasSubmittedCards = false))
    } else {
      console.error(
        'Cannot select a judge, no players available or current judge index is null'
      )
    }

    // this.status = 'playing'
    this.setStatus('playing')
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

  resetRoom(): void {
    // this.status = 'waiting'
    this.setStatus('waiting')
    this.judge = null
    this.currentJudgeIndex = null
    this.currentQuestionCard = null
    this.rounds = []
    this.availableQuestionCards = []
    this.availableAnswerCards = []
    this.resetAllGamePlayers()
    this.updatePlayerStatuses()
    this.broadcastState()
  }

  resetAllGamePlayers() {
    this.players.forEach((player) => {
      player.cards = []
      player.score = 0
      player.status = 'pending'
      player.hasSubmittedCards = false
    })
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
        // this.status = 'finished'
        this.setStatus('finished')
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
        isOffline: player.isOffline,
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
      rounds: this.status === 'finished' ? this.rounds : undefined,
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

  judgeSelection(winningPlayerId: string): void {
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

    // this.status = 'results'
    this.setStatus('results')
    this.broadcastState()
  }

  // playerSelection(selectedCards: ICardAnswer[], socket: Socket): void {
  //   const player = this.getPlayer(socket)
  //   if (!player) return

  //   this.removePlayerCards(player, selectedCards)
  //   this.storeRoundCards(player, selectedCards)

  //   player.hasSubmittedCards = true
  //   this.updatePlayerStatuses()

  //   if (this.allPlayersSubmittedCards()) {
  //     // this.status = 'judging'
  //     this.setStatus('judging')
  //     this.updatePlayerStatuses()
  //   }

  //   this.notifyPlayerCards()
  //   this.broadcastState()
  // }
  playerSelection(selectedCards: ICardAnswer[], socketId: string): void {
    console.log('>>> player selection', selectedCards)
    const player = this.getPlayer(socketId)
    if (!player) return

    this.removePlayerCards(player, selectedCards)
    this.storeRoundCards(player, selectedCards)

    player.hasSubmittedCards = true
    this.updatePlayerStatuses()

    if (this.allPlayersSubmittedCards()) {
      // this.status = 'judging'
      this.setStatus('judging')
      this.updatePlayerStatuses()
    }

    this.notifyPlayerCards()
    this.broadcastState()
  }

  getPlayer(socketId: string): GamePlayer | undefined {
    return this.players.find((p) => p.socketId === socketId)
  }

  private removePlayerCards(
    player: GamePlayer,
    selectedCards: ICardAnswer[]
  ): void {
    const selectedCardTexts = new Set(selectedCards.map((card) => card.text))
    player.cards = player.cards.filter(
      (card) => !selectedCardTexts.has(card.text)
    )
  }

  private storeRoundCards(
    player: GamePlayer,
    selectedCards: ICardAnswer[]
  ): void {
    if (this.rounds.length > 0) {
      this.rounds[this.rounds.length - 1].answerCards[player.id] = selectedCards
    }
  }

  private allPlayersSubmittedCards(): boolean {
    return this.players.every(
      (p) => p.isOffline || p === this.judge || p.hasSubmittedCards
    )
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
