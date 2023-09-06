import {
  MessageType,
  GameMessagePayloads,
  JudgeDecisionPayload,
  PlayerSelectionPayload,
  AdminKickPlayerPayload,
} from "../../shared/types";

import {Room, Client} from "@colyseus/core";
import {PlayerSchema, DeckSchema, MyRoomState, QuestionCardSchema, AnswerCardSchema} from "./schema";
import {ISetConfigData, setConfigData} from "./validation/handlers";
import {IJoinRequest, onJoinOptions} from "./validation/lifecycle";
import {ArraySchema} from "@colyseus/schema";
import {createEmptyRound} from "./schema/Round";
import {RoomStatus} from "./schema/MyRoomState";
import extractErrorMessage, {parseAndHandleError} from "../lib/extractErrorMessage";
import {getRandomAnswerCardsFromDecks, getRandomQuestionCardFromDecks} from "../lib/deckUtils";
import {AdminOnly} from "../lib/utils";

type HandlerFunction<T> = (client: Client, data: T) => void;

type MessageHandlers = {
  [key in MessageType]: HandlerFunction<GameMessagePayloads[key]>;
};

export class MyRoom extends Room<MyRoomState> {
  maxClients = 4;

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
    [MessageType.SEE_ALL_ROUND_ANSWERS]: this.handleSeeAllRoundAnswers.bind(this),
    [MessageType.JUDGE_DECISION]: this.handleJudgeDecision.bind(this),
  };

  private bindHandlerToMessage<T extends MessageType>(key: T) {
    const specificHandler = this.handlers[key];
    this.onMessage(key, specificHandler);
  }

  public isAdmin(client: Client) {
    console.log("STATE CHECK >>> 4 >>>");
    return client.sessionId === this.state.leader;
  }

  onCreate(options: any) {
    this.setState(new MyRoomState());
    console.log("STATE CHECK >>> 1 >>>", this.state.roomStatus);

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

    console.log("STATE CHECK >>> 2 >>>", this.state.roomStatus);

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
    console.log("STATE CHECK >>> 3 >>>", this.state.roomStatus);

    // Send a message to the client with the room room:joinedRoom and the roomId
    console.log("AAAAAAAAAAAAAAAAAA Joined room", this.roomId);
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
    console.log("AQUI >>> handleConsentedLeave 1");
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

    console.log("AQUI >>> handleConsentedLeave 2");

    // If no players are left, disconnect the room
    this.disconnect();
  }

  private handleUnintentionalDisconnection(client: Client) {
    console.log("AQUI >>> handleUnintentionalDisconnection");
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

    this.selectJudge();

    await this.selectQuestionCard();

    await this.dealAnswerCardsForEveryone();

    const judge = this.state.judge;
    const question = this.state.currentQuestionCard;
    if (judge && question) {
      this.addRound(question, judge);
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

  private async handleNextRound(client: Client, _data: null) {}
  private async handleEndGame(client: Client, _data: null) {}
  private async handleStartNewGame(client: Client, _data: null) {}
  private async handleBackToLobby(client: Client, _data: null) {}

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

  /**
   * Selects a random judge from the players MapSchema.
   */
  private selectJudge(): void {
    console.log(">>> choosing a random judge...");
    this.startingStatusUpdate(">>> choosing a random judge...");

    const playersArray = Array.from(this.state.players.values());

    if (playersArray.length > 0) {
      const randomIndex = Math.floor(Math.random() * playersArray.length);
      this.state.judge = playersArray[randomIndex].id;
    }
  }

  /**
   * Selects a random question card from the available decks.
   */
  private async selectQuestionCard(): Promise<void> {
    // will call the deck utils to select a random question card

    const deckIds = this.state.config.availableDecks.map(deck => deck.id);
    const blacklistCardIds = this.state.usedQuestionCards.map(card => card.id);

    const questionCard = await getRandomQuestionCardFromDecks(deckIds, blacklistCardIds);

    if (!questionCard.questionCard) {
      console.error(">>> no question card found");
      this.startingStatusUpdate(">>> no question card found");
      return;
    }

    this.state.currentQuestionCard = questionCard.questionCard;
  }

  private get playersCount(): number {
    return this.state.players.size;
  }

  private async dealAnswerCardsForEveryone(): Promise<void> {
    console.log(">>> deal cards to players: START");
    const players = Array.from(this.state.players.values());

    // here is how many players are in the room
    const playersCount = this.playersCount;

    const MINIMUM_CARDS_PER_PLAYER = 5;
    // how many cards the player should have in their hands
    const shouldHaveCardsCount = MINIMUM_CARDS_PER_PLAYER + this.state.currentQuestionCard.spaces;

    //then count how many cards are in the players hands so we dont request more than we need
    const cardsInHandsCount = players.reduce((acc, player) => {
      return acc + player.cards.length;
    }, 0);

    // now calculate how many cards we need to request, after the players have selected the cards they need to stay with at least 5 cards in their hands
    const cardsToRequestCount = playersCount * (shouldHaveCardsCount - cardsInHandsCount);

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
      // how many cards the player needs to have in their hands
      const cardsNeededCount = shouldHaveCardsCount - player.cards.length;

      // now we need to get the cards from the result
      const cardsToGive = result.answerCards.splice(0, cardsNeededCount);

      // now we need to add the cards to the player
      player.cards.push(...cardsToGive);
    });

    // now we need to add the cards to the used cards list
    this.state.usedAnswerCards.push(...result.answerCards);

    console.log(">>> deal cards to players: END");
  }

  private setStatus(status: RoomStatus) {
    // reset the timer when the status changes

    const autoplayStatuses = ["playing", "judging", "results"];

    // // if the status is results, give only 10 seconds. Otherwise, give the default time
    // const timeByStatus = status === 'results' ? 10 : this.time

    // // the +2 is to give some time for the client to render the status change
    // const timeInMs = (timeByStatus + 2) * 1000

    // if (autoplayStatuses.includes(status)) {
    //   this.timer = setTimeout(() => {
    //     this.autoPlay()
    //   }, timeInMs)
    // }

    this.state.roomStatus = status;
  }

  private startingStatusUpdate(message: string): void {
    console.log(">>> startingStatusUpdate");
    this.broadcast("message:status", message);
  }

  @AdminOnly
  private handleSetConfig(client: Client, data: any) {
    console.log(">>> handleSetConfig");
    console.log("client.sessionId", client.sessionId);
    console.log("this.state.leader", this.state.leader);
    // Exit early if the client is not the room leader
    if (this.state.leader !== client.sessionId) {
      return;
    }

    console.log(">>> handleSetConfig 2");
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

  private handlePlayerSelection(client: Client, selectedCards: PlayerSelectionPayload) {}
  private handleRequestNextCard(client: Client) {}
  private handleSeeAllRoundAnswers(client: Client) {}
  private handleJudgeDecision(client: Client, data: JudgeDecisionPayload) {}
}
