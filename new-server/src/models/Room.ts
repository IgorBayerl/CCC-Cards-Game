import {IDeckConfigScreen} from "./Deck";

export interface IRoomConfig {
  roomSize: number;
  decks: Array<IDeckConfigScreen>;
}

export type TRoomStatus =
  | "waiting"
  | "starting"
  | "playing"
  | "judging"
  | "results"
  | "finished";
