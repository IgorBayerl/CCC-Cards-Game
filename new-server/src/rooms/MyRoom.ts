import {Room, Client} from "@colyseus/core";
import {
  PlayerSchema,
  DeckSchema,
  MyRoomState,
  QuestionCardSchema,
} from "./schema";
import {ISetConfigData, setConfigData} from "./validation/handlers";
import {IJoinRequest, onJoinOptions} from "./validation/lifecycle";
import {ArraySchema} from "@colyseus/schema";
import {TRoomStatus} from "../models/Room";
import {ICardQuestion} from "../models/Deck";
import {createEmptyRound, RoundSchema} from "./schema/Round";
import {z} from "zod";

export class MyRoom extends Room<MyRoomState> {
  maxClients = 4;

  private handlers: {[key: string]: (client: Client, data?: any) => void} = {
    "game:admCommand": this.handleAdmCommand,
    "game:setConfig": this.handleSetConfig,
    "game:playerSelection": this.handlePlayerSelection,
    "game:requestNextCard": this.handleRequestNextCard,
    "game:seeAllRoundAnswers": this.handleSeeAllRoundAnswers,
    "game:judgeDecision": this.handleJudgeDecision,
  };

  private admCommandsHandlers: {
    [key: string]: (client: Client, data?: any) => void;
  } = {
    start: this.handleStartGame,
    // 'next_round': this.handleNextRound,
    // 'start-new-game': this.handleStartNewGame,
    // 'back-to-lobby': this.handleBackToLobby
  };

  /// colyseus lifecycle methods
  onCreate(options: any) {
    this.setState(new MyRoomState());
    console.log("STATE CHECK >>> 1 >>>", this.state.roomStatus);

    this.roomSize = this.maxClients;

    // Bind the handler functions to this context and set up an onMessage callback for each handler
    Object.keys(this.handlers).forEach(key => {
      const boundHandler = this.handlers[key].bind(this);
      this.handlers[key] = boundHandler;
      this.onMessage(key, boundHandler);
    });

    // BIND ADM COMMAND HANDLERS
    Object.keys(this.admCommandsHandlers).forEach(key => {
      const boundHandler = this.admCommandsHandlers[key].bind(this);
      this.admCommandsHandlers[key] = boundHandler;
    });
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

  private handleAdmCommand(client: Client, command: string) {
    console.log("Adm command", command);
    //validate if the client is the room leader
    const isLeader = this.state.leader === client.sessionId;
    if (!isLeader) return;

    const handler = this.admCommandsHandlers[command];
    if (!handler) {
      this.throwError(client, `Invalid command ${command}`);
      return;
    }

    handler(client);
  }

  private handleStartGame(client: Client) {
    console.log(">> starting game...");

    if (this.state.config.availableDecks.length < 1) {
      console.log(">>> no decks selected");
      this.startingStatusUpdate(">>> no decks selected");
      this.throwError(client, "No decks selected");
      return;
    }

    this.setStatus("starting");

    this.selectJudge();

    this.populateCards();

    // this.shuffleCards()

    // this.selectQuestionCard()

    // this.dealAnswerCardsForEveryone()
    const judge = this.state.judge;
    const question = this.state.currentQuestionCard;
    if (judge && question) {
      this.addRound(question, judge);
    }
    // Set the player statuses to default
    for (const [id, playerData] of this.state.players) {
      playerData.status =
        playerData.id === this.state.judge ? "waiting" : "pending";
    }

    this.setStatus("playing");
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
   * Populates the available cards with the selected decks.
   */
  private populateCards(): void {
    // BUG: Fix this populateCards
    console.log(">>> populating the available cards...");
    this.startingStatusUpdate(">>> populating the available cards...");
    // this.availableQuestionCards = []
    // this.availableAnswerCards = []
    // for (const deck of this.decks) {
    //   const deckData = getDeckById(deck.id)
    //   if (!deckData) {
    //     console.error(`Deck with id ${deck.id} not found.`)
    //     continue
    //   }
    //   this.availableQuestionCards.push(...deckData.cards.questions)
    //   this.availableAnswerCards.push(...deckData.cards.answers)
    // }
  }

  private setStatus(status: TRoomStatus) {
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
    this.broadcast("message:status", message);
  }

  private handleSetConfig(client: Client, data: any) {
    // Only allow the room leader to set the configurations
    const isLeader = this.state.leader === client.sessionId;
    if (!isLeader) return;

    console.log("data", data);

    // Validate
    const result = setConfigData.safeParse(data);
    if (!result.success) {
      // @ts-ignore
      console.log(">>>>", result.error);
      // const errorMessage = result.error.issues.map((issue) => issue.message).join(', ');
      const errorMessage = "Invalid config data";
      this.throwError(client, `Invalid config data: ${errorMessage}`);
      return;
    }

    this.roomSize = result.data.roomSize || this.roomSize;
    console.log("this.roomSize", result.data);
    this.state.config.scoreToWin =
      result.data.scoreToWin || this.state.config.scoreToWin;
    this.state.config.roundTime =
      result.data.roundTime || this.state.config.roundTime;

    // BUG: Try to improve this
    // this.state.config.availableDecks = result.data.availableDecks || this.state.config.availableDecks;
    if (data.availableDecks) {
      const decksSchema = new ArraySchema<DeckSchema>();
      data.availableDecks.forEach((deck: any) => {
        const deckSchema = new DeckSchema();
        Object.assign(deckSchema, deck);
        decksSchema.push(deckSchema);
      });
      this.state.config.availableDecks = decksSchema;
    }
  }

  private handlePlayerSelection(client: Client, selectedCards: any) {}
  private handleRequestNextCard(client: Client) {}
  private handleSeeAllRoundAnswers(client: Client) {}
  private handleJudgeDecision(client: Client, winningPlayerId: string) {}
}
