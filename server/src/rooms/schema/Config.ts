import {Schema, type, ArraySchema} from "@colyseus/schema";
import {DeckSchema} from "./Deck";

export class RoomConfigSchema extends Schema {
  @type([DeckSchema]) availableDecks = new ArraySchema<DeckSchema>();
  @type("number") scoreToWin: number = 8;
  @type("number") roundTime: number = 20;
  @type("number") roomSize: number = 14;
}

export type TRoomConfig = typeof RoomConfigSchema.prototype;
