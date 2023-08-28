import {IRoomConfig} from "./Room";

export interface IGameConfig extends IRoomConfig {
  scoreToWin: number;
  time: number;
}

export const defaultGameConfig: IGameConfig = {
  roomSize: 8,
  decks: [],
  scoreToWin: 8,
  time: 60,
};
