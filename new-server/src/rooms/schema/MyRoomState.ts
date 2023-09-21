import {Schema, Context, type, MapSchema, ArraySchema} from "@colyseus/schema";
import {AnswerCardSchema, QuestionCardSchema} from "./Card";
import {RoomConfigSchema} from "./Config";
import {PlayerSchema} from "./Player";
import {RoundSchema} from "./Round";


type RoomStatus = "waiting" | "starting" | "playing" | "judging" | "results" | "finished";

export class MyRoomState extends Schema {
  //lobby config states
  @type(RoomConfigSchema) config = new RoomConfigSchema();

  //game states
  @type({map: PlayerSchema}) players = new MapSchema<PlayerSchema>();
  @type([RoundSchema]) rounds = new ArraySchema<RoundSchema>();
  @type("string") roomStatus: RoomStatus = "waiting";

  @type("string") judge = "";

  @type("boolean") isJudgeSelected = false; //TODO: Remove this

  @type(QuestionCardSchema) currentQuestionCard = new QuestionCardSchema();
  @type("boolean") isQuestionCardSelected = false; //TODO: Remove this

  //this has no use on the client side, but is used to keep track of the used cards
  @type([QuestionCardSchema]) usedQuestionCards = new ArraySchema<QuestionCardSchema>();
  @type([AnswerCardSchema]) usedAnswerCards = new ArraySchema<AnswerCardSchema>();

  @type("string") leader = "";

  private _DISCONNECT_TIMEOUT = 10000;

  public disconnectPlayer(playerId: string) {
    // set the player to offline and after 10 seconds remove them from the room

    // get the player
    const player = this.players.get(playerId);
    if (!player) return;

    // set the player to offline
    player.isOffline = true;

    // remove the player after 10 seconds
    setTimeout(() => {
      this.players.delete(playerId);
      console.log(`Player ${playerId} has been removed from the room`);
    }, this._DISCONNECT_TIMEOUT);
  }

  /**
   * Returns a map of all the online players in the room
   */
  public get onlinePlayers() {
    const onlinePlayers = new MapSchema<PlayerSchema>();
    for (const [playerId, player] of this.players.entries()) {
      if (player.isOffline) continue;
      onlinePlayers.set(playerId, player);
    }
    return onlinePlayers; //sometimes this is undefined for some reason
  }

  public get onlinePlayersArray() {
    return Array.from(this.onlinePlayers.values());
  }

  /**
   * Returns a random online player id
   * @example
   * const randomPlayerId = this.state.randomOnlinePlayerId;
   * const randomPlayer = this.state.players.get(randomPlayerId);
   */
  public get randomOnlinePlayerId() {
    const playersArray = this.onlinePlayersArray;
    if (playersArray.length > 0) {
      const randomIndex = Math.floor(Math.random() * playersArray.length);
      return playersArray[randomIndex].id;
    }
  }

  public get nextJudgeId() {
    const playersArray = this.onlinePlayersArray;
    if (playersArray.length > 0) {
      const currentJudgeIndex = playersArray.findIndex(player => player.id === this.judge);
      const nextJudgeIndex = (currentJudgeIndex + 1) % playersArray.length;
      return playersArray[nextJudgeIndex].id;
    }
  }
}

export type TMyRoomState = typeof MyRoomState.prototype;
