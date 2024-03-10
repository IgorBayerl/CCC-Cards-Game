import {
  MessageType,
  GameMessagePayloads,
  JudgeDecisionPayload,
  PlayerSelectionPayload,
  AdminKickPlayerPayload,
  RoomStatus,
  QuestionCard,
  AnswerCard,
} from "@ccc-cards-game/types";

import fs from "fs";

import {Room, Client} from "@colyseus/core";
import {PlayerSchema, DeckSchema, MyRoomState, QuestionCardSchema, AnswerCardSchema} from "./schema";
import {
  ISetConfigData,
  judgeDecisionPayloadSchema,
  playerSelectionPayloadSchema,
  setConfigData,
} from "./validation/handlers";
import {IJoinRequest, onJoinOptions} from "./validation/lifecycle";
import {ArraySchema} from "@colyseus/schema";
import {createEmptyRound, AnswerCardsArraySchema, RoundSchema} from "./schema/Round";
import {parseAndHandleError} from "../lib/extractErrorMessage";
import {getRandomAnswerCardsFromDecks, getRandomQuestionCardFromDecks} from "../lib/deckUtils";
import {AdminOnly} from "../lib/utils";
import logger from "../lib/loggerConfig";

type HandlerFunction<T> = (client: Client, data: T) => void;

type MessageHandlers = {
  [key in MessageType]: HandlerFunction<GameMessagePayloads[key]>;
};

export class MyRoom extends Room<MyRoomState> {
  maxClients = 14;

  private timer: NodeJS.Timeout | null = null;

  private handlers: MessageHandlers = {
    [MessageType.ADMIN_START]: this.handleStartGame.bind(this),
    [MessageType.ADMIN_NEXT_ROUND]: this.handleNextRound.bind(this),
    [MessageType.ADMIN_END]: this.handleEndGame.bind(this),
    [MessageType.ADMIN_START_NEW_GAME]: this.handleStartNewGame.bind(this),
    [MessageType.ADMIN_BACK_TO_LOBBY]: this.handleBackToLobby.bind(this),
    [MessageType.ADMIN_KICK_PLAYER]: this.handleAdmKickPlayer.bind(this),
    [MessageType.SET_CONFIG]: this.handleSetConfig.bind(this),
    [MessageType.PLAYER_SELECTION]: this.handlePlayerSelection.bind(this),
    [MessageType.REQUEST_NEXT_CARD]: this.handleRequestNextCard.bind(this),
    [MessageType.JUDGE_DECISION]: this.handleJudgeDecision.bind(this),
    [MessageType.DEV_SAVE_SNAPSHOT]: this.handleDevSaveSnapshot.bind(this),
    [MessageType.DEV_LOAD_SNAPSHOT]: this.handleDevLoadSnapshot.bind(this),
  };

  private bindHandlerToMessage<T extends MessageType>(key: T) {
    const specificHandler = this.handlers[key];
    this.onMessage(key, specificHandler);
  }

  public isAdmin(client: Client) {
    return client.sessionId === this.state.leader;
  }

  onCreate(_options: any) {
    this.setState(new MyRoomState());

    this.roomSize = this.maxClients;

    // Bind handlers to message types
    for (const key in MessageType) {
      this.bindHandlerToMessage(MessageType[key as keyof typeof MessageType]);
    }
  }

  onJoin(client: Client, options?: IJoinRequest, auth?: any) {
    const result = onJoinOptions.safeParse(options);
    if (!result.success) {
      client.leave(1000, "Invalid join request");
      return;
    }

    logger.info(`${result.data.username} joined!`);
    const {username, pictureUrl, oldPlayerId} = result.data;

    // Create a new player instance and set its properties
    const newPlayer = new PlayerSchema();
    newPlayer.id = client.sessionId;
    newPlayer.username = username;
    newPlayer.pictureUrl = pictureUrl;

    const isMidGame = this.state.roomStatus !== "waiting";
    if (isMidGame) {
      newPlayer.isWaitingForNextRound = true;
    }

    // Add the player to the players list
    this.state.players.set(client.sessionId, newPlayer);

    // If this is the first player to join, set them as the room leader
    if (this.state.players.size === 1) {
      this.state.leader = newPlayer.id;
    }

    if (oldPlayerId) {
      if (this.canReconnect(client, oldPlayerId)) {
        this.handleReconnect(client, oldPlayerId);
      }
    }

    client.send("room:joinedRoom", this.roomId);
  }

