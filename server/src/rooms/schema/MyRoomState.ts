import {Schema, type, MapSchema, ArraySchema} from "@colyseus/schema";
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

  @type(QuestionCardSchema) currentQuestionCard = new QuestionCardSchema();

  //this has no use on the client side, but is used to keep track of the used cards
  @type([QuestionCardSchema]) usedQuestionCards = new ArraySchema<QuestionCardSchema>();
  @type([AnswerCardSchema]) usedAnswerCards = new ArraySchema<AnswerCardSchema>();

  @type("string") leader = "";

  // private _DISCONNECT_TIMEOUT = 10000;
  private _DISCONNECT_TIMEOUT = 1000 * 60 * 2;

  /**
   * Disconnects a player from the room
   */
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
   * Returns an array of players in the room
   */
  public get playersArray() {
    return Array.from(this.players.values());
  }
}

export type TMyRoomState = typeof MyRoomState.prototype;
