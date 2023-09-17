import {
  MessageType,
  GameMessagePayloads,
  JudgeDecisionPayload,
  PlayerSelectionPayload,
  AdminKickPlayerPayload,
  RoomStatus,
  QuestionCard,
  AnswerCard,
} from "../../shared/types";

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

type HandlerFunction<T> = (client: Client, data: T) => void;

type MessageHandlers = {
  [key in MessageType]: HandlerFunction<GameMessagePayloads[key]>;
};

export class MyRoom extends Room<MyRoomState> {
  maxClients = 4;

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

    console.log(result.data.username, "joined!");
    const {username, pictureUrl} = result.data;

    // Create a new player instance and set its properties
    const newPlayer = new PlayerSchema();
    newPlayer.id = client.sessionId;
    newPlayer.username = username;
    newPlayer.pictureUrl = pictureUrl;

    // Add the player to the players list
    this.state.players.set(client.sessionId, newPlayer);

    // If this is the first player to join, set them as the room leader
    if (this.state.players.size === 1) {
      this.state.leader = newPlayer.id;
    }

    client.send("room:joinedRoom", this.roomId);
  }

  onLeave(client: Client, consented: boolean) {
    console.log(client.sessionId, "left!");
    console.log("consented", consented);
    if (consented) {
      this.handleConsentedLeave(client);
      return;
    }
    this.handleUnintentionalDisconnection(client);
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }

  /// end of colyseus lifecycle methods

  private set roomSize(size: number) {
    this.state.config.roomSize = size;
    this.maxClients = size;
  }

  private get roomSize(): number {
    return this.state.config.roomSize;
  }

  private handleConsentedLeave(client: Client) {
    const playerLeaving = this.state.players.get(client.sessionId);

    if (!playerLeaving) return;

    this.state.players.delete(client.sessionId);

    // If the player leaving is not the current leader, nothing else needs to be done
    if (playerLeaving.id !== this.state.leader) return;

    // If there are still players left, assign leadership to the first player in the players map
    if (this.state.players.size > 0) {
      this.state.leader = this.state.players.values().next().value.id;
      return;
    }

    // If no players are left, disconnect the room
    this.disconnect();
  }

  private handleUnintentionalDisconnection(client: Client) {
    // TODO: handle unintentional disconnection
    this.handleConsentedLeave(client);
    return;
    // const secondsToPlayerRemoval = 10;
    // const millisecondsToPlayerRemoval = secondsToPlayerRemoval * 1000;

    // const timeout = setTimeout(() => {
    //   this.state.players.delete(client.sessionId);
    // }, millisecondsToPlayerRemoval);

    // const player = this.state.players.get(client.sessionId);
    // if (player) {
    //   player.timeout = timeout;
    // }
  }
  private throwError(client: Client, message: string) {
    console.error(message);
    client.send("game:error", message);
  }

  private async handleStartGame(client: Client) {
    console.log(">> starting game...");

    if (this.state.config.availableDecks.length < 1) {
      console.log(">>> no decks selected");
      this.startingStatusUpdate(">>> no decks selected");
      this.throwError(client, "No decks selected");
      return;
    }

    this.setStatus("starting");

    // this.selectJudge();
    const firstJudge = this.returnRandomPlayerId();
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
      playerData.status = playerData.id === this.state.judge ? "waiting" : "pending";
    }

    this.setStatus("playing");
  }

  @AdminOnly
  private handleAdmKickPlayer(client: Client, data: AdminKickPlayerPayload) {
    //TODO: make a button on the client to kick a player
    console.log(">> kicking player...");
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
    //first check for a winner
    if (this.checkForWinner()) {
      return;
    }
    console.log(">> starting next round...");

    this.setStatus("starting");

    this.startingStatusUpdate(">>> choosing the next judge...");
    const newJudgeId = this.getNextJudgeId();
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
      playerData.status = playerData.id === this.state.judge ? "waiting" : "pending";
      playerData.hasSubmittedCards = false;
    }

    this.setStatus("playing");
  }

  private async handleNextRound(_client: Client, _data: null) {
    await this.skipToNextRound();
  }

  private async handleWinner() {
    console.log(">> handling winner...");
    this.setStatus("finished");
    //reset players statuses
    for (const [_id, playerData] of this.state.players) {
      playerData.status = "pending";
    }
    console.log(`>>> winner is ${this.state.players.get(this.state.judge)?.username}`);
  }

  private checkForWinner() {
    for (const [_id, playerData] of this.state.players) {
      if (playerData.score >= this.state.config.scoreToWin) {
        this.handleWinner();
        return true;
      }
    }
    return false;
  }

  private async handleEndGame(client: Client, _data: null) {
    console.log(">> ending game...");
  }

  private async handleStartNewGame(client: Client, _data: null) {
    console.log(">> starting new game...");
  }
  private async handleBackToLobby(client: Client, _data: null) {
    console.log(">> returning to lobby...");
  }

  private addRound(questionCard?: QuestionCardSchema, judge?: string): void {
    const newRound = createEmptyRound();

    if (questionCard) {
      newRound.questionCard = questionCard;
    }
    if (judge) {
      newRound.judge = judge;
    }

    this.state.rounds.push(newRound);
  }

  private returnRandomPlayerId() {
    const playersArray = Array.from(this.state.players.values());

    if (playersArray.length > 0) {
      const randomIndex = Math.floor(Math.random() * playersArray.length);
      return playersArray[randomIndex].id;
    }
  }

  private getNextJudgeId(): string {
    const playersArray = Array.from(this.state.players.values());

    if (playersArray.length > 0) {
      const currentJudgeIndex = playersArray.findIndex(player => player.id === this.state.judge);
      const nextJudgeIndex = (currentJudgeIndex + 1) % playersArray.length;
      return playersArray[nextJudgeIndex].id;
    }
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
      this.startingStatusUpdate(">>> no question card found");
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

  private get playersCount(): number {
    return this.state.players.size;
  }

  private async dealAnswerCardsForEveryoneLessTheJudge(judgeId: string, questionSpaces: number) {
    console.log(">>> deal cards to players: START");
    const players = Array.from(this.state.players.values());

    // here is how many players are in the room
    const playersCount = this.playersCount;

    const MINIMUM_CARDS_PER_PLAYER = 5;
    // how many cards the player should have in their hands
    const shouldHaveCardsCount = MINIMUM_CARDS_PER_PLAYER + questionSpaces;

    //then count how many cards are in the players hands so we dont request more than we need - ignore the judge
    const cardsInHandsCount = players.reduce((acc, player) => {
      if (player.id === judgeId) return acc;
      return acc + player.cards.length;
    }, 0);

    // now calculate how many cards we need to request, after the players have selected the cards they need to stay with at least 5 cards in their hands
    const cardsToRequestCount = playersCount * (shouldHaveCardsCount - cardsInHandsCount);

    console.log("<<< cardsToRequestCount", cardsToRequestCount);

    const decksIds = this.state.config.availableDecks.map(deck => deck.id);
    const blacklistCardIds = this.state.usedAnswerCards.map(card => card.id);

    const result = await getRandomAnswerCardsFromDecks(decksIds, blacklistCardIds, cardsToRequestCount);

    if (!result.answerCards) {
      console.error(">>> no answer cards found");
      this.startingStatusUpdate(">>> no answer cards found");
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

      // now we need to add the cards to the player
      player.addCardsToPlayerHand(cardsToGive);

      // now we need to add the cards to the used cards list
      this.updateUsedAnswerCardsForTheRound(cardsToGive);
    });

    console.log(">>> deal cards to players: END");
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
    console.log(">>> autoGoToNextRoundOnTheResultScreen");
    this.skipToNextRound();
  }

  private autoPlayJudgingStatus() {
    const currentRound = this.state.rounds[this.state.rounds.length - 1];

    if (!currentRound.allCardsRevealed) {
      this.setStatus("judging");
      console.log(">>> autoPlayNextCard");
      this.goToNextCard();
      return;
    }
    console.log(">>> Select a Winner of the round");

    const judgeClient = this.clients.find(client => client.sessionId === this.state.judge);

    const playerIds = Array.from(currentRound.answerCards.keys());

    const randomWinnerFromPlayers = playerIds[Math.floor(Math.random() * playerIds.length)];

    const payload: JudgeDecisionPayload = {
      winner: randomWinnerFromPlayers,
    };

    this.handleJudgeDecision(judgeClient, payload);
  }

  private autoSelectAnswerCardForAllPlayersLeft() {
    // BUG: The random cards sometimes are the same card multiple times. Fix this
    console.log(">>> autoSelectAnswerCardForAllPlayersLeft");
    // return first if the status is not playing
    if (this.state.roomStatus !== "playing") {
      return;
    }
    // get the players that not have selected yet
    const players = Array.from(this.state.players.values()).filter(player => !player.hasSubmittedCards);

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

      const playerClient = this.clients.find(client => client.sessionId === player.id);

      const payload: PlayerSelectionPayload = {
        selection: cardsPayload,
      };
      this.handlePlayerSelection(playerClient, payload);
    });
  }

  private startingStatusUpdate(message: string): void {
    console.log(">>> startingStatusUpdate");
    this.broadcast("message:status", message);
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

  private handlePlayerSelection(client: Client, selectedCards: PlayerSelectionPayload) {
    // Exit early if the client is the judge
    if (this.state.judge === client.sessionId) {
      return;
    }

    // Exit early if the client is not in the room
    if (!this.state.players.has(client.sessionId)) {
      return;
    }

    // Exit early if the player has already selected cards
    if (this.state.players.get(client.sessionId).hasSubmittedCards) {
      return;
    }

    // Validate the incoming data using the Zod schema
    const validationResult = parseAndHandleError(playerSelectionPayloadSchema, selectedCards);

    // Handle validation failure
    if (!validationResult.success) {
      this.throwError(client, `Invalid selection data: ${validationResult.errorMessage}`);
      return;
    }

    // get the player
    const player = this.state.players.get(client.sessionId);

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
    currentRound.answerCards.set(client.sessionId, answerCardArray);

    player.status = "done";
    const playersList = [...this.state.players.values()];

    const allPlayersDone = this.checkAllPlayersDone(playersList);
    if (allPlayersDone) {
      this.handleAllPlayersDone();
    }
  }

  private checkAllPlayersDone(playersList: PlayerSchema[]) {
    const allPlayersDone = playersList.every(player => {
      if (player.id === this.state.judge) {
        return true;
      }
      return player.status === "done";
    });

    return allPlayersDone;
  }

  private handleAllPlayersDone() {
    const playersList = [...this.state.players.values()];

    playersList.forEach(player => {
      if (player.id === this.state.judge) {
        return;
      }

      // get the cards the player has selected
      const selectedCards = this.state.rounds[this.state.rounds.length - 1].answerCards.get(player.id);

      player.removeCardsFromPlayerHand(selectedCards.cards);
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
    console.log(">>> handleRequestNextCard");

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
    // Exit early if the client is not the judge
    if (this.state.judge !== client.sessionId) {
      return;
    }

    // Exit early if the round is not in the judging status
    if (this.state.roomStatus !== "judging") {
      return;
    }

    // Validate the incoming data using the Zod schema
    const validationResult = parseAndHandleError(judgeDecisionPayloadSchema, data);

    // Handle validation failure
    if (!validationResult.success) {
      this.throwError(client, `Invalid selection data: ${validationResult.errorMessage}`);
      return;
    }

    // Get the current round
    const currentRound = this.state.rounds[this.state.rounds.length - 1];

    // Get the winner's id
    const winnerId = validationResult.data.winner;

    // Update the score for the winner and set the round winner
    this.setWinnerOfRound(winnerId, currentRound);

    // Set the room status to round end
    this.setStatus("results");
  }

  private setWinnerOfRound(winnerId: string, round: RoundSchema) {
    // Get the winner player
    const winner = this.state.players.get(winnerId);

    // Update the score for the winner
    winner.score += 1;

    // Set the round winner
    round.winner = winnerId;
  }

  ///Util methods
  public handleDevSaveSnapshot(_client: Client, _data: null) {
    const snapshot = this.state;
    const stringData = JSON.stringify(snapshot, null, 2); // The last two arguments add formatting to the output file
    fs.writeFileSync("snapshot.json", stringData, "utf-8"); // Writing the data to 'snapshot.json'
    console.log(">> Saved snapshot to snapshot.json");
  }

  public handleDevLoadSnapshot(_client: Client, _data: null) {
    if (fs.existsSync("snapshot.json")) {
      const rawData = fs.readFileSync("snapshot.json", "utf-8");
      const parsedSnapshot = JSON.parse(rawData);

      console.log("typeof rawData", typeof rawData);
      console.log("typeof parsedSnapshot", typeof parsedSnapshot);

      // // Transform parsedSnapshot to include Maps
      // const transformedState = transformToOriginalState(parsedSnapshot);

      //get the current players list
      const currentPlayers = this.state.players;
      const playersInSnapshot = parsedSnapshot.players;

      const currentPlayersIds = [...currentPlayers.values()].map(player => player.id);
      const playersInSnapshotIds = Object.keys(playersInSnapshot);

      console.log(">> currentPlayers size", currentPlayersIds);
      console.log(">> playersInSnapshot size", playersInSnapshotIds);
      // check if the the players size is the same
      if (currentPlayers.size !== Object.keys(playersInSnapshot).length) {
        throw new Error(">> Players size is not the same");
      }

      console.log(">> Before: ", rawData);
      // replace in the raw data the players ids with the new ones
      let transformedState = "";
      currentPlayersIds.forEach((playerId, index) => {
        console.log(">> playerId", playerId);
        console.log(">> playersInSnapshotIds[index]", playersInSnapshotIds[index]);
        const regex = new RegExp(playersInSnapshotIds[index], "g");
        transformedState = rawData.replace(regex, playerId);
      });
      console.log(">> After: ", transformedState);

      // Now, you can safely set the state
      // this.setState(transformedState);
      console.log(">> Loaded snapshot from snapshot.json");
    }
  }
}