  private canReconnect(client: Client, oldPlayerId: string) {
    // verify if the old player is in the room
    const isOldPlayerInRoom = this.state.players.has(oldPlayerId);
    if (!isOldPlayerInRoom) return false;

    // verify if the old player is offline
    const oldPlayer = this.state.players.get(oldPlayerId);
    if (!oldPlayer) return false;

    const isOldPlayerOffline = oldPlayer.isOffline;
    if (!isOldPlayerOffline) return false;

    return true;
  }

  onLeave(client: Client, consented: boolean) {
    logger.info(
      `${this.state.players.get(client.sessionId)?.username} left the room ${this.roomId} ${
        consented ? "consented" : "unintentionally"
      }`,
    );

    this.state.disconnectPlayer(client.sessionId);
  }

  onDispose() {
    logger.info(`room ${this.roomId} disposing...`);
  }

  /// end of colyseus lifecycle methods

  /**
   * Handles the player reconnecting in the room
   */
  private handleReconnect(client: Client, oldPlayerId: string) {
    // check if the game already started
    // if is in the middle of a round and the player was really offline from the beggining og the round
    // the player will need to wait until the next round start to reconnect properly
    // if the player has quited in the beguinning of a round, was set as bot, and returned at the same round, it will just reconnect normaly
    // the player can only reconnect when the room status is "waiting" | "judging" | "results" | "finished"
    // if the room status is "playing" the player will be "on hold" untill the status change to a status that can be connected

    logger.info(`Player ${oldPlayerId} is reconnecting!`);
    // TODO: Implement this in the frontend
    const newPlayer = this.state.players.get(client.sessionId);
    const oldPlayer = this.state.players.get(oldPlayerId);

    if (!newPlayer || !oldPlayer) return;

    // clone the old player's properties to the new player
    newPlayer.cloneFrom(oldPlayer);

    // delete the old player
    this.state.players.delete(oldPlayerId);

    this.state.updatePlayerIdInRounds(oldPlayerId, client.sessionId);
    logger.info(`${newPlayer.username} reconnected!`);
  }

  private set roomSize(size: number) {
    this.state.config.roomSize = size;
    this.maxClients = size;
  }

  private get roomSize(): number {
    return this.state.config.roomSize;
  }

  private handleUnintentionalDisconnection(client: Client) {
    //set the status to disconnected
    this.state.disconnectPlayer(client.sessionId);

    // handle the game when someone disconnects
    // this.handleGamePlayerDisconnectMidGame(playerLeaving);

    return;
  }

  /**
   * When the player disconnects mid game, he will become a bot, until the end of the round, so the other players will not fell bored with the round skipping.
   * @param player
   */
  private setPlayerAsBot(player: PlayerSchema) {
    player.isBot = true;
    player.isOffline = true;
  }

  private throwError(client: Client, message: string) {
    logger.error(message);
    client.send("game:error", message);
  }

  private sendMessageToAllPlayers(message: string) {
    this.broadcast("game:notify", message);
  }

  private async handleStartGame(client: Client) {
    logger.info(">> starting game...");

    if (this.state.config.availableDecks.length < 1) {
      logger.info(">>> no decks selected");
      this.throwError(client, "No decks selected");
      return;
    }

    this.setStatus("starting");

    // this.selectJudge();
    const firstJudge = this.state.randomOnlinePlayerId;
    this.state.judge = firstJudge;

    const questionCard = await this.getNextQuestionCard();
    this.state.currentQuestionCard = questionCard;

    await this.dealAnswerCardsForEveryoneLessTheJudge(firstJudge, questionCard.spaces);

    const question = this.state.currentQuestionCard;
    if (firstJudge && question) {
      this.addRound(question, firstJudge);
    }

    // Set the player statuses to default
    for (const [_id, playerData] of this.state.players) {
      if (playerData.isOffline) continue;
      playerData.status = playerData.id === this.state.judge ? "waiting" : "pending";
    }

    this.setStatus("playing");
  }

  @AdminOnly
  private handleAdmKickPlayer(client: Client, data: AdminKickPlayerPayload) {
    //TODO: make a button on the client to kick a player
    logger.info(">> kicking player...");
    const {playerId} = data;

    const player = this.state.players.get(playerId);
    if (!player) {
      this.throwError(client, "Player not found");
      return;
    }

    this.state.players.delete(playerId);
    const targetClient = this.clients.find(c => c.sessionId === playerId);
    if (targetClient) {
      targetClient.leave(1000, "You were kicked by the admin");
    }
  }

