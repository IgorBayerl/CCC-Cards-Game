import {Schema, type, MapSchema, ArraySchema} from "@colyseus/schema";
import {AnswerCardSchema, QuestionCardSchema} from "./Card";
import {RoomConfigSchema} from "./Config";
import {PlayerSchema} from "./Player";
import {RoundSchema} from "./Round";
import logger from "../../lib/loggerConfig";

type RoomStatus = "waiting" | "starting" | "playing" | "judging" | "results" | "finished";

export class MyRoomState extends Schema {
  //lobby config states
  @type(RoomConfigSchema) config = new RoomConfigSchema();

  //game states
  @type({map: PlayerSchema}) players = new MapSchema<PlayerSchema>();
  @type([RoundSchema]) rounds = new ArraySchema<RoundSchema>();
  @type("string") roomStatus: RoomStatus = "waiting";

  @type("string") judge = "";

  @type(QuestionCardSchema) currentQuestionCard = new QuestionCardSchema();

  @type("string") leader = "";

  //this has no use on the client side, but is used to keep track of the used cards
  public usedQuestionCards: ArraySchema<QuestionCardSchema> = new ArraySchema<QuestionCardSchema>();
  public usedAnswerCards: ArraySchema<AnswerCardSchema> = new ArraySchema<AnswerCardSchema>();

  // private _DISCONNECT_TIMEOUT = 10000;
  private _DISCONNECT_TIMEOUT = 1000 * 15;

  private handleDisconnectInLobby(player: PlayerSchema) {
    player.setAsOffline();
    setTimeout(() => {
      this.players.delete(player.id);
      logger.info(`Player ${player.id} has been removed from the room`);
    }, this._DISCONNECT_TIMEOUT);
  }

  private setNewLeader() {
    const newLeader = this.getNextLeaderId;
    this.leader = newLeader;
    logger.info(`New leader is ${newLeader}`);
  }

  private handleDisconnectInGame(player: PlayerSchema) {
    player.transformIntoBot();
  }

  /**
   * Updates the player ID across all rounds in the game.
   * This method is necessary to handle the scenario where a player reconnects with a new ID,
   * ensuring that their participation and contributions in previous rounds are correctly associated with their new ID.
   *
   * @param oldId The player's old ID.
   * @param newId The player's new ID.
   */
  public updatePlayerIdInRounds(oldId: string, newId: string): void {
    const newPlayer = this.players.get(newId);
    if (!newPlayer) return;

    this.rounds.forEach(round => {
      round.replacePlayerId(oldId, newId);
    });
  }

  /**
   * - When disconnecting mid game the player will became a bot until the end of the round (results/waiting/finished) - `isBot = true` and `isOffline = true`
   * - When the end of the round arrives, the player will be set as `isBot = false` and `isOffline = true`
   * - If the player returns in the same round it will be set as `isBot = false` and `isOffline = false`
   * - If the player returns in the next round it will be set as `isBot = false` and `isOffline = false` and `isWaitingForNextRound = true` - Handle this on reconnect method
   */
  public disconnectPlayer(playerId: string) {
    const player = this.players.get(playerId);
    if (!player) return;

    if (player.id === this.leader) {
      this.setNewLeader();
    }

    // Define the actions for each room status
    const disconnectActions: Record<RoomStatus, () => void> = {
      waiting: () => this.handleDisconnectInLobby(player),
      finished: () => this.handleDisconnectInGame(player),
      starting: () => this.handleDisconnectInGame(player),
      playing: () => this.handleDisconnectInGame(player),
      judging: () => this.handleDisconnectInGame(player),
      results: () => this.handleDisconnectInGame(player),
    };

    // Execute the action based on the current room status
    disconnectActions[this.roomStatus]();
  }

  /**
   * Returns an array of players in the room
   */
  public get playersArray() {
    return Array.from(this.players.values());
  }

  public get onlinePlayersIds() {
    const playersArray = this.playersArray;
    const onlinePlayers = playersArray.filter(player => !player.isOffline);
    return onlinePlayers.map(player => player.id);
  }

  public get getNextJudgeId() {
    const onlinePlayersIds = this.onlinePlayersIds;
    if (onlinePlayersIds.length === 0) return null;
    const currentJudgeIdIndex = onlinePlayersIds.findIndex(id => id === this.judge);
    const nextJudgeIdIndex = currentJudgeIdIndex + 1;
    const nextJudgeId = onlinePlayersIds[nextJudgeIdIndex] || onlinePlayersIds[0];
    return nextJudgeId;
  }

  public get getNextLeaderId() {
    const onlinePlayersIds = this.onlinePlayersIds;
    const currentLeaderIndex = onlinePlayersIds.indexOf(this.leader);
    const nextLeaderIndex = currentLeaderIndex + 1;
    const nextLeaderId = onlinePlayersIds[nextLeaderIndex] || onlinePlayersIds[0];
    return nextLeaderId;
  }

  public get randomOnlinePlayerId() {
    const onlinePlayersIds = this.onlinePlayersIds;
    const randomIndex = Math.floor(Math.random() * onlinePlayersIds.length);
    return onlinePlayersIds[randomIndex];
  }

  public get playersWaitingForNextRound() {
    const players = this.playersArray;
    return players.filter(player => player.isWaitingForNextRound);
  }

  public get thereIsAWinner() {
    for (const [_id, playerData] of this.players) {
      if (playerData.score >= this.config.scoreToWin) {
        return true;
      }
    }
    return false;
  }

  public resetGame() {
    this.clearBotPlayers();
    // reset players points
    this.players.forEach(player => {
      player.resetPlayer();
    });

    // reset rounds to empty array
    this.rounds.clear();

    // reset room status
    this.roomStatus = "waiting";

    // reset judge
    this.judge = "";

    // reset currentQuestionCard
    this.currentQuestionCard = new QuestionCardSchema();

    // reset usedQuestionCards
    this.usedQuestionCards.clear();

    // reset usedAnswerCards
    this.usedAnswerCards.clear();
  }

  public clearBotPlayers() {
    this.players.forEach(player => {
      if (player.isBot && player.isOffline && !player.isWaitingForNextRound) {
        this.players.delete(player.id);
      }
    });
  }
}

export type TMyRoomState = typeof MyRoomState.prototype;
