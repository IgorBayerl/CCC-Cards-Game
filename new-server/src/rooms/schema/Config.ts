import {Schema, type, ArraySchema} from "@colyseus/schema";
import {DeckSchema} from "./Deck";

export class RoomConfigSchema extends Schema {
  @type([DeckSchema]) availableDecks = new ArraySchema<DeckSchema>();
  @type("number") scoreToWin: number = 4;
  @type("number") roundTime: number = 10;
  @type("number") roomSize: number = 4;
}

export type TRoomConfig = typeof RoomConfigSchema.prototype;