  private async skipToNextRound() {
    if (this.state.thereIsAWinner) {
      this.handleWinner();
      return;
    }

    this.state.clearBotPlayers();
    if (this.state.players.size < 2) {
      logger.info(">>> not enough players");
      this.state.resetGame();
      this.broadcast("game:notify", "Not enough players, at least 2 players are required");
      return;
    }

    logger.info(">> Starting next round...");

    this.setStatus("starting");

    const newJudgeId = this.state.getNextJudgeId;
    this.state.judge = newJudgeId;

    const questionCard = await this.getNextQuestionCard();
    this.state.currentQuestionCard = questionCard;

    await this.dealAnswerCardsForEveryoneLessTheJudge(newJudgeId, questionCard.spaces);

    const question = this.state.currentQuestionCard;
    if (newJudgeId && question) {
      this.addRound(question, newJudgeId);
    }

    // Set the player statuses to default and hasSubmittedCards to false
    for (const [_id, playerData] of this.state.players) {
      if (playerData.isOffline) continue;
      playerData.status = playerData.id === this.state.judge ? "waiting" : "pending";
      playerData.hasSubmittedCards = false;
      playerData.isWaitingForNextRound = false;
    }

    this.setStatus("playing");
  }

  private async handleNextRound(client: Client, _data: null) {
    await this.skipToNextRound();
  }

  private async handleWinner() {
    logger.info(">> handling winner...");
    this.setStatus("finished");
    //reset players statuses
    for (const [_id, playerData] of this.state.players) {
      if (playerData.isOffline) continue;
      playerData.status = "pending";
    }
    logger.info(`>>> winner is ${this.state.players.get(this.state.judge)?.username}`);
  }

  private async handleEndGame(_client: Client, _data: null) {
    logger.info(">> ending game...");
  }

  private async handleStartNewGame(client: Client, _data: null) {
    logger.info(">> starting new game...");
    this.state.resetGame();
    this.handleStartGame(client);
  }
  private async handleBackToLobby(_client: Client, _data: null) {
    logger.info(">> returning to lobby...");
    this.state.resetGame();
  }

  private addRound(questionCard?: QuestionCardSchema, judge?: string): void {
    if (!questionCard || !judge) {
      logger.error(">>> question card or judge is missing");
      return;
    }

    const newRound = createEmptyRound();

    newRound.questionCard = questionCard;
    newRound.judge = judge;

    this.state.rounds.push(newRound);
  }

  /**
   * Selects a random question card from the available decks.
   */
  private async getNextQuestionCard() {
    // will call the deck utils to select a random question card

    const deckIds = this.state.config.availableDecks.map(deck => deck.id);
    const blacklistCardIds = this.state.usedQuestionCards.map(card => card.id);

    const questionCard = await getRandomQuestionCardFromDecks(deckIds, blacklistCardIds);

    if (!questionCard.questionCard) {
      console.error(">>> no question card found");
      return;
    }

    this.updateUsedQuestionCardsForTheRound(questionCard.questionCard);
    return questionCard.questionCard;
  }

  private updateUsedQuestionCardsForTheRound(questionCard: QuestionCardSchema) {
    this.state.usedQuestionCards.push(questionCard);
  }

  private updateUsedAnswerCardsForTheRound(answerCards: AnswerCard[]) {
    this.state.usedAnswerCards.push(...(answerCards as AnswerCardSchema[]));
  }

  private async dealAnswerCardsForEveryoneLessTheJudge(judgeId: string, questionSpaces: number) {
    logger.info(">>> deal cards to players: START");
    // const players = Array.from(this.state.players.values());
    const players = this.state.playersArray;

    // here is how many players are in the room
    const playersCount = players.length - 1;

    const MINIMUM_CARDS_PER_PLAYER = 5;
    // how many cards the player should have in their hands
    const shouldHaveCardsCount = MINIMUM_CARDS_PER_PLAYER + questionSpaces;

    //then count how many cards are in the players hands so we dont request more than we need - ignore the judge
    const cardsInHandsCount = players.reduce((acc, player) => {
      if (player.id === judgeId) return acc;
      return acc + player.cards.length;
    }, 0);

    // now calculate how many cards we need to request, after the players have selected the cards they need to stay with at least 5 cards in their hands
    const cardsToRequestCount = shouldHaveCardsCount * playersCount - cardsInHandsCount;

    logger.info(
      `>>> cardsToRequestCount: ${cardsToRequestCount} = ${shouldHaveCardsCount} * ${playersCount} - ${cardsInHandsCount}`,
    );

    const decksIds = this.state.config.availableDecks.map(deck => deck.id);
    const blacklistCardIds = this.state.usedAnswerCards.map(card => card.id);

    const result = await getRandomAnswerCardsFromDecks(decksIds, blacklistCardIds, cardsToRequestCount);

    if (!result.answerCards) {
      console.error(">>> no answer cards found");
      return;
    }

    // now we need to deal the cards to the players
    // we will do this by looping through the players and giving them the cards they need
    players.forEach(player => {
      // if the player is the judge, we dont need to give them cards
      if (player.id === judgeId) {
        return;
      }

      // how many cards the player needs to have in their hands
      const cardsNeededCount = shouldHaveCardsCount - player.cards.length;

      // now we need to get the cards from the result
      const cardsToGive = result.answerCards.splice(0, cardsNeededCount);

      logger.info(
        `The player ${player.username}, have ${player.cards.length} and will receive ${cardsToGive.length} cards`,
      );

      // now we need to add the cards to the player
      player.addCardsToPlayerHand(cardsToGive);

      // now we need to add the cards to the used cards list
      this.updateUsedAnswerCardsForTheRound(cardsToGive);
    });

    logger.info(">>> deal cards to players: END");
  }

  private setStatus(status: RoomStatus) {
    // reset the timer when the status changes
    clearTimeout(this.timer);

    const autoplayStatuses = ["playing", "judging", "results"];

    const timeToAutoplay = this.state.config.roundTime;

    const EXTRA_TIME_IN_SECONDS = 1;
    // the +2 is to give some time for the client to render the status change
    const timeInMs = (timeToAutoplay + EXTRA_TIME_IN_SECONDS) * 1000;

    if (autoplayStatuses.includes(status)) {
      this.timer = setTimeout(() => {
        this.autoPlay(status);
      }, timeInMs);
    }

    this.state.roomStatus = status;
  }

  private autoPlay(status: RoomStatus) {
    const autoplayActions: Record<RoomStatus, () => void> = {
      playing: this.autoSelectAnswerCardForAllPlayersLeft.bind(this),
      judging: this.autoPlayJudgingStatus.bind(this),
      results: this.autoGoToNextRoundOnTheResultScreen.bind(this),
      waiting: () => {},
      finished: () => {},
      starting: () => {},
    };

    autoplayActions[status]();
  }

  private autoGoToNextRoundOnTheResultScreen() {
    logger.info(">>> autoGoToNextRoundOnTheResultScreen");
    this.skipToNextRound();
  }

  private autoPlayJudgingStatus() {
    const currentRound = this.state.rounds[this.state.rounds.length - 1];

    if (!currentRound.allCardsRevealed) {
      this.setStatus("judging");
      logger.info(">>> autoPlayNextCard");
      this.goToNextCard();

      return;
    }
    logger.info(">>> Select a Winner of the round");

    const playerIds = Array.from(currentRound.answerCards.keys());

    const randomWinnerFromPlayers = playerIds[Math.floor(Math.random() * playerIds.length)];

    const payload: JudgeDecisionPayload = {
      winner: randomWinnerFromPlayers,
    };

    this.handleJudgeDecisionWithId(this.state.judge, payload);
  }

  private autoSelectAnswerCardForAllPlayersLeft() {
    // BUG: The random cards sometimes are the same card multiple times. Fix this
    logger.info(">>> autoSelectAnswerCardForAllPlayersLeft");
    // return first if the status is not playing
    if (this.state.roomStatus !== "playing") {
      return;
    }
    // get the players that not have selected yet
    const players = this.state.playersArray.filter(player => !player.hasSubmittedCards);

    // if there are no players left, just ignore
    if (players.length === 0) {
      return;
    }

    const roundQuestionSpaces = this.state.currentQuestionCard.spaces;
    players.forEach(player => {
      const cards = player.getRandomAnswers(roundQuestionSpaces);
      const cardsPayload: AnswerCard[] = cards.map(card => ({
        id: card.id,
        text: card.text,
      }));

      // const playerClient = this.clients.find(client => client.sessionId === player.id);

      const payload: PlayerSelectionPayload = {
        selection: cardsPayload,
      };
      /**
       * THe player client is not available if the player is disconnected
       * and is playing as a bot
       */
      this.handlePlayerSelectionWithId(player.id, payload);
      // this.handlePlayerSelectionWithId(playerClient.sessionId, payload);
    });
  }

  @AdminOnly
  private handleSetConfig(client: Client, data: any) {
    // Exit early if the client is not the room leader
    if (this.state.leader !== client.sessionId) {
      return;
    }

    // Validate the incoming data using the Zod schema
    const validationResult = parseAndHandleError(setConfigData, data);

    // Handle validation failure
    if (!validationResult.success) {
      this.throwError(client, `Invalid config data: ${validationResult.errorMessage}`);
      return;
    }

    // Update the room configurations
    this.updateRoomConfig(validationResult.data);

    // Update available decks if provided
    if (data.availableDecks) {
      this.updateAvailableDecks(data.availableDecks);
    }
  }

  // Helper method to update room configurations
  private updateRoomConfig(configData: ISetConfigData) {
    const {roomSize, scoreToWin, roundTime} = configData;

    this.roomSize = roomSize ?? this.roomSize;
    this.state.config.scoreToWin = scoreToWin ?? this.state.config.scoreToWin;
    this.state.config.roundTime = roundTime ?? this.state.config.roundTime;
  }

  // Helper method to update available decks
  private updateAvailableDecks(availableDecks: any[]) {
    const decksSchema = new ArraySchema<DeckSchema>();

    availableDecks.forEach(deck => {
      const deckSchema = new DeckSchema();
      Object.assign(deckSchema, deck);
      decksSchema.push(deckSchema);
    });

    this.state.config.availableDecks = decksSchema;
  }

  /**
   * This comes from the handlers
   * @param client
   * @param selectedCards
   */
  private handlePlayerSelection(client: Client, selectedCards: PlayerSelectionPayload) {
    this.handlePlayerSelectionWithId(client.sessionId, selectedCards);
  }

  /**
   * This comes from the autoplay maybe is a bot
   */
  private handlePlayerSelectionWithId(clientSessionId: string, selectedCards: PlayerSelectionPayload) {
    logger.info(">>> handlePlayerSelectionWithId");
    // Exit early if the client is the judge
    if (this.state.judge === clientSessionId) {
      return;
    }

    // Exit early if the client is not in the room
    if (!this.state.players.has(clientSessionId)) {
      return;
    }

    // Exit early if the player has already selected cards
    if (this.state.players.get(clientSessionId).hasSubmittedCards) {
      return;
    }

    // Validate the incoming data using the Zod schema
    const validationResult = parseAndHandleError(playerSelectionPayloadSchema, selectedCards);

    // Handle validation failure
    if (!validationResult.success) {
      // TODO: FInd a way to do this in the future
      // this.throwError(client, `Invalid selection data: ${validationResult.errorMessage}`);
      return;
    }

    // get the player
    const player = this.state.players.get(clientSessionId);

    // Update the player's hasSubmittedCards to true
    player.hasSubmittedCards = true;

    // Create the answer array for this player - this will be an array with the answer cards objects inside
    const selectedAnswerCards = validationResult.data.selection.map(cardData => {
      const card = new AnswerCardSchema();
      card.id = cardData.id;
      card.text = cardData.text;
      return card;
    });

    // Convert the selected cards to AnswerCardsArraySchema schema
    const answerCardArray = new AnswerCardsArraySchema();
    selectedAnswerCards.forEach(card => answerCardArray.cards.push(card));

    // Get the current round
    const currentRound = this.state.rounds[this.state.rounds.length - 1];

    // Add this array to the round answers map with the player's sessionId as the key
    currentRound.answerCards.set(clientSessionId, answerCardArray);

    player.status = "done";
    const playersList = this.state.playersArray;

    const allPlayersDone = this.checkAllPlayersDone(playersList);
    if (allPlayersDone) {
      this.handleAllPlayersDone();
    }
  }

  private checkAllPlayersDone(playersList: PlayerSchema[]) {
    const allPlayersDone = playersList.every(player => {
      if (!player.isPlayerPlaying) return true;
      if (player.id === this.state.judge) return true;
      return player.status === "done";
    });

    return allPlayersDone;
  }

  private handleAllPlayersDone() {
    const playersList = this.state.playersArray;

    playersList.forEach(player => {
      if (player.id === this.state.judge) {
        return;
      }

      // get the cards the player has selected
      const selectedCards = this.state.rounds[this.state.rounds.length - 1].answerCards.get(player.id);

      if (selectedCards) player.removeCardsFromPlayerHand(selectedCards.cards);
    });
    this.setStatus("judging");
  }

  /**
   * The judge in the judging screen will have a button to request the next card
   * This method will handle that request
   *
   * The method will update the current round
   * this.state.rounds[this.state.rounds.length - 1].currentRevealedId with the next card id
   * And will add the id to the revealedCards array
   * Check if the revealedCards array has all the cards ids
   * If it does, change the round.allCardsRevealed to true
   *
   * @param client
   * @returns
   */
  private handleRequestNextCard(client: Client) {
    logger.info(">>> handleRequestNextCard");

    // Exit early if the client is not the judge
    if (this.state.judge !== client.sessionId) {
      return;
    }
    this.goToNextCard();
  }

  private goToNextCard() {
    // Exit early if the round is not in the judging status
    if (this.state.roomStatus !== "judging") {
      return;
    }
    this.setStatus("judging");

    // Get the current round
    const currentRound = this.state.rounds[this.state.rounds.length - 1];

    // Get the list of answerCard keys that haven't been revealed yet
    const unrevealedCardIds = [...currentRound.answerCards.keys()].filter(
      cardId => !currentRound.revealedCards.includes(cardId),
    );

    // Get the next card id
    const nextCardId = unrevealedCardIds[0];

    // If there is no next card, set allCardsRevealed to true
    if (!nextCardId) {
      currentRound.allCardsRevealed = true;
      return;
    }

    // Add the next card id to the revealed cards
    currentRound.revealedCards.push(nextCardId);

    // Set the currentRevealedId to the next card id
    currentRound.currentRevealedId = nextCardId;
  }

  private handleJudgeDecision(client: Client, data: JudgeDecisionPayload) {
    try {
      this.handleJudgeDecisionWithId(client.sessionId, data);
    } catch (error) {
      if (!(error instanceof Error)) return;
      this.throwError(client, error.message || "Error while handling judge decision");
    }
  }

  private handleJudgeDecisionWithId(clientId: string, data: JudgeDecisionPayload) {
    // Exit early if the client is not the judge
    if (this.state.judge !== clientId) {
      throw new Error("Client is not the judge");
      return;
    }

    // Exit early if the round is not in the judging status
    if (this.state.roomStatus !== "judging") {
      throw new Error("Round is not in the judging status");
      return;
    }

    // Validate the incoming data using the Zod schema
    const validationResult = parseAndHandleError(judgeDecisionPayloadSchema, data);

    // Handle validation failure
    if (!validationResult.success) {
      throw new Error(`Invalid selection data: ${validationResult.errorMessage}`);
      return;
    }

    // Get the current round
    const currentRound = this.state.rounds[this.state.rounds.length - 1];

    // Get the winner's id
    const winnerId = validationResult.data.winner;

    // Update the score for the winner and set the round winner
    this.setRoundWinner(winnerId, currentRound);

    // Set the room status to round end
    this.setStatus("results");
  }

  private setRoundWinner(winnerId: string, round: RoundSchema) {
    const winner = this.state.players.get(winnerId);
    if (!winner) return; //BUG: when the player selects a card, disconnects and reconnects, the id is not the same anymore
    winner.addPoint();
    round.winner = winnerId;
  }

  /**
   * # Save game state snapshot
   * This is a helper method to be used only in development to facilitate testing
   *
   * @todo Implement it
   * @param _client
   * @param _data
   */
  public handleDevSaveSnapshot(_client: Client, _data: null) {
    return;
    const snapshot = this.state;
    const stringData = JSON.stringify(snapshot, null, 2); // The last two arguments add formatting to the output file
    fs.writeFileSync("snapshot.json", stringData, "utf-8"); // Writing the data to 'snapshot.json'
    console.log(">> Saved snapshot to snapshot.json");
  }

  /**
   * # Save game state snapshot
   * This is a helper method to be used only in development to facilitate testing
   *
   * @todo Implement it
   * @param _client
   * @param _data
   */
  public handleDevLoadSnapshot(_client: Client, _data: null) {
    return;
  }
}
